import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import LiveComment from '../../../lib/models/LiveComment';
import LiveStream from '../../../lib/models/LiveStream';
import User from '../../../lib/models/User';
import { verifyToken } from '../../../lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    await connectDB();

    switch (method) {
      case 'GET':
        return await getComments(req, res);
      case 'POST':
        return await createComment(req, res);
      case 'PUT':
        return await updateComment(req, res);
      case 'DELETE':
        return await deleteComment(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Live comment operation error:', error);
    res.status(500).json({ 
      error: 'Failed to perform live comment operation',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function getComments(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { streamId, page = '1', limit = '50', parentComment } = req.query;

    if (!streamId) {
      return res.status(400).json({ error: 'Stream ID is required' });
    }

    // Check if stream exists and is active
    const liveStream = await LiveStream.findById(streamId);
    if (!liveStream) {
      return res.status(404).json({ error: 'Live stream not found' });
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter: any = {
      streamId,
      isDeleted: false
    };

    if (parentComment) {
      filter.parentComment = parentComment;
    } else {
      // Only top-level comments (no parent)
      filter.parentComment = { $exists: false };
    }

    // Get comments
    const [comments, total] = await Promise.all([
      LiveComment.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      LiveComment.countDocuments(filter)
    ]);

    // Calculate pagination
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      success: true,
      data: {
        comments: comments.map(comment => ({
          commentId: comment._id,
          streamId: comment.streamId,
          userId: comment.userId,
          username: comment.username,
          userAvatar: comment.userAvatar,
          message: comment.message,
          timestamp: comment.timestamp,
          likes: comment.likes,
          replies: comment.replies,
          parentComment: comment.parentComment,
          isHighlighted: comment.isHighlighted,
          isPinned: comment.isPinned
        })),
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: total,
          itemsPerPage: limitNum,
          hasNextPage,
          hasPrevPage
        }
      }
    });

  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ 
      error: 'Failed to get comments',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function createComment(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authentication token required' });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const { streamId, message, parentComment } = req.body;

    if (!streamId || !message) {
      return res.status(400).json({ error: 'Stream ID and message are required' });
    }

    // Check if stream exists and is active
    const liveStream = await LiveStream.findById(streamId);
    if (!liveStream) {
      return res.status(404).json({ error: 'Live stream not found' });
    }

    // Check if stream allows comments
    if (!liveStream.settings.enableComments) {
      return res.status(400).json({ error: 'Comments are disabled for this stream' });
    }

    // Check if stream is live or ended (allow comments on ended streams)
    if (liveStream.status === 'pending' || liveStream.status === 'cancelled') {
      return res.status(400).json({ error: 'Cannot comment on inactive stream' });
    }

    // Get user information from database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create comment
    const comment = new LiveComment({
      streamId,
      userId: decoded.userId,
      username: user.username || user.email || 'Anonymous',
      userAvatar: user.avatar || null,
      message: message.trim(),
      parentComment: parentComment || undefined
    });

    await comment.save();

    // Update comment count on live stream
    await LiveStream.findByIdAndUpdate(streamId, {
      $inc: { comments: 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Comment posted successfully',
      data: {
        commentId: comment._id,
        streamId: comment.streamId,
        userId: comment.userId,
        username: comment.username,
        userAvatar: comment.userAvatar,
        message: comment.message,
        timestamp: comment.timestamp,
        parentComment: comment.parentComment
      }
    });

  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ 
      error: 'Failed to create comment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function updateComment(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authentication token required' });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const { commentId, message } = req.body;

    if (!commentId || !message) {
      return res.status(400).json({ error: 'Comment ID and message are required' });
    }

    // Find comment
    const comment = await LiveComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user owns the comment
    if (comment.userId !== decoded.userId) {
      return res.status(403).json({ error: 'You can only edit your own comments' });
    }

    // Update comment
    comment.message = message.trim();
    await comment.save();

    res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      data: {
        commentId: comment._id,
        message: comment.message,
        updatedAt: comment.updatedAt
      }
    });

  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ 
      error: 'Failed to update comment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function deleteComment(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authentication token required' });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const { commentId } = req.body;

    if (!commentId) {
      return res.status(400).json({ error: 'Comment ID is required' });
    }

    // Find comment
    const comment = await LiveComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user owns the comment or is stream owner
    const liveStream = await LiveStream.findById(comment.streamId);
    const isStreamOwner = liveStream && liveStream.userId === decoded.userId;
    
    if (comment.userId !== decoded.userId && !isStreamOwner) {
      return res.status(403).json({ error: 'You can only delete your own comments' });
    }

    // Soft delete comment
    comment.isDeleted = true;
    comment.deletedAt = new Date();
    comment.deletedBy = decoded.userId;
    await comment.save();

    // Update comment count on live stream
    await LiveStream.findByIdAndUpdate(comment.streamId, {
      $inc: { comments: -1 }
    });

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });

  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ 
      error: 'Failed to delete comment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
