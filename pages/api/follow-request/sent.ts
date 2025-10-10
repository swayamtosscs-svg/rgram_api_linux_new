import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import Follow from '@/lib/models/Follow';
import { verifyToken } from '@/lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await connectDB();
    
    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const currentUserId = decoded.userId;
    const { page = 1, limit = 20, status } = req.query;
    
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const skip = (pageNum - 1) * limitNum;

    // Build query for sent requests
    const query: any = { follower: currentUserId };
    
    // Filter by status if provided
    if (status && ['pending', 'accepted', 'rejected'].includes(status as string)) {
      query.status = status;
    }

    // Get follow requests sent by the current user
    const sentRequests = await Follow.find(query)
    .populate('following', 'username fullName avatar bio')
    .sort({ requestedAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .lean();

    // Get total count for pagination
    const totalCount = await Follow.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limitNum);

    return res.status(200).json({
      success: true,
      message: 'Sent follow requests retrieved successfully',
      data: {
        sentRequests,
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
    console.error('Get sent follow requests error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
}
