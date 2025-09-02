import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import Post from '../../../lib/models/Post';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Get only post IDs and basic info
    const posts = await Post.find({ isActive: true })
      .select('_id content author createdAt')
      .populate('author', 'username fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalPosts = await Post.countDocuments({ isActive: true });
    const totalPages = Math.ceil(totalPosts / limit);

    // Format response with just IDs and basic info
    const postIds = posts.map(post => ({
      postId: post._id,
      content: post.content,
      author: post.author,
      createdAt: post.createdAt
    }));

    res.json({
      success: true,
      message: 'Post IDs retrieved successfully',
      data: {
        posts: postIds,
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
    console.error('Post IDs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
