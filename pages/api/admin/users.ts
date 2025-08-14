import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import User from '../../../lib/models/User';
import { verifyToken } from '../../../lib/middleware/auth';

function ensureAdmin(decoded: any) {
  return decoded && decoded.userId;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed' });
  try {
    await connectDB();
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
    const decoded = await verifyToken(token);
    if (!decoded) return res.status(401).json({ success: false, message: 'Invalid token' });

    // NOTE: For simplicity, we trust isAdmin flag via DB lookup
    const me = await (User as any).findById(decoded.userId).lean();
    if (!me?.isAdmin) return res.status(403).json({ success: false, message: 'Admin access required' });

    const q = (req.query.q as string) || '';
    const regex = q ? new RegExp(q, 'i') : null;
    const filter: any = regex ? { $or: [{ email: { $regex: regex } }, { username: { $regex: regex } }, { fullName: { $regex: regex } }] } : {};
    const users = await (User as any).find(filter).sort({ createdAt: -1 }).limit(100).lean();
    res.json({ success: true, message: 'Users list', data: { users } });
  } catch (error: any) {
    console.error('Admin users error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
}
