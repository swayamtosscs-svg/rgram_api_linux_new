import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import Post from '@/lib/models/Post';
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

    const currentUserId = decoded.userId;
    const { page = 1, limit = 10, type } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Get current user's blocked users
    const currentUser = await User.findById(currentUserId).select('blockedUsers').lean();
    const blockedUserIds = currentUser?.blockedUsers || [];

    // Get users that the current user follows (accepted follows only)
    const following = await Follow.find({ 
      follower: currentUserId,
      status: 'accepted'
    }).select('following').lean();

    const followingIds = following.map(f => f.following);

    // If user doesn't follow anyone, return empty feed
    if (followingIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Feed retrieved successfully',
        data: {
          posts: [],
          pagination: {
            currentPage: pageNum,
            totalPages: 0,
            totalPosts: 0,
            hasNextPage: false,
            hasPrevPage: false
          },
          message: 'Follow some users to see their posts in your feed!'
        }
      });
    }

    // Build query filter for posts from followed users (excluding blocked users)
    const filter: any = {
      author: { 
        $in: followingIds,
        $nin: blockedUserIds  // Exclude blocked users
      },
      isActive: true
    };

    if (type && type !== 'all') {
      filter.type = type;
    }

    // Get posts from followed users
    const posts = await Post.find(filter)
      .populate('author', 'username fullName avatar isPrivate religion')
      .populate('likes', 'username fullName avatar')
      .populate('comments.author', 'username fullName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const totalPosts = await Post.countDocuments(filter);
    const totalPages = Math.ceil(totalPosts / limitNum);

    return res.status(200).json({
      success: true,
      message: 'Following feed retrieved successfully',
      data: {
        posts,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalPosts,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        },
        followingCount: followingIds.length
      }
    });

  } catch (error: any) {
    console.error('Get following feed error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
}