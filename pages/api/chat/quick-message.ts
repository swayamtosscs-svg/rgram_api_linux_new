import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import { ChatThread, Message } from '../../../lib/models/Chat';
import { verifyToken } from '@/lib/middleware/auth';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

    const userId = decoded.userId;

    switch (req.method) {
      case 'POST':
        return await sendMessage(req, res, userId);
      case 'GET':
        return await getMessages(req, res, userId);
      case 'PUT':
        return await editMessage(req, res, userId);
      case 'DELETE':
        return await deleteMessage(req, res, userId);
      default:
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Quick message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Send Message
async function sendMessage(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { toUserId, content, messageType = 'text', mediaUrl } = req.body;

  if (!toUserId || !content) {
    return res.status(400).json({ 
      success: false, 
      message: 'toUserId and content are required' 
    });
  }

  try {
    const participants = [
      new mongoose.Types.ObjectId(userId), 
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
    const message = await Message.create({
      thread: thread._id,
      sender: userId,
      recipient: toUserId,
      content: content.trim(),
      messageType: messageType || 'text',
      mediaUrl,
      isRead: false
    });

    // Update thread
    thread.lastMessage = message._id;
    thread.lastMessageAt = new Date();
    
    // Increment unread count for recipient
    const currentUnread = thread.unreadCount.get(toUserId) || 0;
    thread.unreadCount.set(toUserId, currentUnread + 1);
    
    await thread.save();

    res.status(201).json({ 
      success: true, 
      message: 'Message sent successfully',
      data: {
        messageId: message._id,
        threadId: thread._id,
        content: message.content,
        sentAt: message.createdAt
      }
    });
  } catch (error: any) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
}

// Get Messages
async function getMessages(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { threadId, limit = 20 } = req.query;

  if (!threadId) {
    return res.status(400).json({
      success: false,
      message: 'threadId is required'
    });
  }

  try {
    // Verify user is part of this thread
    const thread = await ChatThread.findById(threadId);
    if (!thread || !thread.participants.includes(userId)) {
      return res.status(404).json({
        success: false,
        message: 'Chat thread not found'
      });
    }

    // Get messages
    const messages = await Message.find({
      thread: threadId,
      isDeleted: false
    })
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .populate('sender', 'username fullName avatar')
    .lean();

    // Mark messages as read
    const unreadMessages = messages.filter(msg => 
      msg.recipient === userId && !msg.isRead
    );

    if (unreadMessages.length > 0) {
      await Message.updateMany(
        { _id: { $in: unreadMessages.map(m => m._id) } },
        { isRead: true, readAt: new Date() }
      );
    }

    res.json({
      success: true,
      data: {
        messages: messages.reverse(),
        total: messages.length
      }
    });
  } catch (error: any) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get messages'
    });
  }
}

// Edit Message
async function editMessage(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { messageId, content } = req.body;

  if (!messageId || !content) {
    return res.status(400).json({
      success: false,
      message: 'messageId and content are required'
    });
  }

  try {
    const message = await Message.findById(messageId);
    if (!message || message.sender.toString() !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or access denied'
      });
    }

    if (message.isDeleted) {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit deleted message'
      });
    }

    // Check if message is too old (24 hours)
    const messageAge = Date.now() - message.createdAt.getTime();
    if (messageAge > 24 * 60 * 60 * 1000) {
      return res.status(400).json({
        success: false,
        message: 'Message is too old to edit (24 hour limit)'
      });
    }

    // Update message
    message.content = content.trim();
    message.updatedAt = new Date();
    await message.save();

    res.json({
      success: true,
      message: 'Message updated successfully',
      data: {
        messageId: message._id,
        content: message.content,
        updatedAt: message.updatedAt
      }
    });
  } catch (error: any) {
    console.error('Edit message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to edit message'
    });
  }
}

// Delete Message
async function deleteMessage(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { messageId, deleteType = 'soft' } = req.body;

  if (!messageId) {
    return res.status(400).json({
      success: false,
      message: 'messageId is required'
    });
  }

  try {
    const message = await Message.findById(messageId);
    if (!message || message.sender.toString() !== userId) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or access denied'
      });
    }

    if (deleteType === 'soft') {
      // Soft delete
      message.isDeleted = true;
      message.deletedAt = new Date();
      message.content = '[Message deleted]';
      await message.save();
    } else {
      // Hard delete
      await Message.findByIdAndDelete(messageId);
    }

    res.json({
      success: true,
      message: `Message ${deleteType === 'soft' ? 'deleted' : 'permanently removed'}`,
      data: {
        messageId,
        deleteType
      }
    });
  } catch (error: any) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
}
