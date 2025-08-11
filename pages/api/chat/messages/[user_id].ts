import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../lib/database';
import { ChatThread, Message } from '../../../../lib/models/Chat';
import { verifyToken } from '../../../../lib/middleware/auth';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed' });
  try {
    await connectDB();
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ success: false, message: 'Invalid token' });

    const { user_id } = req.query;
    if (!user_id || typeof user_id !== 'string') return res.status(400).json({ success: false, message: 'User ID is required' });

    const participants = [new mongoose.Types.ObjectId(decoded.userId), new mongoose.Types.ObjectId(user_id)].sort();
    let thread = await (ChatThread as any).findOne({ participants: { $all: participants } });
    if (!thread) return res.json({ success: true, message: 'Messages', data: { messages: [] } });

    const messages = await (Message as any)
      .find({ thread: thread._id })
      .populate('sender', 'username fullName avatar')
      .populate('recipient', 'username fullName avatar')
      .sort({ createdAt: 1 })
      .lean();

    res.json({ success: true, message: 'Messages', data: { messages } });
  } catch (error: any) {
    console.error('Chat messages error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
}
