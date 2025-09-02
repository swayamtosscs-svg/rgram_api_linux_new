import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import Comment from '../../../lib/models/Comment';
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

    // Get user info
    const user = await User.findById(userId).select('fullName email avatar');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { content, postId, parentCommentId, mediaType } = req.body;

    // Validate required fields
    if (!content || !postId) {
      return res.status(400).json({
        success: false,
        message: 'Content and postId are required'
      });
    }

    if (content.length < 1 || content.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Comment must be between 1 and 1000 characters'
      });
    }

    // Validate parentCommentId if provided
    let validParentCommentId = null;
    if (parentCommentId) {
      // Check if it's a valid ObjectId format (24 hex characters)
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(parentCommentId);
      
      if (!isValidObjectId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid parent comment ID format. Must be a valid MongoDB ObjectId (24 characters)'
        });
      }
      
      // Check if parent comment exists
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(400).json({
          success: false,
          message: 'Parent comment not found'
        });
      }
      validParentCommentId = parentCommentId;
    }

    // Create comment
    const comment = new Comment({
      content: content.trim(),
      author: userId,
      postId,
      parentCommentId: validParentCommentId,
      mediaType: mediaType || 'post',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await comment.save();

    // Populate author info
    await comment.populate('author', 'fullName email avatar');

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      comment: {
        _id: comment._id,
        content: comment.content,
        author: {
          _id: user._id,
          name: user.fullName,
          email: user.email,
          profilePicture: user.avatar
        },
        postId: comment.postId,
        parentCommentId: comment.parentCommentId,
        mediaType: comment.mediaType,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        likes: 0,
        replies: 0
      }
    });

  } catch (error: any) {
    console.error('Send comment error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
