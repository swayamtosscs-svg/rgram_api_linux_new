import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import Donation, { DonationPayment } from '../../../lib/models/Donation';
import { verifyToken } from '../../../lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });
  try {
    await connectDB();
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
    const decoded = await verifyToken(token);
    if (!decoded) return res.status(401).json({ success: false, message: 'Invalid token' });

    const { donationId, amount } = req.body;
    if (!donationId || !amount) return res.status(400).json({ success: false, message: 'donationId and amount are required' });
    const donation = await (Donation as any).findById(donationId);
    if (!donation) return res.status(404).json({ success: false, message: 'Donation request not found' });
    if (!['approved', 'active'].includes(donation.status)) return res.status(400).json({ success: false, message: 'Donation request is not active' });

    await (DonationPayment as any).create({ donation: donationId, sender: decoded.userId, amount });
    donation.raisedAmount += amount;
    donation.supportersCount += 1;
    donation.status = 'active';
    await donation.save();

    res.status(201).json({ success: true, message: 'Donation sent', data: { raisedAmount: donation.raisedAmount, supportersCount: donation.supportersCount } });
  } catch (error: any) {
    console.error('Donation send error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
}
