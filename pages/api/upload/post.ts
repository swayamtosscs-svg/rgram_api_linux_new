import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import Post from '../../../lib/models/Post';
import User from '../../../lib/models/User';
import { verifyToken } from '../../../lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });
  try {
    await connectDB();
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ success: false, message: 'Invalid token' });

    const { content, images = [] } = req.body;
    if (!content && (!images || images.length === 0)) return res.status(400).json({ success: false, message: 'Post must have content or images' });
    if (content && content.length > 2000) return res.status(400).json({ success: false, message: 'Content must be less than 2000 characters' });

    const post = await (Post as any).create({ author: decoded.userId, content: content?.trim(), images, type: 'post', isActive: true, createdAt: new Date() });
    await (User as any).findByIdAndUpdate(decoded.userId, { $inc: { postsCount: 1 } });
    await post.populate('author', 'username fullName avatar');
    res.status(201).json({ success: true, message: 'Post uploaded', data: { post } });
  } catch (error: any) {
    console.error('Upload post error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
}
