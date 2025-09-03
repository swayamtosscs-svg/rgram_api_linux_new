import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import Follow from '../../../lib/models/Follow';
import User from '../../../lib/models/User';
import Notification from '../../../lib/models/Notification';
import { verifyToken } from '../../../lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await connectDB();
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const { user_id } = req.query;
    if (!user_id || typeof user_id !== 'string') {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const followerId = decoded.userId;
    if (followerId === user_id) {
      return res.status(400).json({ success: false, message: 'Cannot follow yourself' });
    }

    const userToFollow = await User.findById(user_id);
    if (!userToFollow) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.method === 'POST') {
      console.log('Follow request for user:', user_id, 'by follower:', followerId);
      
      // Check if already following or request already sent
      const existingFollow = await Follow.findOne({
        follower: followerId,
        following: user_id
      });

      console.log('Existing follow record:', existingFollow);

      if (existingFollow) {
        if (existingFollow.status === 'accepted') {
          return res.status(400).json({ 
            success: false, 
            message: 'Already following this user',
            debug: {
              followId: existingFollow._id,
              status: existingFollow.status,
              createdAt: existingFollow.createdAt
            }
          });
        } else if (existingFollow.status === 'pending') {
          return res.status(400).json({ success: false, message: 'Follow request already sent' });
        } else if (existingFollow.status === 'rejected') {
          // Update rejected request to pending
          existingFollow.status = 'pending';
          existingFollow.requestedAt = new Date();
          existingFollow.respondedAt = undefined;
          await existingFollow.save();
          
          return res.status(200).json({ 
            success: true, 
            message: 'Follow request sent successfully',
            data: { followRequest: existingFollow }
          });
        }
      }

              // If user is private, create pending follow request
        if (userToFollow.isPrivate) {
          const followRequest = await Follow.create({
            follower: followerId,
            following: user_id,
            status: 'pending',
            requestedAt: new Date()
          });

          // Create notification
          await Notification.create({
            recipient: user_id,
            sender: followerId,
            type: 'follow'
          });

          await followRequest.populate('follower', 'username fullName avatar');
          await followRequest.populate('following', 'username fullName avatar');

          return res.status(201).json({
            success: true,
            message: 'Follow request sent successfully (private account)',
            data: { followRequest }
          });
      } else {
        // If user is public, follow directly
        try {
          await Follow.create({
            follower: followerId,
            following: user_id,
            status: 'accepted',
            requestedAt: new Date(),
            respondedAt: new Date()
          });
        } catch (e: any) {
          if (e.code === 11000) {
            return res.status(400).json({ success: false, message: 'Already following this user' });
          }
          throw e;
        }

        // Create notification
        await Notification.create({
          recipient: user_id,
          sender: followerId,
          type: 'follow'
        });

        // Update user counts
        await User.findByIdAndUpdate(followerId, { $inc: { followingCount: 1 } });
        await User.findByIdAndUpdate(user_id, { $inc: { followersCount: 1 } });

        return res.status(201).json({ 
          success: true, 
          message: 'Successfully followed user' 
        });
      }
    } else {
      // Handle unfollow - completely rewritten logic
      console.log('Unfollow request for user:', user_id, 'by follower:', followerId);
      
      // Check if user exists
      const targetUser = await User.findById(user_id);
      console.log('Target user exists:', !!targetUser);
      
      // Get all follow records for debugging
      const allFollows = await Follow.find({ follower: followerId });
      const allFollowers = await Follow.find({ following: user_id });
      
      console.log('All follows by this user:', allFollows.length);
      console.log('All followers of target user:', allFollowers.length);
      console.log('All follows details:', allFollows.map(f => ({
        id: f._id,
        follower: f.follower.toString(),
        following: f.following.toString(),
        status: f.status
      })));
      
      // Try to find the follow record using multiple methods
      let follow = null;
      
      // Method 1: Direct query
      follow = await Follow.findOne({ 
        follower: followerId, 
        following: user_id
      });
      
      // Method 2: If not found, check all follows and find manually
      if (!follow) {
        follow = allFollows.find(f => 
          f.following.toString() === user_id.toString()
        );
        console.log('Found follow record manually:', follow);
      }
      
      // Method 3: If still not found, try to find by checking all followers
      if (!follow) {
        follow = allFollowers.find(f => 
          f.follower.toString() === followerId.toString()
        );
        console.log('Found follow record in followers:', follow);
      }
      
      // Method 4: Last resort - try to find any record with these IDs
      if (!follow) {
        const mongoose = require('mongoose');
        const allRecords = await Follow.find({
          $or: [
            { follower: followerId, following: user_id },
            { follower: user_id, following: followerId },
            { follower: followerId.toString(), following: user_id.toString() },
            { follower: user_id.toString(), following: followerId.toString() }
          ]
        });
        follow = allRecords[0];
        console.log('Found follow record with OR query:', follow);
      }
      
      if (!follow) {
        return res.status(400).json({ 
          success: false, 
          message: 'Not following this user',
          debug: {
            userId: user_id,
            followerId: followerId,
            totalFollows: allFollows.length,
            totalFollowers: allFollowers.length,
            targetUserExists: !!targetUser,
            allFollowsDetails: allFollows.map(f => ({
              id: f._id,
              follower: f.follower.toString(),
              following: f.following.toString(),
              status: f.status
            })),
            allFollowersDetails: allFollowers.map(f => ({
              id: f._id,
              follower: f.follower.toString(),
              following: f.following.toString(),
              status: f.status
            }))
          }
        });
      }
      
      // Delete the follow record
      const deleteResult = await Follow.findByIdAndDelete(follow._id);
      console.log('Delete result:', deleteResult);
      
      // Update user counts only if it was an accepted follow
      if (follow.status === 'accepted') {
        await User.findByIdAndUpdate(followerId, { $inc: { followingCount: -1 } });
        await User.findByIdAndUpdate(user_id, { $inc: { followersCount: -1 } });
        console.log('Updated user counts');
      }
      
      return res.json({ 
        success: true, 
        message: 'Successfully unfollowed user',
        debug: {
          deletedStatus: follow.status,
          userId: user_id,
          followId: follow._id,
          deleteResult: !!deleteResult
        }
      });
    }
  } catch (error: any) {
    console.error('Follow endpoint error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
}
