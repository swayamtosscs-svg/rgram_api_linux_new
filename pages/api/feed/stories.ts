import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import Story from '@/lib/models/Story';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed' });
  try {
    await connectDB();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const stories = await (Story as any)
      .find({ isActive: true, expiresAt: { $gt: new Date() } })
      .populate('author', 'username fullName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({ success: true, message: 'Stories retrieved successfully', data: { stories } });
  } catch (error: any) {
    console.error('Feed stories error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
}
