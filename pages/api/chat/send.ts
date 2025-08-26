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

    const { 
      toUserId, 
      content, 
      messageType = 'text', 
      mediaUrl, 
      replyTo 
    } = req.body;

    if (!toUserId || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'toUserId and content are required' 
      });
    }

    // Validate message type
    const validMessageTypes = ['text', 'image', 'video', 'audio', 'file', 'location'];
    if (!validMessageTypes.includes(messageType)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid message type' 
      });
    }

    // Validate media URL for non-text messages
    if (messageType !== 'text' && !mediaUrl) {
      return res.status(400).json({ 
        success: false, 
        message: 'mediaUrl is required for non-text messages' 
      });
    }

    const participants = [
      new mongoose.Types.ObjectId(decoded.userId), 
      new mongoose.Types.ObjectId(toUserId)
    ].sort();

    // Find or create chat thread
    let thread = await ChatThread.findOne({ participants: { $all: participants } });
    
    if (!thread) {
      thread = await ChatThread.create({ 
        participants, 
        lastMessageAt: new Date(),
        unreadCount: { [toUserId]: 0 }
      });
    }

    // Create message
    const messageData: any = {
      thread: thread._id,
      sender: decoded.userId,
      recipient: toUserId,
      content,
      messageType,
      isRead: false
    };

    if (mediaUrl) messageData.mediaUrl = mediaUrl;
    if (replyTo) messageData.replyTo = replyTo;

    const message = await Message.create(messageData);

    // Update thread
    thread.lastMessage = message._id;
    thread.lastMessageAt = new Date();
    
    // Increment unread count for recipient
    const currentUnread = thread.unreadCount.get(toUserId) || 0;
    thread.unreadCount.set(toUserId, currentUnread + 1);
    
    await thread.save();

    // Populate message with sender info for response
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username fullName avatar')
      .populate('recipient', 'username fullName avatar')
      .populate('replyTo', 'content sender')
      .lean();

    res.status(201).json({ 
      success: true, 
      message: 'Message sent successfully', 
      data: { 
        message: populatedMessage,
        threadId: thread._id 
      } 
    });

  } catch (error: any) {
    console.error('Chat send error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
}
