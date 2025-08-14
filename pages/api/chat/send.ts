import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import { ChatThread, Message } from '../../../lib/models/Chat';
import { verifyToken } from '../../../lib/middleware/auth';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });
  try {
    await connectDB();
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
    const decoded = await verifyToken(token);
    if (!decoded) return res.status(401).json({ success: false, message: 'Invalid token' });

    const { toUserId, content } = req.body;
    if (!toUserId || !content) return res.status(400).json({ success: false, message: 'toUserId and content are required' });

    const participants = [new mongoose.Types.ObjectId(decoded.userId), new mongoose.Types.ObjectId(toUserId)].sort();
    let thread = await (ChatThread as any).findOne({ participants: { $all: participants } });
    if (!thread) thread = await (ChatThread as any).create({ participants, lastMessageAt: new Date() });

    const message = await (Message as any).create({ thread: thread._id, sender: decoded.userId, recipient: toUserId, content });
    thread.lastMessageAt = new Date();
    await thread.save();

    res.status(201).json({ success: true, message: 'Message sent', data: { messageId: message._id } });
  } catch (error: any) {
    console.error('Chat send error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
}
