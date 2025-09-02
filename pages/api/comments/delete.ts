import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import Comment from '../../../lib/models/Comment';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
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

    // Check if user is the author
    const isAuthor = comment.author.toString() === userId;

    if (!isAuthor) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own comments'
      });
    }

    // Delete the comment and all its replies
    const deleteResult = await Comment.deleteMany({
      $or: [
        { _id: commentId },
        { parentCommentId: commentId }
      ]
    });

    res.json({
      success: true,
      message: 'Comment and replies deleted successfully',
      data: {
        deletedCount: deleteResult.deletedCount,
        commentId: commentId
      }
    });

  } catch (error: any) {
    console.error('Delete comment error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
