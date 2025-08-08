import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../lib/database';
import Page from '../../../../lib/models/Page';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed' });
  try {
    await connectDB();
    const { page_id } = req.query;
    if (!page_id || typeof page_id !== 'string') return res.status(400).json({ success: false, message: 'Page ID is required' });
    const page = await (Page as any).findById(page_id).lean();
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    // Placeholder: No separate page posts implemented
    res.json({ success: true, message: 'Page feed', data: { posts: [] } });
  } catch (error: any) {
    console.error('Page feed error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
}
