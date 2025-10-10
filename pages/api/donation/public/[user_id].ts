import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../lib/database';
import Donation from '../../../../lib/models/Donation';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed' });
  try {
    await connectDB();
    const { user_id } = req.query;
    if (!user_id || typeof user_id !== 'string') return res.status(400).json({ success: false, message: 'User ID is required' });
    const donation = await (Donation as any).findOne({ requester: user_id, status: { $in: ['approved', 'active'] } }).sort({ createdAt: -1 }).lean();
    if (!donation) return res.status(404).json({ success: false, message: 'No active donation request found' });
    res.json({ success: true, message: 'Donation card', data: { donation } });
  } catch (error: any) {
    console.error('Public donation card error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
}
