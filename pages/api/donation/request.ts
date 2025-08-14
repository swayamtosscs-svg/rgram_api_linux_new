import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import Donation from '../../../lib/models/Donation';
import { verifyToken } from '../../../lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });
  try {
    await connectDB();
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
    const decoded = await verifyToken(token);
    if (!decoded) return res.status(401).json({ success: false, message: 'Invalid token' });

    const { purpose, goalAmount } = req.body;
    if (!purpose || !goalAmount) return res.status(400).json({ success: false, message: 'purpose and goalAmount are required' });

    const donation = await (Donation as any).create({ requester: decoded.userId, purpose, goalAmount, status: 'pending' });
    res.status(201).json({ success: true, message: 'Donation request submitted', data: { donation } });
  } catch (error: any) {
    console.error('Donation request error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
}
