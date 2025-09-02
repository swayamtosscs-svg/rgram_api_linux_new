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

    // Get all posts with likes populated
    const posts = await Post.find({ isActive: true })
      .populate('author', 'username fullName avatar religion isPrivate')
      .populate('likes', 'username fullName avatar')
      .populate('comments.author', 'username fullName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalPosts = await Post.countDocuments({ isActive: true });
    const totalPages = Math.ceil(totalPosts / limit);

    // Format posts with like counts
    const postsWithLikeCounts = posts.map(post => ({
      _id: post._id,
      content: post.content,
      author: post.author,
      likes: post.likes,
      likeCount: post.likes.length,
      comments: post.comments,
      commentCount: post.comments.length,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      isActive: post.isActive
    }));

    res.json({
      success: true,
      message: 'Posts with like counts retrieved successfully',
      data: {
        posts: postsWithLikeCounts,
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
    console.error('Posts with likes error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
