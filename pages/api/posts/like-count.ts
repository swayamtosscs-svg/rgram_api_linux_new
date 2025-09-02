import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import Post from '../../../lib/models/Post';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { postId } = req.query;

    if (!postId) {
      return res.status(400).json({ 
        success: false, 
        message: 'postId is required as query parameter' 
      });
    }

    // Get post with likes populated
    const post = await Post.findById(postId)
      .populate('likes', 'username fullName avatar')
      .select('likes content author createdAt')
      .lean();

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    res.json({
      success: true,
      message: 'Like count retrieved successfully',
      data: {
        postId: post._id,
        likeCount: post.likes.length,
        likes: post.likes,
        content: post.content,
        author: post.author,
        createdAt: post.createdAt
      }
    });

  } catch (error: any) {
    console.error('Like count error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
