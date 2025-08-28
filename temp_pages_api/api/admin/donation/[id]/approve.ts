import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../../lib/database';
import Donation from '../../../../../lib/models/Donation';
import User from '../../../../../lib/models/User';
import { verifyToken } from '../../../../../lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') return res.status(405).json({ success: false, message: 'Method not allowed' });
  try {
    await connectDB();
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
    const decoded = await verifyToken(token);
    if (!decoded) return res.status(401).json({ success: false, message: 'Invalid token' });

    const me = await (User as any).findById(decoded.userId).lean();
    if (!me?.isAdmin) return res.status(403).json({ success: false, message: 'Admin access required' });

    const { id } = req.query;
    const { approve } = req.body;
    const donation = await (Donation as any).findById(id);
    if (!donation) return res.status(404).json({ success: false, message: 'Donation request not found' });

    if (approve === true) {
      // When approved, the donation becomes active for receiving funds
      donation.status = 'active';
    } else {
      donation.status = 'rejected';
    }
    await donation.save();
    res.json({ success: true, message: 'Donation request updated', data: { status: donation.status } });
  } catch (error: any) {
    console.error('Admin donation approve error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
}
