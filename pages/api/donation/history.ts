import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import { DonationPayment } from '../../../lib/models/Donation';
import { verifyToken } from '../../../lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed' });
  try {
    await connectDB();
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ success: false, message: 'Invalid token' });

    const payments = await (DonationPayment as any)
      .find({ sender: decoded.userId })
      .populate('donation', 'purpose requester')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, message: 'Donation history', data: { payments } });
  } catch (error: any) {
    console.error('Donation history error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
}
