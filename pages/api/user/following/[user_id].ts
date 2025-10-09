import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import Follow from '@/lib/models/Follow';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
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

    const currentUserId = decoded.userId;
    const targetUserId = user_id;
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Check if target user exists
    const targetUser = await User.findById(targetUserId).select('isPrivate username fullName');
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isOwnProfile = currentUserId === targetUserId;

    // Check if current user can view following list
    let canViewFollowing = true;
    if (!isOwnProfile && targetUser.isPrivate) {
      // For private accounts, only followers can see the following list
      const followRelationship = await Follow.findOne({
        follower: currentUserId,
        following: targetUserId,
        status: 'accepted'
      });
      canViewFollowing = !!followRelationship;
    }

    if (!canViewFollowing) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this user\'s following list'
      });
    }

    // Get following (accepted follows only)
    const following = await Follow.find({
      follower: targetUserId,
      status: 'accepted'
    })
    .populate('following', 'username fullName avatar bio isPrivate isVerified')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .lean();

    const totalFollowing = await Follow.countDocuments({
      follower: targetUserId,
      status: 'accepted'
    });

    const totalPages = Math.ceil(totalFollowing / limitNum);

    // Check if current user follows each user in the following list
    const followingIds = following.map(f => f.following._id);
    const currentUserFollows = await Follow.find({
      follower: currentUserId,
      following: { $in: followingIds },
      status: 'accepted'
    }).select('following').lean();

    const currentUserFollowsIds = currentUserFollows.map(f => f.following.toString());

    // Add follow status to each user
    const followingWithStatus = following.map(follow => ({
      ...follow,
      isFollowing: currentUserFollowsIds.includes(follow.following._id.toString())
    }));

    return res.status(200).json({
      success: true,
      message: 'Following retrieved successfully',
      data: {
        following: followingWithStatus,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalFollowing,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });

  } catch (error: any) {
    console.error('Get following error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
}

