import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import Notification from '@/lib/models/Notification';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/middleware/auth';
import { createNotificationWithPush } from '@/lib/utils/pushNotificationHelper';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    await connectDB();

    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }

    const {
      recipientId,
      type,
      content,
      relatedPostId,
      relatedCommentId,
      relatedStoryId,
      sendPush = true
    } = req.body;

    // Validate required fields
    if (!recipientId || !type || !content) {
      return res.status(400).json({
        success: false,
        message: 'recipientId, type, and content are required'
      });
    }

    // Validate notification type
    const validTypes = [
      'mention', 'like', 'comment', 'reply', 'share', 
      'collaboration_request', 'collaboration_accepted', 'collaboration_rejected',
      'follow', 'follow_request', 'follow_accepted', 'story_view', 'block', 'unblock'
    ];

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification type'
      });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    // Don't send notification to self
    if (recipientId === decoded.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send notification to yourself'
      });
    }

    // Create notification in database
    const notification = await (Notification as any).createNotification(
      recipientId,
      decoded.userId,
      type,
      content,
      relatedPostId,
      relatedCommentId,
      relatedStoryId
    );

    // Populate notification with sender info
    await notification.populate('sender', 'username fullName avatar');

    let pushNotificationResult = null;

    // Send push notification if requested
    if (sendPush) {
      pushNotificationResult = await createNotificationWithPush({
        recipientId,
        senderId: decoded.userId,
        type,
        content,
        relatedPostId,
        relatedCommentId,
        relatedStoryId
      });
    }

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: {
        notification: {
          _id: notification._id,
          type: notification.type,
          content: notification.content,
          sender: notification.sender,
          isRead: notification.isRead,
          createdAt: notification.createdAt
        },
        pushNotification: pushNotificationResult ? {
          sent: pushNotificationResult.notificationSent,
          recipient: pushNotificationResult.recipient,
          type: pushNotificationResult.type
        } : null
      }
    });

  } catch (error: any) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
