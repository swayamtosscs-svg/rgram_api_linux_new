import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import Comment from '@/lib/models/Comment';
import User from '@/lib/models/User';

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

    const { commentId } = req.body;

    // Validate commentId
    if (!commentId) {
      return res.status(400).json({
        success: false,
        message: 'commentId is required'
      });
    }

    // Find the comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user already liked this comment
    const isLiked = comment.likes && comment.likes.includes(userId);

    let updatedComment;
    if (isLiked) {
      // Unlike the comment
      updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        { $pull: { likes: userId } },
        { new: true }
      );
    } else {
      // Like the comment
      updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        { $addToSet: { likes: userId } },
        { new: true }
      );
    }

    res.json({
      success: true,
      message: isLiked ? 'Comment unliked successfully' : 'Comment liked successfully',
      data: {
        commentId: commentId,
        isLiked: !isLiked,
        likesCount: updatedComment.likes ? updatedComment.likes.length : 0
      }
    });

  } catch (error: any) {
    console.error('Like comment error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
