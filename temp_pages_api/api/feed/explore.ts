import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import Post from '../../../lib/models/Post';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed' });
  try {
    await connectDB();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const type = (req.query.type as string) || undefined; // 'post' | 'reel'
    const q = (req.query.q as string) || '';

    const filter: any = { isActive: true };
    if (type && ['post', 'reel'].includes(type)) filter.type = type;
    if (q) filter.content = { $regex: q, $options: 'i' };

    const posts = await (Post as any)
      .find(filter)
      .populate('author', 'username fullName avatar religion')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    const totalPosts = await (Post as any).countDocuments(filter);
    res.json({ success: true, message: 'Explore feed retrieved', data: { posts, pagination: { currentPage: page, totalPages: Math.ceil(totalPosts / limit), totalPosts, hasNextPage: page < Math.ceil(totalPosts / limit), hasPrevPage: page > 1 } } });
  } catch (error: any) {
    console.error('Explore feed error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
}
