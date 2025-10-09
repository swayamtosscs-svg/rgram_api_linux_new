import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import Donation from '@/lib/models/Donation';
import { verifyToken } from '@/lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed' });
  try {
    await connectDB();
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
    const decoded = await verifyToken(token);
    if (!decoded) return res.status(401).json({ success: false, message: 'Invalid token' });

    const donations = await (Donation as any).find({ requester: decoded.userId }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, message: 'My donation requests', data: { donations } });
  } catch (error: any) {
    console.error('My donations error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
}
