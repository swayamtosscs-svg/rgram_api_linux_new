import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import Post from '../../../lib/models/Post';
import User from '../../../lib/models/User';
import { verifyToken } from '../../../lib/middleware/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await connectDB();

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Post ID is required'
      });
    }

    if (req.method === 'GET') {
      // Get specific post
      const post = await (Post as any).findById(id)
        .populate('author', 'username fullName avatar')
        .populate('comments.author', 'username fullName avatar');

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }

      if (!post.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Post not available'
        });
      }

      res.json({
        success: true,
        message: 'Post retrieved successfully',
        data: { post }
      });
    } else if (req.method === 'PUT') {
      // Update post
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Access token required'
        });
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }

      const post = await (Post as any).findById(id);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }

      // Check if user owns the post
      if (post.author.toString() !== decoded.userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only edit your own posts'
        });
      }

      const { content, images } = req.body;

      // Validation
      if (!content && (!images || images.length === 0)) {
        return res.status(400).json({
          success: false,
          message: 'Post must have content or images'
        });
      }

      if (content && content.length > 2000) {
        return res.status(400).json({
          success: false,
          message: 'Content must be less than 2000 characters'
        });
      }

      // Update post
      const updatedPost = await (Post as any).findByIdAndUpdate(
        id,
        {
          content: content?.trim(),
          images: images || [],
          updatedAt: new Date()
        },
        { new: true }
      ).populate('author', 'username fullName avatar');

      res.json({
        success: true,
        message: 'Post updated successfully',
        data: { post: updatedPost }
      });
    } else if (req.method === 'DELETE') {
      // Delete post
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Access token required'
        });
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }

      const post = await (Post as any).findById(id);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }

      // Check if user owns the post
      if (post.author.toString() !== decoded.userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own posts'
        });
      }

      // Soft delete - mark as inactive
      await (Post as any).findByIdAndUpdate(id, { 
        isActive: false,
        deletedAt: new Date()
      });

      // Update user's post count
      await (User as any).findByIdAndUpdate(decoded.userId, {
        $inc: { postsCount: -1 }
      });

      res.json({
        success: true,
        message: 'Post deleted successfully'
      });
    } else {
      return res.status(405).json({ 
        success: false,
        message: 'Method not allowed' 
      });
    }
  } catch (error: any) {
    console.error('Post error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
