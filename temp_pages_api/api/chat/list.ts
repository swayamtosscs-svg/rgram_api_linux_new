import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import { ChatThread, Message } from '../../../lib/models/Chat';
import { verifyToken } from '../../../lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed' });
  
  try {
    await connectDB();
    
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
    
    const decoded = await verifyToken(token);
    if (!decoded) return res.status(401).json({ success: false, message: 'Invalid token' });

    // Get pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const threads = await ChatThread.find({ participants: decoded.userId })
      .populate('participants', 'username fullName avatar')
      .populate('lastMessage', 'content messageType sender createdAt')
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalThreads = await ChatThread.countDocuments({ participants: decoded.userId });

    // Format threads with additional information
    const formattedThreads = threads.map(thread => {
      const otherParticipant = thread.participants.find(
        (p: any) => p._id.toString() !== decoded.userId
      );
      
      const unreadCount = thread.unreadCount.get(decoded.userId) || 0;
      
      return {
        id: thread._id,
        participants: thread.participants.map((p: any) => ({
          id: p._id,
          username: p.username,
          fullName: p.fullName,
          avatar: p.avatar
        })),
        otherParticipant: otherParticipant ? {
          id: otherParticipant._id,
          username: otherParticipant.username,
          fullName: otherParticipant.fullName,
          avatar: otherParticipant.avatar
        } : null,
        lastMessage: thread.lastMessage ? {
          id: thread.lastMessage._id,
          content: thread.lastMessage.content,
          messageType: thread.lastMessage.messageType,
          sender: thread.lastMessage.sender,
          createdAt: thread.lastMessage.createdAt
        } : null,
        lastMessageAt: thread.lastMessageAt,
        unreadCount,
        isGroupChat: thread.isGroupChat,
        groupName: thread.groupName,
        groupAvatar: thread.groupAvatar,
        createdAt: thread.createdAt,
        updatedAt: thread.updatedAt
      };
    });

    res.json({ 
      success: true, 
      message: 'Chat threads retrieved successfully', 
      data: { 
        threads: formattedThreads,
        pagination: {
          page,
          limit,
          total: totalThreads,
          pages: Math.ceil(totalThreads / limit),
          hasNext: page * limit < totalThreads,
          hasPrev: page > 1
        }
      } 
    });
    
  } catch (error: any) {
    console.error('Chat list error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
}
