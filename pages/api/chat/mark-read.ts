import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import { ChatThread, Message } from '../../../lib/models/Chat';
import { verifyToken } from '@/lib/middleware/auth';
import mongoose from 'mongoose';

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
    
    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const { threadId, messageIds } = req.body;

    if (!threadId) {
      return res.status(400).json({ success: false, message: 'Thread ID is required' });
    }

    // Verify user is part of this thread
    const thread = await ChatThread.findById(threadId);
    if (!thread) {
      return res.status(404).json({ success: false, message: 'Thread not found' });
    }

    if (!thread.participants.includes(decoded.userId)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    let query: any = { 
      thread: threadId, 
      recipient: decoded.userId,
      isRead: false 
    };

    // If specific message IDs are provided, mark only those
    if (messageIds && Array.isArray(messageIds) && messageIds.length > 0) {
      query._id = { $in: messageIds };
    }

    // Mark messages as read
    const result = await Message.updateMany(
      query,
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );

    // Update thread unread count
    if (result.modifiedCount > 0) {
      const currentUnread = thread.unreadCount.get(decoded.userId) || 0;
      const newUnread = Math.max(0, currentUnread - result.modifiedCount);
      thread.unreadCount.set(decoded.userId, newUnread);
      await thread.save();
    }

    res.json({
      success: true,
      message: 'Messages marked as read',
      data: {
        modifiedCount: result.modifiedCount,
        threadId,
        unreadCount: thread.unreadCount.get(decoded.userId) || 0
      }
    });

  } catch (error: any) {
    console.error('Mark read error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
