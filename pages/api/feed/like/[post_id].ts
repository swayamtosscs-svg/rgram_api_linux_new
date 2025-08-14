import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../lib/database';
import Post from '../../../../lib/models/Post';
import { verifyToken } from '../../../../lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });
  try {
    await connectDB();
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
    const decoded = await verifyToken(token);
    if (!decoded) return res.status(401).json({ success: false, message: 'Invalid token' });

    const { post_id } = req.query;
    if (!post_id || typeof post_id !== 'string') return res.status(400).json({ success: false, message: 'Post ID is required' });

    const post = await (Post as any).findById(post_id);
    if (!post || !post.isActive) return res.status(404).json({ success: false, message: 'Post not found' });

    const userId = decoded.userId;
    const isLiked = post.likes.map((id: any) => id.toString()).includes(userId);
    if (isLiked) {
      await post.removeLike(userId);
      return res.json({ success: true, message: 'Unliked', data: { likesCount: post.likesCount } });
    } else {
      await post.addLike(userId);
      return res.json({ success: true, message: 'Liked', data: { likesCount: post.likesCount } });
    }
  } catch (error: any) {
    console.error('Like post error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
}
