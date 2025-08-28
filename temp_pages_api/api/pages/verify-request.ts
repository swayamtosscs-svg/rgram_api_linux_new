import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import Page from '../../../lib/models/Page';
import { verifyToken } from '../../../lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });
  try {
    await connectDB();
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
    const decoded = await verifyToken(token);
    if (!decoded) return res.status(401).json({ success: false, message: 'Invalid token' });

    const { pageId, note } = req.body;
    if (!pageId) return res.status(400).json({ success: false, message: 'pageId is required' });
    const page = await (Page as any).findById(pageId);
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    if (page.owner.toString() !== decoded.userId) return res.status(403).json({ success: false, message: 'Only the owner can request verification' });

    page.verificationRequest = { note, status: 'pending', submittedAt: new Date() } as any;
    page.isVerified = false;
    await page.save();
    res.json({ success: true, message: 'Page verification request submitted', data: { status: page.verificationRequest.status } });
  } catch (error: any) {
    console.error('Page verify-request error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
}
