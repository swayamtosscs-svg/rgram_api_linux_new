import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import Comment from '../../../models/Comment';
import User from '@/lib/models/User';
import Notification from '@/lib/models/Notification';
import { verifyToken } from '@/lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const userId = decoded.userId;

    switch (req.method) {
      case 'POST':
        return await handleCommentInteraction(req, res, userId);
      case 'GET':
        return await getCommentInteractions(req, res, userId);
      default:
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Comment interactions error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
}

// Handle Comment Interactions (like, unlike)
async function handleCommentInteraction(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { commentId } = req.query;
    const { action } = req.body;

    if (!commentId) {
      return res.status(400).json({
        success: false,
        message: 'Comment ID is required'
      });
    }

    if (!action) {
      return res.status(400).json({
        success: false,
        message: 'Action is required'
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

    // Check if comment is active
    if (!comment.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Comment is not accessible'
      });
    }

    let result: any = {};

    switch (action) {
      case 'like':
        result = await handleCommentLike(comment, userId);
        break;
      case 'unlike':
        result = await handleCommentUnlike(comment, userId);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action. Must be one of: like, unlike'
        });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data
    });

  } catch (error: any) {
    console.error('Handle comment interaction error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to handle comment interaction',
      error: error.message
    });
  }
}

// Handle Comment Like
async function handleCommentLike(comment: any, userId: string) {
  try {
    const isAlreadyLiked = comment.likes.includes(userId);
    if (isAlreadyLiked) {
      return {
        message: 'Comment already liked',
        data: { liked: true, likesCount: comment.likesCount }
      };
    }

    // Add like
    await comment.addLike(userId);

    // Send notification to comment author (if not self)
    if (comment.author.toString() !== userId) {
      const liker = await User.findById(userId).select('username fullName');
      await Notification.create({
        recipient: comment.author,
        sender: userId,
        type: 'like',
        content: `${liker?.username || 'Someone'} liked your comment`,
        relatedComment: comment._id
      });
    }

    return {
      message: 'Comment liked successfully',
      data: { liked: true, likesCount: comment.likesCount + 1 }
    };

  } catch (error: any) {
    throw new Error(`Comment like error: ${error.message}`);
  }
}

// Handle Comment Unlike
async function handleCommentUnlike(comment: any, userId: string) {
  try {
    const isLiked = comment.likes.includes(userId);
    if (!isLiked) {
      return {
        message: 'Comment not liked',
        data: { liked: false, likesCount: comment.likesCount }
      };
    }

    // Remove like
    await comment.removeLike(userId);

    return {
      message: 'Comment unliked successfully',
      data: { liked: false, likesCount: comment.likesCount - 1 }
    };

  } catch (error: any) {
    throw new Error(`Comment unlike error: ${error.message}`);
  }
}

// Get Comment Interactions
async function getCommentInteractions(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { commentId, type } = req.query;

    if (!commentId) {
      return res.status(400).json({
        success: false,
        message: 'Comment ID is required'
      });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    let data: any = {};

    switch (type) {
      case 'likes':
        const likes = await User.find({ _id: { $in: comment.likes } })
          .select('username fullName avatar')
          .limit(50);
        data = { likes, count: comment.likesCount };
        break;
      case 'replies':
        const replies = await Comment.find({ 
          parentComment: commentId, 
          isActive: true 
        })
        .populate('author', 'username fullName avatar')
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();
        data = { replies, count: comment.repliesCount };
        break;
      default:
        // Return all interaction counts
        data = {
          likesCount: comment.likesCount,
          repliesCount: comment.repliesCount,
          userLiked: comment.likes.includes(userId)
        };
    }

    return res.status(200).json({
      success: true,
      message: 'Comment interactions retrieved successfully',
      data
    });

  } catch (error: any) {
    console.error('Get comment interactions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve comment interactions',
      error: error.message
    });
  }
}

