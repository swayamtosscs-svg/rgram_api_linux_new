import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import Follow from '@/lib/models/Follow';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await connectDB();
    
    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const { targetUserId } = req.body;
    if (!targetUserId) {
      return res.status(400).json({ success: false, message: 'Target user ID is required' });
    }

    const followerId = decoded.userId;
    
    // Debug logging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('Debug info:', {
        followerId,
        targetUserId,
        followerIdType: typeof followerId,
        targetUserIdType: typeof targetUserId,
        areEqual: followerId === targetUserId
      });
    }
    
    // Check if trying to follow self
    if (followerId === targetUserId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot follow yourself',
        debug: process.env.NODE_ENV === 'development' ? {
          followerId,
          targetUserId
        } : undefined
      });
    }

    // Check if target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Target user not found' });
    }

    // Check if already following or request already sent
    const existingFollow = await Follow.findOne({
      follower: followerId,
      following: targetUserId
    });

    if (existingFollow) {
      if (existingFollow.status === 'accepted') {
        return res.status(400).json({ success: false, message: 'Already following this user' });
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

    // Create new follow request
    const followRequest = await Follow.create({
      follower: followerId,
      following: targetUserId,
      status: 'pending',
      requestedAt: new Date()
    });

    // Populate user details for response
    await followRequest.populate('follower', 'username fullName avatar');
    await followRequest.populate('following', 'username fullName avatar');

    return res.status(201).json({
      success: true,
      message: 'Follow request sent successfully',
      data: { followRequest }
    });

  } catch (error: any) {
    console.error('Send follow request error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
}
