import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import Notification from '@/lib/models/Notification';
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
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const query: any = { recipient: currentUserId };

    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .populate('sender', 'username fullName avatar')
      .populate('relatedPost', 'content images videos')
      .populate('relatedStory', 'content media')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const totalNotifications = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      recipient: currentUserId, 
      isRead: false 
    });

    const totalPages = Math.ceil(totalNotifications / Number(limit));

    return res.status(200).json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: {
        notifications,
        unreadCount,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalNotifications,
          hasNextPage: Number(page) < totalPages,
          hasPrevPage: Number(page) > 1
        }
      }
    });

  } catch (error: any) {
    console.error('List notifications error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
}
