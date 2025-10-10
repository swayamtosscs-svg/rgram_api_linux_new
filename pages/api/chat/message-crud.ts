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
    console.error('Message CRUD error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Send Message
async function sendMessage(req: NextApiRequest, res: NextApiResponse, userId: string) {
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

  // Check if user is trying to send message to themselves
  if (toUserId === userId) {
    return res.status(400).json({
      success: false,
      message: 'Cannot send message to yourself'
    });
  }

  const participants = [
    new mongoose.Types.ObjectId(userId), 
    new mongoose.Types.ObjectId(toUserId)
  ].sort();

  try {
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
      sender: userId,
      recipient: toUserId,
      content: content.trim(),
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
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Get Messages
async function getMessages(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { threadId, limit = 50, before, after } = req.query;

  if (!threadId) {
    return res.status(400).json({
      success: false,
      message: 'threadId is required'
    });
  }

  try {
    // Verify user is part of this thread
    const thread = await ChatThread.findById(threadId);
    if (!thread) {
      return res.status(404).json({
        success: false,
        message: 'Chat thread not found'
      });
    }

    if (!thread.participants.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this chat thread'
      });
    }

    // Build query
    const query: any = {
      thread: threadId,
      isDeleted: false
    };

    if (before) {
      query.createdAt = { $lt: new Date(before as string) };
    }
    if (after) {
      query.createdAt = { $gt: new Date(after as string) };
    }

    // Get messages
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate('sender', 'username fullName avatar')
      .populate('recipient', 'username fullName avatar')
      .populate('replyTo', 'content sender')
      .lean();

    // Mark messages as read if user is recipient
    const unreadMessages = messages.filter(msg => 
      msg.recipient === userId && !msg.isRead
    );

    if (unreadMessages.length > 0) {
      await Message.updateMany(
        { _id: { $in: unreadMessages.map(m => m._id) } },
        { isRead: true, readAt: new Date() }
      );

      // Update thread unread count
      const currentUnread = thread.unreadCount.get(userId) || 0;
      thread.unreadCount.set(userId, Math.max(0, currentUnread - unreadMessages.length));
      await thread.save();
    }

    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Reverse to get chronological order
        thread,
        hasMore: messages.length === Number(limit)
      }
    });
  } catch (error: any) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get messages',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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

  if (content.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Message content cannot be empty'
    });
  }

  try {
    // Find message and verify ownership
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    if (message.sender.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own messages'
      });
    }

    if (message.isDeleted) {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit deleted message'
      });
    }

    // Check if message is too old (e.g., 24 hours)
    const messageAge = Date.now() - message.createdAt.getTime();
    const maxEditAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    if (messageAge > maxEditAge) {
      return res.status(400).json({
        success: false,
        message: 'Message is too old to edit (24 hour limit)'
      });
    }

    // Update message
    message.content = content.trim();
    message.updatedAt = new Date();
    await message.save();

    // Populate for response
    const updatedMessage = await Message.findById(messageId)
      .populate('sender', 'username fullName avatar')
      .populate('recipient', 'username fullName avatar')
      .populate('replyTo', 'content sender')
      .lean();

    res.json({
      success: true,
      message: 'Message updated successfully',
      data: {
        message: updatedMessage
      }
    });
  } catch (error: any) {
    console.error('Edit message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to edit message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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

  if (!['soft', 'hard'].includes(deleteType)) {
    return res.status(400).json({
      success: false,
      message: 'deleteType must be either "soft" or "hard"'
    });
  }

  try {
    // Find message and verify ownership
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    if (message.sender.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages'
      });
    }

    if (message.isDeleted && deleteType === 'soft') {
      return res.status(400).json({
        success: false,
        message: 'Message is already deleted'
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
      message: `Message ${deleteType === 'soft' ? 'deleted' : 'permanently removed'} successfully`,
      data: {
        messageId,
        deleteType
      }
    });
  } catch (error: any) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
