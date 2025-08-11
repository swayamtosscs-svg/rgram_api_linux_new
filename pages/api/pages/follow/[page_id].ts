import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../lib/database';
import Page from '../../../../lib/models/Page';
import PageFollow from '../../../../lib/models/PageFollow';
import { verifyToken } from '../../../../lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.method !== 'DELETE') return res.status(405).json({ success: false, message: 'Method not allowed' });
  try {
    await connectDB();
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ success: false, message: 'Invalid token' });

    const { page_id } = req.query;
    if (!page_id || typeof page_id !== 'string') return res.status(400).json({ success: false, message: 'Page ID is required' });
    const page = await (Page as any).findById(page_id);
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });

    if (req.method === 'POST') {
      try {
        await (PageFollow as any).create({ follower: decoded.userId, page: page_id });
        await (Page as any).findByIdAndUpdate(page_id, { $inc: { followersCount: 1 } });
        return res.status(201).json({ success: true, message: 'Followed page' });
      } catch (e: any) {
        if (e.code === 11000) return res.status(400).json({ success: false, message: 'Already following this page' });
        throw e;
      }
    } else {
      const follow = await (PageFollow as any).findOneAndDelete({ follower: decoded.userId, page: page_id });
      if (!follow) return res.status(400).json({ success: false, message: 'Not following this page' });
      await (Page as any).findByIdAndUpdate(page_id, { $inc: { followersCount: -1 } });
      return res.json({ success: true, message: 'Unfollowed page' });
    }
  } catch (error: any) {
    console.error('Page follow error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
}
