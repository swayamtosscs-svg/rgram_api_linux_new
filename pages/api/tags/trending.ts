import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import Post from '@/lib/models/Post';
import Story from '@/lib/models/Story';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed' });
  try {
    await connectDB();
    const sinceHours = parseInt((req.query.sinceHours as string) || '72');
    const since = new Date(Date.now() - sinceHours * 60 * 60 * 1000);
    const hashtagRegex = /#(\w+)/g;

    const posts = await (Post as any).find({ isActive: true, createdAt: { $gte: since } }).select('content').lean();
    const stories = await (Story as any).find({ isActive: true, createdAt: { $gte: since } }).select('hashtags').lean();

    const counts: Record<string, number> = {};

    for (const p of posts) {
      const content: string = p.content || '';
      const tags = content.match(hashtagRegex) || [];
      for (const t of tags) counts[t.toLowerCase()] = (counts[t.toLowerCase()] || 0) + 1;
    }
    for (const s of stories) {
      const tags: string[] = s.hashtags || [];
      for (const t of tags) counts[`#${t.toLowerCase()}`] = (counts[`#${t.toLowerCase()}`] || 0) + 1;
    }

    const trending = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50)
      .map(([tag, count]) => ({ tag, count }));

    res.json({ success: true, message: 'Trending hashtags', data: { trending } });
  } catch (error: any) {
    console.error('Trending tags error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
}
