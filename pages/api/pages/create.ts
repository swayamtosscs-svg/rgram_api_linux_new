import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import Page from '../../../lib/models/Page';
import { verifyToken } from '../../../lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });
  try {
    await connectDB();
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
    const decoded = await verifyToken(token);
    if (!decoded) return res.status(401).json({ success: false, message: 'Invalid token' });

    const { name, description, religion, avatar, cover } = req.body;
    if (!name || name.trim().length < 2) return res.status(400).json({ success: false, message: 'Page name is required' });

    const page = await (Page as any).create({ name: name.trim(), description, religion, owner: decoded.userId, avatar, cover });
    res.status(201).json({ success: true, message: 'Page created', data: { page } });
  } catch (error: any) {
    console.error('Create page error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
}
