import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import User from '../../../lib/models/User';
import Story from '../../../lib/models/Story';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed' });
  try {
    await connectDB();
    const q = (req.query.q as string) || '';
    if (!q || q.trim().length < 2) return res.status(400).json({ success: false, message: 'Query must be at least 2 characters' });
    const regex = new RegExp(q, 'i');

    const [users, stories] = await Promise.all([
      (User as any).find({ location: { $regex: regex } }).select('username fullName avatar location').limit(20).lean(),
      (Story as any).find({ location: { $regex: regex } }).select('location').limit(20).lean()
    ]);

    const suggestions = Array.from(new Set([
      ...users.map((u: any) => u.location).filter(Boolean),
      ...stories.map((s: any) => s.location).filter(Boolean)
    ]));

    res.json({ success: true, message: 'Locations found', data: { suggestions } });
  } catch (error: any) {
    console.error('Location search error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
}
