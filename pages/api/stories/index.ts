import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import Story from '@/lib/models/Story';
import { verifyToken } from '@/lib/middleware/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ 
      success: false,
      message: 'Method not allowed' 
    });
  }

  try {
    await connectDB();

    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    const userId = decoded.userId;

    if (req.method === 'POST') {
      // Create new story
      const { media, type, caption, mentions, hashtags, location } = req.body;

      if (!media || !type) {
        return res.status(400).json({
          success: false,
          message: 'Media URL and type are required'
        });
      }

      if (!['image', 'video'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Type must be either "image" or "video"'
        });
      }

      const story = await (Story as any).create({
        author: userId,
        media,
        type,
        caption,
        mentions: mentions || [],
        hashtags: hashtags || [],
        location
      });

      res.status(201).json({
        success: true,
        message: 'Story created successfully',
        data: { story }
      });
    } else if (req.method === 'GET') {
      // Get stories from followed users
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const stories = await (Story as any).find({
        isActive: true,
        expiresAt: { $gt: new Date() }
      })
      .populate('author', 'username fullName avatar')
      .populate('mentions', 'username fullName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

      res.json({
        success: true,
        message: 'Stories retrieved successfully',
        data: { stories }
      });
    }
  } catch (error: any) {
    console.error('Stories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
