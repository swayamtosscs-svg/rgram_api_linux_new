import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import User from '@/lib/models/User';
import Post from '@/lib/models/Post';
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

    const { q, type, page = 1, limit = 10 } = req.query;
    const searchQuery = q as string;
    const searchType = type as string;

    if (!searchQuery || searchQuery.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    if (searchType === 'users' || !searchType) {
      // Search users
      const users = await (User as any).find({
        $or: [
          { username: { $regex: searchQuery, $options: 'i' } },
          { fullName: { $regex: searchQuery, $options: 'i' } }
        ],
        isActive: true
      })
      .select('username fullName avatar bio followersCount followingCount postsCount')
      .sort({ followersCount: -1, username: 1 })
      .skip(skip)
      .limit(parseInt(limit as string))
      .lean();

      const totalUsers = await (User as any).countDocuments({
        $or: [
          { username: { $regex: searchQuery, $options: 'i' } },
          { fullName: { $regex: searchQuery, $options: 'i' } }
        ],
        isActive: true
      });

      res.json({
        success: true,
        message: 'Users found successfully',
        data: {
          users,
          pagination: {
            currentPage: parseInt(page as string),
            totalPages: Math.ceil(totalUsers / parseInt(limit as string)),
            totalResults: totalUsers,
            hasNextPage: parseInt(page as string) < Math.ceil(totalUsers / parseInt(limit as string)),
            hasPrevPage: parseInt(page as string) > 1
          }
        }
      });
    } else if (searchType === 'posts') {
      // Search posts
      const posts = await (Post as any).find({
        $or: [
          { content: { $regex: searchQuery, $options: 'i' } },
          { 'comments.content': { $regex: searchQuery, $options: 'i' } }
        ],
        isActive: true
      })
      .populate('author', 'username fullName avatar')
      .populate('likes', 'username fullName avatar')
      .populate('comments.author', 'username fullName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string))
      .lean();

      const totalPosts = await (Post as any).countDocuments({
        $or: [
          { content: { $regex: searchQuery, $options: 'i' } },
          { 'comments.content': { $regex: searchQuery, $options: 'i' } }
        ],
        isActive: true
      });

      res.json({
        success: true,
        message: 'Posts found successfully',
        data: {
          posts,
          pagination: {
            currentPage: parseInt(page as string),
            totalPages: Math.ceil(totalPosts / parseInt(limit as string)),
            totalResults: totalPosts,
            hasNextPage: parseInt(page as string) < Math.ceil(totalPosts / parseInt(limit as string)),
            hasPrevPage: parseInt(page as string) > 1
          }
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid search type. Use "users" or "posts"'
      });
    }
  } catch (error: any) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
