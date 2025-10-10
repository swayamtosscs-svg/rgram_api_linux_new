import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../lib/database';
import { ChatThread, Message } from '../../../../lib/models/Chat';
import { verifyToken } from '../../../../lib/middleware/auth';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
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

    const { thread_id } = req.query;
    if (!thread_id || typeof thread_id !== 'string') {
      return res.status(400).json({ success: false, message: 'Thread ID is required' });
    }

    // Get pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Verify user is part of this thread
    const thread = await ChatThread.findById(thread_id);
    if (!thread) {
      return res.status(404).json({ success: false, message: 'Thread not found' });
    }

    if (!thread.participants.includes(decoded.userId)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Get messages with pagination
    const messages = await Message.find({ 
      thread: thread_id,
      isDeleted: false 
    })
      .populate('sender', 'username fullName avatar')
      .populate('recipient', 'username fullName avatar')
      .populate('replyTo', 'content sender username fullName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalMessages = await Message.countDocuments({ 
      thread: thread_id,
      isDeleted: false 
    });

    // Mark messages as read for current user
    if (messages.length > 0) {
      const unreadMessageIds = messages
        .filter(msg => !msg.isRead && msg.recipient.toString() === decoded.userId)
        .map(msg => msg._id);

      if (unreadMessageIds.length > 0) {
        await Message.updateMany(
          { _id: { $in: unreadMessageIds } },
          { isRead: true, readAt: new Date() }
        );

        // Update thread unread count
        const currentUnread = thread.unreadCount.get(decoded.userId) || 0;
        const newUnread = Math.max(0, currentUnread - unreadMessageIds.length);
        thread.unreadCount.set(decoded.userId, newUnread);
        await thread.save();
      }
    }

    // Reverse messages to show oldest first (like typical chat apps)
    const reversedMessages = messages.reverse();

    res.json({
      success: true,
      message: 'Messages retrieved successfully',
      data: {
        messages: reversedMessages,
        pagination: {
          page,
          limit,
          total: totalMessages,
          pages: Math.ceil(totalMessages / limit),
          hasNext: page * limit < totalMessages,
          hasPrev: page > 1
        },
        thread: {
          id: thread._id,
          participants: thread.participants,
          isGroupChat: thread.isGroupChat,
          groupName: thread.groupName,
          groupAvatar: thread.groupAvatar,
          lastMessageAt: thread.lastMessageAt
        }
      }
    });

  } catch (error: any) {
    console.error('Get thread messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
