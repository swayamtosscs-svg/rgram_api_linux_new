import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import Post from '@/lib/models/Post';
import User from '@/lib/models/User';
import Follow from '@/lib/models/Follow';
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
    const { page = 1, limit = 10, type } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Check if target user exists
    const targetUser = await User.findById(targetUserId).select('isPrivate username fullName');
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if current user can view target user's posts
    const canViewUserPosts = await checkUserPostsVisibility(targetUserId, currentUserId);
    
    if (!canViewUserPosts) {
      // Return empty posts array with privacy message
      return res.status(200).json({
        success: true,
        message: 'Posts retrieved successfully',
        data: {
          posts: [],
          pagination: {
            currentPage: pageNum,
            totalPages: 0,
            totalPosts: 0,
            hasNextPage: false,
            hasPrevPage: false
          },
          privacyInfo: {
            isPrivateAccount: targetUser.isPrivate,
            message: targetUser.isPrivate 
              ? `This account is private. Follow ${targetUser.fullName || targetUser.username} to see their posts.`
              : 'You do not have permission to view these posts.'
          }
        }
      });
    }

    // Build query filter
    const filter: any = { 
      author: targetUserId, 
      isActive: true 
    };
    
    if (type && type !== 'all') {
      filter.type = type;
    }

    // Get posts
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
      message: 'Posts retrieved successfully',
      data: {
        posts,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalPosts,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        },
        privacyInfo: {
          isPrivateAccount: targetUser.isPrivate,
          canViewPosts: true
        }
      }
    });

  } catch (error: any) {
    console.error('Get user posts error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
}

// Helper function to check if user can view another user's posts
async function checkUserPostsVisibility(targetUserId: string, currentUserId: string): Promise<boolean> {
  // User can always view their own posts
  if (targetUserId === currentUserId) {
    return true;
  }

  // Check if target user is private
  const targetUser = await User.findById(targetUserId).select('isPrivate');
  if (!targetUser) {
    return false;
  }

  // Public users' posts can be viewed by anyone
  if (!targetUser.isPrivate) {
    return true;
  }

  // Private users' posts can only be viewed by followers
  const followRelationship = await Follow.findOne({
    follower: currentUserId,
    following: targetUserId,
    status: 'accepted'
  });

  return !!followRelationship;
}

