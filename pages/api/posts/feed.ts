import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import Post from '@/lib/models/Post';
import Follow from '@/lib/models/Follow';
import { verifyToken } from '@/lib/middleware/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
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

    const userId = decoded.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Get users that the current user follows
    const following = await (Follow as any).find({ follower: userId })
      .select('following')
      .lean();

    interface FollowDoc {
      following: string;
    }
    const followingIds = following.map((f: FollowDoc) => f.following);

    // Get posts from followed users and current user
    const posts = await (Post as any).find({
      author: { $in: [...followingIds, userId] },
      isActive: true
    })
    .populate('author', 'username fullName avatar isPrivate')
    .populate('likes', 'username fullName avatar')
    .populate('comments.author', 'username fullName avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

    // Get total count for pagination
    const totalPosts = await (Post as any).countDocuments({
      author: { $in: [...followingIds, userId] },
      isActive: true
    });

    const totalPages = Math.ceil(totalPosts / limit);

    res.json({
      success: true,
      message: 'Feed retrieved successfully',
      data: {
        posts,
        pagination: {
          currentPage: page,
          totalPages,
          totalPosts,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error: any) {
    console.error('Feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
