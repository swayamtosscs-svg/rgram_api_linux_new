import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../lib/database';
import Page from '../../../../lib/models/Page';
import User from '../../../../lib/models/User';
import { verifyToken } from '../../../../lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') return res.status(405).json({ success: false, message: 'Method not allowed' });
  try {
    await connectDB();
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ success: false, message: 'Invalid token' });

    const me = await (User as any).findById(decoded.userId).lean();
    if (!me?.isAdmin) return res.status(403).json({ success: false, message: 'Admin access required' });

    const { id } = req.query;
    const { approve } = req.body;
    const page = await (Page as any).findById(id);
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });

    if (approve === true) {
      page.isVerified = true;
      (page as any).verificationRequest = { ...(page as any).verificationRequest, status: 'approved', reviewedAt: new Date() };
    } else {
      page.isVerified = false;
      (page as any).verificationRequest = { ...(page as any).verificationRequest, status: 'rejected', reviewedAt: new Date() };
    }
    await page.save();

    res.json({ success: true, message: 'Page verification updated', data: { isVerified: page.isVerified } });
  } catch (error: any) {
    console.error('Admin verify page error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
}
