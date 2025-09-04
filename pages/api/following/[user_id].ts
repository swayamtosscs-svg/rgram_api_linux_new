import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import Follow from '../../../lib/models/Follow';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  
  try {
    await connectDB();
    const { user_id, userId } = req.query;
    const targetUserId = user_id || userId;
    if (!targetUserId || typeof targetUserId !== 'string') {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const skip = (pageNum - 1) * limitNum;

    // Only get accepted following relationships
    const following = await Follow.find({ 
      follower: targetUserId,
      status: 'accepted'
    })
    .populate('following', 'username fullName avatar bio')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .lean();

    // Get total count for pagination
    const totalCount = await Follow.countDocuments({ 
      follower: targetUserId,
      status: 'accepted'
    });
    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({ 
      success: true, 
      message: 'Following retrieved', 
      data: { 
        following: following.map((f: any) => f.following),
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error: any) {
    console.error('Following list error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
}
