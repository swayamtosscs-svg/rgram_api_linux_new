import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import Comment from '../../../lib/models/Comment';
import User from '../../../lib/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
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

    const { commentId } = req.query;
    const { content } = req.body;

    // Validate required fields
    if (!commentId) {
      return res.status(400).json({
        success: false,
        message: 'commentId is required'
      });
    }

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }

    if (content.length < 1 || content.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Comment must be between 1 and 1000 characters'
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

    // Check if user is the author
    if (comment.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own comments'
      });
    }

    // Update the comment
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      {
        content: content.trim(),
        updatedAt: new Date()
      },
      { new: true }
    ).populate('author', 'fullName email avatar');

    res.json({
      success: true,
      message: 'Comment updated successfully',
      comment: {
        _id: updatedComment._id,
        content: updatedComment.content,
        author: updatedComment.author,
        postId: updatedComment.postId,
        parentCommentId: updatedComment.parentCommentId,
        mediaType: updatedComment.mediaType,
        createdAt: updatedComment.createdAt,
        updatedAt: updatedComment.updatedAt,
        likes: updatedComment.likes || 0
      }
    });

  } catch (error: any) {
    console.error('Update comment error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
