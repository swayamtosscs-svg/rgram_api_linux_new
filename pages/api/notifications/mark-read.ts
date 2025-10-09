import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import Notification from '@/lib/models/Notification';
import { verifyToken } from '@/lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
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
    const { notificationId, notificationIds, markAll = false } = req.body;

    if (markAll) {
      // Mark all notifications as read
      await Notification.updateMany(
        { recipient: currentUserId, isRead: false },
        { isRead: true }
      );

      return res.status(200).json({
        success: true,
        message: 'All notifications marked as read'
      });
    } else if (notificationIds && Array.isArray(notificationIds) && notificationIds.length > 0) {
      // Mark multiple notifications as read
      const result = await Notification.updateMany(
        { 
          _id: { $in: notificationIds }, 
          recipient: currentUserId 
        },
        { isRead: true }
      );

      return res.status(200).json({
        success: true,
        message: `${result.modifiedCount} notifications marked as read`,
        data: { modifiedCount: result.modifiedCount }
      });
    } else if (notificationId) {
      // Mark single notification as read
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: currentUserId },
        { isRead: true },
        { new: true }
      );

      if (!notification) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
      }

      return res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        data: { notification }
      });
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Notification ID(s) or markAll flag is required' 
      });
    }

  } catch (error: any) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
}
