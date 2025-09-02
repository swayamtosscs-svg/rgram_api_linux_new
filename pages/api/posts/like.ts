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

    const { postId } = req.body;

    if (!postId) {
      return res.status(400).json({ 
        success: false, 
        message: 'postId is required in request body' 
      });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check if user already liked the post
    const isAlreadyLiked = post.likes.includes(userId);

    let updatedPost;
    let action;

    if (isAlreadyLiked) {
      // Unlike the post
      updatedPost = await Post.findByIdAndUpdate(
        postId,
        { $pull: { likes: userId } },
        { new: true }
      ).populate('author', 'username fullName avatar religion isPrivate')
       .populate('likes', 'username fullName avatar')
       .populate('comments.author', 'username fullName avatar');
      
      action = 'unliked';
    } else {
      // Like the post
      updatedPost = await Post.findByIdAndUpdate(
        postId,
        { $addToSet: { likes: userId } },
        { new: true }
      ).populate('author', 'username fullName avatar religion isPrivate')
       .populate('likes', 'username fullName avatar')
       .populate('comments.author', 'username fullName avatar');
      
      action = 'liked';
    }

    if (!updatedPost) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update post' 
      });
    }

    res.json({
      success: true,
      message: `Post ${action} successfully`,
      data: {
        post: {
          _id: updatedPost._id,
          content: updatedPost.content,
          author: updatedPost.author,
          likes: updatedPost.likes,
          likeCount: updatedPost.likes.length,
          comments: updatedPost.comments,
          commentCount: updatedPost.comments.length,
          createdAt: updatedPost.createdAt,
          updatedAt: updatedPost.updatedAt,
          isActive: updatedPost.isActive
        },
        action: action,
        isLiked: !isAlreadyLiked,
        likeCount: updatedPost.likes.length
      }
    });

  } catch (error: any) {
    console.error('Post like error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
