import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import Post from '../../../lib/models/Post';
import User from '../../../lib/models/User';
import { verifyToken } from '../../../lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await connectDB();

    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const { links = [], title, description, category = 'general', religion = '' } = req.body;

    if (!Array.isArray(links) || links.length === 0) {
      return res.status(400).json({ success: false, message: 'links must be a non-empty array' });
    }

    const normalize = (url: string) => (typeof url === 'string' ? url.trim() : '').replace(/^<|>$/g, '');

    const postsToInsert: any[] = [];

    for (const raw of links) {
      const link = normalize(raw);
      if (!link) continue;

      let provider: 'youtube' | 'vimeo' | 'external' = 'external';
      const lower = link.toLowerCase();
      if (lower.includes('youtube.com') || lower.includes('youtu.be')) provider = 'youtube';
      else if (lower.includes('vimeo.com')) provider = 'vimeo';

      postsToInsert.push({
        author: decoded.userId,
        content: description?.trim() || '',
        images: [],
        videos: [],
        externalUrls: [link],
        type: 'video',
        provider,
        title: title?.trim(),
        description: description?.trim(),
        category,
        religion: religion?.trim(),
        isActive: true,
        createdAt: new Date()
      });
    }

    if (postsToInsert.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid links provided' });
    }

    const inserted = await (Post as any).insertMany(postsToInsert);
    await (User as any).findByIdAndUpdate(decoded.userId, { $inc: { videosCount: inserted.length } });

    res.status(201).json({
      success: true,
      message: 'Video links added',
      data: inserted
    });
  } catch (error: any) {
    console.error('Add video links error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
