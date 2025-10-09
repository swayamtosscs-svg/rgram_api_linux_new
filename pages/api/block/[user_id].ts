import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import User from '@/lib/models/User';
import Follow from '@/lib/models/Follow';
import Notification from '@/lib/models/Notification';
import { verifyToken } from '@/lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.method !== 'DELETE') {
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

    const { user_id } = req.query;
    if (!user_id || typeof user_id !== 'string') {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const blockerId = decoded.userId;
    
    // Prevent self-blocking
    if (blockerId === user_id) {
      return res.status(400).json({ success: false, message: 'Cannot block yourself' });
    }

    // Check if user to block exists
    const userToBlock = await User.findById(user_id);
    if (!userToBlock) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const blocker = await User.findById(blockerId);
    if (!blocker) {
      return res.status(404).json({ success: false, message: 'Blocker not found' });
    }

    if (req.method === 'POST') {
      // Block user
      
      // Check if already blocked
      if (blocker.blockedUsers.some(id => id.toString() === userToBlock._id.toString())) {
        return res.status(400).json({ success: false, message: 'User is already blocked' });
      }

      // Add user to blocked list
      await User.findByIdAndUpdate(blockerId, {
        $addToSet: { blockedUsers: userToBlock._id }
      });

      // Remove any existing follow relationships (both directions)
      const followRelations = await Follow.find({
        $or: [
          { follower: blockerId, following: user_id },
          { follower: user_id, following: blockerId }
        ]
      });

      if (followRelations.length > 0) {
        // Update follower counts before deleting
        for (const follow of followRelations) {
          if (follow.status === 'accepted') {
            if (follow.follower.toString() === blockerId) {
              // Blocker was following the blocked user
              await User.findByIdAndUpdate(blockerId, { $inc: { followingCount: -1 } });
              await User.findByIdAndUpdate(user_id, { $inc: { followersCount: -1 } });
            } else {
              // Blocked user was following the blocker
              await User.findByIdAndUpdate(user_id, { $inc: { followingCount: -1 } });
              await User.findByIdAndUpdate(blockerId, { $inc: { followersCount: -1 } });
            }
          }
        }

        // Delete all follow relationships
        await Follow.deleteMany({
          $or: [
            { follower: blockerId, following: user_id },
            { follower: user_id, following: blockerId }
          ]
        });
      }

      // Create notification for blocked user
      await Notification.create({
        recipient: user_id,
        sender: blockerId,
        type: 'block',
        content: `${blocker.fullName || blocker.username} blocked you`
      });

      return res.status(200).json({
        success: true,
        message: 'User blocked successfully',
        data: {
          blockedUserId: user_id,
          blockedUserName: userToBlock.fullName || userToBlock.username
        }
      });

    } else if (req.method === 'DELETE') {
      // Unblock user
      
      // Check if user is blocked
      if (!blocker.blockedUsers.some(id => id.toString() === userToBlock._id.toString())) {
        return res.status(400).json({ success: false, message: 'User is not blocked' });
      }

      // Remove user from blocked list
      await User.findByIdAndUpdate(blockerId, {
        $pull: { blockedUsers: userToBlock._id }
      });

      // Create notification for unblocked user
      await Notification.create({
        recipient: user_id,
        sender: blockerId,
        type: 'unblock',
        content: `${blocker.fullName || blocker.username} unblocked you`
      });

      return res.status(200).json({
        success: true,
        message: 'User unblocked successfully',
        data: {
          unblockedUserId: user_id,
          unblockedUserName: userToBlock.fullName || userToBlock.username
        }
      });
    }

  } catch (error: any) {
    console.error('Block/Unblock error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}


