import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import Post from '../../../lib/models/Post';
import User from '../../../lib/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
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

    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ 
        success: false, 
        message: 'content is required in request body' 
      });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Create new post
    const post = new Post({
      content: content,
      author: userId,
      likes: [],
      comments: [],
      isActive: true
    });

    await post.save();

    // Populate the post with author info
    await post.populate('author', 'username fullName avatar');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: {
        post: {
          _id: post._id,
          content: post.content,
          author: post.author,
          likes: post.likes,
          likeCount: post.likes.length,
          comments: post.comments,
          commentCount: post.comments.length,
          createdAt: post.createdAt,
          isActive: post.isActive
        }
      }
    });

  } catch (error: any) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}


