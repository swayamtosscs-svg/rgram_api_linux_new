import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import { ChatThread } from '../../../lib/models/Chat';
import { verifyToken } from '../../../lib/middleware/auth';

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

    // Get all threads where user is a participant
    const threads = await ChatThread.find({ participants: decoded.userId })
      .populate('participants', 'username fullName avatar')
      .lean();

    // Calculate unread counts for each thread
    const threadsWithUnread = threads.map(thread => {
      // Handle unreadCount - it might be a Map or plain object depending on .lean()
      let unreadCount = 0;
      if (thread.unreadCount) {
        if (typeof thread.unreadCount.get === 'function') {
          // It's a Map
          unreadCount = thread.unreadCount.get(decoded.userId) || 0;
        } else {
          // It's a plain object (from .lean())
          unreadCount = thread.unreadCount[decoded.userId] || 0;
        }
      }
      const otherParticipant = thread.participants.find(
        (p: any) => p._id.toString() !== decoded.userId
      );
      
      return {
        threadId: thread._id,
        unreadCount,
        lastMessageAt: thread.lastMessageAt,
        otherParticipant: otherParticipant ? {
          id: otherParticipant._id,
          username: otherParticipant.username,
          fullName: otherParticipant.fullName,
          avatar: otherParticipant.avatar
        } : null,
        isGroupChat: thread.isGroupChat,
        groupName: thread.groupName,
        groupAvatar: thread.groupAvatar
      };
    });

    // Calculate total unread count
    const totalUnread = threadsWithUnread.reduce((sum, thread) => sum + thread.unreadCount, 0);

    // Sort by last message time (most recent first)
    threadsWithUnread.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

    res.json({
      success: true,
      message: 'Unread counts retrieved successfully',
      data: {
        totalUnread,
        threads: threadsWithUnread
      }
    });

  } catch (error: any) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
