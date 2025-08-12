import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import Post from '../../../lib/models/Post';
import '../../../lib/models/User'; // Import User model to register it with Mongoose
import { verifyToken } from '../../../lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await connectDB();
    
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Video ID is required' });
    }

    // Special case for fetch-religious-reels - redirect to religious-reels endpoint
    if (id === 'fetch-religious-reels') {
      // Extract other query parameters
      const { religion, category, page, limit } = req.query;
      
      // Build query for religious videos/reels
      const query: any = {
        $or: [
          { type: 'video' },
          { type: 'reel' }
        ],
        isActive: true
      };

      // Filter by religion if provided
      if (religion && religion !== 'all') {
        query.religion = religion;
      }

      // Filter by category if provided
      if (category) {
        query.category = category;
      }

      // Get religious videos/reels with pagination
      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 10;
      const skip = (pageNum - 1) * limitNum;
      
      const religiousContent = await (Post as any)
        .find(query)
        .populate('author', 'username fullName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();

      // Get total count for pagination
      const total = await (Post as any).countDocuments(query);

      // Calculate pagination info
      const totalPages = Math.ceil(total / limitNum);
      const hasNextPage = pageNum < totalPages;
      const hasPrevPage = pageNum > 1;

      return res.json({
        success: true,
        message: 'Religious reels fetched successfully',
        data: {
          religiousContent,
          religion: religion || 'all',
          category: category || 'all',
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalContent: total,
            hasNextPage,
            hasPrevPage,
            limit: limitNum
          }
        }
      });
    }

    // Get video with author details
    const video = await (Post as any)
      .findOne({
        _id: id,
        type: 'video',
        isActive: true
      })
      .populate('author', 'username fullName avatar bio followersCount followingCount')
      .lean();

    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    // Get related videos (same category, excluding current video)
    const relatedVideos = await (Post as any)
      .find({
        _id: { $ne: id },
        type: 'video',
        category: video.category,
        isActive: true
      })
      .populate('author', 'username fullName avatar')
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    // Get user's like status if authenticated
    let isLiked = false;
    let isSaved = false;
    
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        isLiked = video.likes.includes(decoded.userId);
        isSaved = video.saves.includes(decoded.userId);
      }
    }

    res.json({
      success: true,
      message: 'Video details fetched successfully',
      data: {
        video: {
          ...video,
          isLiked,
          isSaved
        },
        relatedVideos
      }
    });

  } catch (error: any) {
    console.error('Fetch video details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
