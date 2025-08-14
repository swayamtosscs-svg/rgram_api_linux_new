import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import { ChatThread } from '../../../lib/models/Chat';
import { verifyToken } from '../../../lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed' });
  try {
    await connectDB();
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
    const decoded = await verifyToken(token);
    if (!decoded) return res.status(401).json({ success: false, message: 'Invalid token' });

    const threads = await (ChatThread as any)
      .find({ participants: decoded.userId })
      .populate('participants', 'username fullName avatar')
      .sort({ lastMessageAt: -1 })
      .lean();
    res.json({ success: true, message: 'Chat threads', data: { threads } });
  } catch (error: any) {
    console.error('Chat list error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
}
