import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../../../lib/middleware/auth';
import connectDB from '../../../lib/database';
import User from '../../../lib/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed' });
  try {
    await connectDB();
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ success: false, message: 'Invalid token' });
    const me = await (User as any).findById(decoded.userId).lean();
    if (!me?.isAdmin) return res.status(403).json({ success: false, message: 'Admin access required' });
    res.json({ success: true, message: 'Reports list', data: { reports: [] } });
  } catch (error: any) {
    console.error('Admin reports error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
}
