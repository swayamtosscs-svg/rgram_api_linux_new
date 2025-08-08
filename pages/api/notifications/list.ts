import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import Notification from '../../../lib/models/Notification';
import { verifyToken } from '../../../lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
  try {
    await connectDB();
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ success: false, message: 'Invalid token' });
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const [notifications, totalNotifications, unreadCount] = await Promise.all([
      (Notification as any)
        .find({ recipient: decoded.userId })
        .populate('sender', 'username fullName avatar')
        .populate('post', 'content images')
        .populate('story', 'media caption')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      (Notification as any).countDocuments({ recipient: decoded.userId }),
      (Notification as any).countDocuments({ recipient: decoded.userId, isRead: false })
    ]);
    res.json({ success: true, message: 'Notifications retrieved successfully', data: { notifications, unreadCount, pagination: { currentPage: page, totalPages: Math.ceil(totalNotifications / limit), totalNotifications, hasNextPage: page < Math.ceil(totalNotifications / limit), hasPrevPage: page > 1 } } });
  } catch (error: any) {
    console.error('Notifications list error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
}
