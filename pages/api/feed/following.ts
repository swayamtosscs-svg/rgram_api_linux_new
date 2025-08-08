import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import Follow from '../../../lib/models/Follow';
import Post from '../../../lib/models/Post';
import { verifyToken } from '../../../lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed' });
  try {
    await connectDB();
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ success: false, message: 'Invalid token' });

    const follows = await (Follow as any).find({ follower: decoded.userId }).select('following').lean();
    const followingIds = follows.map((f: any) => f.following);

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const posts = await (Post as any)
      .find({ isActive: true, author: { $in: followingIds } })
      .populate('author', 'username fullName avatar religion')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    const totalPosts = await (Post as any).countDocuments({ isActive: true, author: { $in: followingIds } });

    res.json({ success: true, message: 'Following feed retrieved', data: { posts, pagination: { currentPage: page, totalPages: Math.ceil(totalPosts / limit), totalPosts, hasNextPage: page < Math.ceil(totalPosts / limit), hasPrevPage: page > 1 } } });
  } catch (error: any) {
    console.error('Following feed error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
}
