import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../lib/database';
import Page from '../../../../lib/models/Page';
import { verifyToken } from '../../../../lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') return res.status(405).json({ success: false, message: 'Method not allowed' });
  try {
    await connectDB();
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
    const decoded = await verifyToken(token);
    if (!decoded) return res.status(401).json({ success: false, message: 'Invalid token' });

    const { page_id } = req.query;
    if (!page_id || typeof page_id !== 'string') return res.status(400).json({ success: false, message: 'Page ID is required' });

    const page = await (Page as any).findById(page_id);
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    if (page.owner.toString() !== decoded.userId) return res.status(403).json({ success: false, message: 'You can only update your own page' });

    const { name, description, religion, avatar, cover } = req.body;
    page.name = name ?? page.name;
    page.description = description ?? page.description;
    page.religion = religion ?? page.religion;
    page.avatar = avatar ?? page.avatar;
    page.cover = cover ?? page.cover;
    await page.save();

    res.json({ success: true, message: 'Page updated', data: { page } });
  } catch (error: any) {
    console.error('Update page error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
}
