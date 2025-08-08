import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import Notification from '../../../lib/models/Notification';
import { verifyToken } from '../../../lib/middleware/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET' && req.method !== 'PUT') {
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

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    const userId = decoded.userId;

    if (req.method === 'GET') {
      // Get notifications
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const notifications = await (Notification as any).find({ recipient: userId })
        .populate('sender', 'username fullName avatar')
        .populate('post', 'content images')
        .populate('story', 'media caption')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

            const totalNotifications = await (Notification as any).countDocuments({ recipient: userId });
      const unreadCount = await (Notification as any).countDocuments({
        recipient: userId,
        isRead: false
      });

      res.json({
        success: true,
        message: 'Notifications retrieved successfully',
        data: {
          notifications,
          unreadCount,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalNotifications / limit),
            totalNotifications,
            hasNextPage: page < Math.ceil(totalNotifications / limit),
            hasPrevPage: page > 1
          }
        }
      });
    } else if (req.method === 'PUT') {
      // Mark notifications as read
      const { notificationIds } = req.body;

      if (notificationIds && Array.isArray(notificationIds)) {
        // Mark specific notifications as read
                await (Notification as any).updateMany(
          {
            _id: { $in: notificationIds },
            recipient: userId
          },
          { isRead: true }
        );
      } else {
        // Mark all notifications as read
        await (Notification as any).updateMany(
          { recipient: userId, isRead: false },
          { isRead: true }
        );
      }

      res.json({
        success: true,
        message: 'Notifications marked as read'
      });
    }
  } catch (error: any) {
    console.error('Notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
