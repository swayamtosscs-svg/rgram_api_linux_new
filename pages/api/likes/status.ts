import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import User from '@/lib/models/User';
import Like from '@/lib/models/Like';
import { verifyToken } from '@/lib/middleware/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false,
      message: 'Method not allowed' 
    });
  }

  try {
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

    await connectDB();

    // Get user info
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const { contentType, contentId } = req.query;

    // Validation
    if (!contentType || !contentId) {
      return res.status(400).json({
        success: false,
        message: 'Content type and content ID are required'
      });
    }

    if (!['post', 'video', 'reel', 'story', 'userAsset'].includes(contentType as string)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid content type. Must be: post, video, reel, story, or userAsset'
      });
    }

    // Check if user has liked this content
    const existingLike = await Like.findOne({
      userId: user._id,
      contentType,
      contentId
    });

    res.status(200).json({
      success: true,
      data: {
        contentType,
        contentId,
        userId: user._id,
        isLiked: !!existingLike,
        likeId: existingLike?._id || null,
        likedAt: existingLike?.createdAt || null
      }
    });

  } catch (error: any) {
    console.error('Check like status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
