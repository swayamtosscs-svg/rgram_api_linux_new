import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import Follow from '../../../lib/models/Follow';
import User from '../../../lib/models/User';
import { verifyToken } from '../../../lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.method !== 'DELETE') return res.status(405).json({ success: false, message: 'Method not allowed' });
  try {
    await connectDB();
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
    const decoded = await verifyToken(token);
    if (!decoded) return res.status(401).json({ success: false, message: 'Invalid token' });

    const { user_id } = req.query;
    if (!user_id || typeof user_id !== 'string') return res.status(400).json({ success: false, message: 'User ID is required' });

    const followerId = decoded.userId;
    if (followerId === user_id) return res.status(400).json({ success: false, message: 'Cannot follow yourself' });

    const userToFollow = await (User as any).findById(user_id);
    if (!userToFollow) return res.status(404).json({ success: false, message: 'User not found' });

    if (req.method === 'POST') {
      try {
        await (Follow as any).create({ follower: followerId, following: user_id });
      } catch (e: any) {
        if (e.code === 11000) return res.status(400).json({ success: false, message: 'Already following this user' });
        throw e;
      }
      await (User as any).findByIdAndUpdate(followerId, { $inc: { followingCount: 1 } });
      await (User as any).findByIdAndUpdate(user_id, { $inc: { followersCount: 1 } });
      return res.status(201).json({ success: true, message: 'Successfully followed user' });
    } else {
      const follow = await (Follow as any).findOneAndDelete({ follower: followerId, following: user_id });
      if (!follow) return res.status(400).json({ success: false, message: 'Not following this user' });
      await (User as any).findByIdAndUpdate(followerId, { $inc: { followingCount: -1 } });
      await (User as any).findByIdAndUpdate(user_id, { $inc: { followersCount: -1 } });
      return res.json({ success: true, message: 'Successfully unfollowed user' });
    }
  } catch (error: any) {
    console.error('Follow endpoint error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
}
