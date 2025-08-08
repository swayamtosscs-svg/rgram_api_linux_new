import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import Story from '../../../lib/models/Story';
import { verifyToken } from '../../../lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });
  try {
    await connectDB();
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ success: false, message: 'Invalid token' });

    const { media, type, caption, mentions = [], hashtags = [], location } = req.body;
    if (!media || !type) return res.status(400).json({ success: false, message: 'Media URL and type are required' });
    if (!['image', 'video'].includes(type)) return res.status(400).json({ success: false, message: 'Type must be either "image" or "video"' });

    const story = await (Story as any).create({ author: decoded.userId, media, type, caption, mentions, hashtags, location });
    res.status(201).json({ success: true, message: 'Story uploaded', data: { story } });
  } catch (error: any) {
    console.error('Upload story error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
}
