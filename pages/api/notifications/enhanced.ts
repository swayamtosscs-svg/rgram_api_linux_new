import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import Notification from '../../../lib/models/Notification';
import { verifyToken } from '../../../lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const decoded = await verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  switch (req.method) {
    case 'GET':
      return getNotifications(req, res, decoded.userId);
    case 'PUT':
      return markAsRead(req, res, decoded.userId);
    case 'DELETE':
      return deleteNotification(req, res, decoded.userId);
    default:
      return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}

// Get Notifications
async function getNotifications(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const query: any = { recipient: userId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const notifications = await Notification.find(query)
      .populate('sender', 'username fullName avatar')
      .populate('relatedPost', 'content type')
      .populate('relatedStory', 'content type')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });

    return res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalItems: total,
          itemsPerPage: Number(limit),
          hasNextPage: Number(page) < Math.ceil(total / Number(limit)),
          hasPrevPage: Number(page) > 1
        }
      }
    });

  } catch (error: any) {
    console.error('Get notifications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Mark Notifications as Read
async function markAsRead(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { notificationIds, markAll = false } = req.body;

    if (markAll) {
      await Notification.updateMany(
        { recipient: userId, isRead: false },
        { isRead: true }
      );
    } else if (notificationIds && Array.isArray(notificationIds)) {
      await Notification.updateMany(
        { _id: { $in: notificationIds }, recipient: userId },
        { isRead: true }
      );
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either markAll or notificationIds array is required'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Notifications marked as read'
    });

  } catch (error: any) {
    console.error('Mark as read error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Delete Notification
async function deleteNotification(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { notificationId } = req.query;

    if (!notificationId) {
      return res.status(400).json({
        success: false,
        message: 'Notification ID is required'
      });
    }

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete notification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
