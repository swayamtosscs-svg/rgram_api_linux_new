import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import Follow from '../../../lib/models/Follow';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed' });
  try {
    await connectDB();
    const { user_id } = req.query;
    if (!user_id || typeof user_id !== 'string') return res.status(400).json({ success: false, message: 'User ID is required' });
    const following = await (Follow as any)
      .find({ follower: user_id })
      .populate('following', 'username fullName avatar')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, message: 'Following retrieved', data: { following: following.map((f: any) => f.following) } });
  } catch (error: any) {
    console.error('Following list error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
}
