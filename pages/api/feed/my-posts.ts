import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import Post from '@/lib/models/Post';
import User from '@/lib/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Get userId from query parameter or header
    const userId = req.query.userId as string || req.headers['x-user-id'] as string;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'userId is required. Provide it as query parameter ?userId=123 or header x-user-id: 123' 
      });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Get posts from current user only
    const posts = await Post.find({
      author: userId,
      isActive: true
    })
    .populate('author', 'username fullName avatar religion isPrivate')
    .populate('likes', 'username fullName avatar')
    .populate('comments.author', 'username fullName avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

    // Get total count for pagination
    const totalPosts = await Post.countDocuments({
      author: userId,
      isActive: true
    });

    const totalPages = Math.ceil(totalPosts / limit);

    res.json({
      success: true,
      message: 'My posts retrieved successfully',
      data: {
        posts,
        pagination: {
          currentPage: page,
          totalPages,
          totalPosts,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit: limit
        }
      }
    });

  } catch (error: any) {
    console.error('My posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
