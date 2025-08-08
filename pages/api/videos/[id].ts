import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import Post from '../../../lib/models/Post';
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
