import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import FriendRequest from '../../../lib/models/FriendRequest';
import { verifyToken } from '../../../lib/middleware/auth';

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
    const { type = 'received', status, page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const query: any = {};

    if (type === 'received') {
      query.recipient = currentUserId;
    } else if (type === 'sent') {
      query.sender = currentUserId;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid type parameter' });
    }

    if (status && ['pending', 'accepted', 'rejected'].includes(status as string)) {
      query.status = status;
    }

    const friendRequests = await FriendRequest.find(query)
      .populate('sender', 'username fullName avatar')
      .populate('recipient', 'username fullName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const totalRequests = await FriendRequest.countDocuments(query);

    const totalPages = Math.ceil(totalRequests / Number(limit));

    return res.status(200).json({
      success: true,
      message: 'Friend requests retrieved successfully',
      data: {
        friendRequests,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalRequests,
          hasNextPage: Number(page) < totalPages,
          hasPrevPage: Number(page) > 1
        }
      }
    });

  } catch (error: any) {
    console.error('List friend requests error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
}
