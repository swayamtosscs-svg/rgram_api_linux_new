import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import Follow from '../../../lib/models/Follow';
import User from '../../../lib/models/User';
import { verifyToken } from '../../../lib/middleware/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return res.status(405).json({ 
      success: false,
      message: 'Method not allowed' 
    });
  }

  try {
    await connectDB();

    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    const { userId } = req.body;
    const followerId = decoded.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Check if user exists
    const userToFollow = await (User as any).findById(userId);
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent self-following
    if (followerId === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot follow yourself'
      });
    }

    if (req.method === 'POST') {
      // Follow user
      try {
        const follow = await (Follow as any).create({
          follower: followerId,
          following: userId
        });

        // Update follower counts
        await (User as any).findByIdAndUpdate(followerId, {
          $inc: { followingCount: 1 }
        });
        await (User as any).findByIdAndUpdate(userId, {
          $inc: { followersCount: 1 }
        });

        res.status(201).json({
          success: true,
          message: 'Successfully followed user',
          data: { follow }
        });
      } catch (error: any) {
        if (error.code === 11000) {
          return res.status(400).json({
            success: false,
            message: 'Already following this user'
          });
        }
        throw error;
      }
    } else if (req.method === 'DELETE') {
      // Unfollow user
      const follow = await (Follow as any).findOneAndDelete({
        follower: followerId,
        following: userId
      });

      if (!follow) {
        return res.status(400).json({
          success: false,
          message: 'Not following this user'
        });
      }

      // Update follower counts
              await (User as any).findByIdAndUpdate(followerId, {
          $inc: { followingCount: -1 }
        });
        await (User as any).findByIdAndUpdate(userId, {
          $inc: { followersCount: -1 }
        });

      res.json({
        success: true,
        message: 'Successfully unfollowed user'
      });
    }
  } catch (error: any) {
    console.error('Follow/Unfollow error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
