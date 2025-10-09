import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import Follow from '@/lib/models/Follow';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await connectDB();
    
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const currentUserId = decoded.userId;
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Get pending follow requests for the current user
    const pendingRequests = await Follow.find({
      following: currentUserId,
      status: 'pending'
    })
    .populate('follower', 'username fullName avatar bio isPrivate')
    .sort({ requestedAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

    const totalPendingRequests = await Follow.countDocuments({
      following: currentUserId,
      status: 'pending'
    });

    const totalPages = Math.ceil(totalPendingRequests / Number(limit));

    return res.status(200).json({
      success: true,
      message: 'Pending follow requests retrieved successfully',
      data: {
        pendingRequests,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalRequests: totalPendingRequests,
          hasNextPage: Number(page) < totalPages,
          hasPrevPage: Number(page) > 1
        }
      }
    });

  } catch (error: any) {
    console.error('Get pending follow requests error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
}

