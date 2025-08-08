import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import Page from '../../../lib/models/Page';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed' });
  try {
    await connectDB();
    const { page_id } = req.query;
    if (!page_id || typeof page_id !== 'string') return res.status(400).json({ success: false, message: 'Page ID is required' });
    const page = await (Page as any).findById(page_id).populate('owner', 'username fullName avatar').lean();
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    res.json({ success: true, message: 'Page details', data: { page } });
  } catch (error: any) {
    console.error('Get page error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
}
