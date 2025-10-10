import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import Post from '@/lib/models/Post';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/middleware/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await connectDB();

    if (req.method === 'GET') {
      // Get all posts with pagination
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const posts = await (Post as any).find({ isActive: true })
        .populate('author', 'username fullName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const totalPosts = await (Post as any).countDocuments({ isActive: true });
      const totalPages = Math.ceil(totalPosts / limit);

      res.json({
        success: true,
        message: 'Posts retrieved successfully',
        data: {
          posts,
          pagination: {
            currentPage: page,
            totalPages,
            totalPosts,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        }
      });
    } else if (req.method === 'POST') {
      // Create new post
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Access token required'
        });
      }

      const decoded = await verifyToken(token);
      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }

      const { content, images, type = 'post' } = req.body;

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

      // Create post
      const post = await (Post as any).create({
        author: decoded.userId,
        content: content?.trim(),
        images: images || [],
        type,
        isActive: true,
        createdAt: new Date()
      });

      // Update user's post count
      await (User as any).findByIdAndUpdate(decoded.userId, {
        $inc: { postsCount: 1 }
      });

      // Populate author info
      await post.populate('author', 'username fullName avatar');

      res.status(201).json({
        success: true,
        message: 'Post created successfully',
        data: { post }
      });
    } else {
      return res.status(405).json({ 
        success: false,
        message: 'Method not allowed' 
      });
    }
  } catch (error: any) {
    console.error('Posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
