import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import Notification from '../../../lib/models/Notification';
import { verifyToken } from '../../../lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  try {
    await connectDB();
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ success: false, message: 'Invalid token' });
    const { notificationIds } = req.body;
    if (notificationIds && Array.isArray(notificationIds)) {
      await (Notification as any).updateMany({ _id: { $in: notificationIds }, recipient: decoded.userId }, { isRead: true });
    } else {
      await (Notification as any).updateMany({ recipient: decoded.userId, isRead: false }, { isRead: true });
    }
    res.json({ success: true, message: 'Notifications marked as read' });
  } catch (error: any) {
    console.error('Notifications mark-read error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
}
