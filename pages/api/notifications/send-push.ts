import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/middleware/auth';
import fcmService from '@/lib/services/fcmService';

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
      title, 
      body, 
      type = 'general',
      imageUrl,
      data = {}
    } = req.body;

    // Validate required fields
    if (!recipientId || !title || !body) {
      return res.status(400).json({
        success: false,
        message: 'recipientId, title, and body are required'
      });
    }

    // Get sender info
    const sender = await User.findById(decoded.userId).select('username fullName avatar');
    if (!sender) {
      return res.status(404).json({
        success: false,
        message: 'Sender not found'
      });
    }

    // Get recipient info
    const recipient = await User.findById(recipientId).select('fcmToken notificationSettings username');
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    // Check if recipient has push notifications enabled
    if (!recipient.notificationSettings.pushNotifications) {
      return res.status(200).json({
        success: true,
        message: 'Push notifications disabled for recipient',
        data: {
          notificationSent: false,
          reason: 'Push notifications disabled'
        }
      });
    }

    // Check if recipient has FCM token
    if (!recipient.fcmToken) {
      return res.status(200).json({
        success: true,
        message: 'No FCM token found for recipient',
        data: {
          notificationSent: false,
          reason: 'No FCM token registered'
        }
      });
    }

    // Create notification data
    const notificationData = {
      title,
      body,
      imageUrl,
      data: {
        type,
        userId: sender._id.toString(),
        senderName: sender.fullName || sender.username,
        senderAvatar: sender.avatar,
        ...data
      }
    };

    // Send push notification
    const notificationSent = await fcmService.sendToDevice(
      recipient.fcmToken, 
      notificationData
    );

    res.status(200).json({
      success: true,
      message: notificationSent ? 'Push notification sent successfully' : 'Failed to send push notification',
      data: {
        notificationSent,
        recipient: {
          id: recipient._id,
          username: recipient.username
        },
        sender: {
          id: sender._id,
          username: sender.username,
          fullName: sender.fullName
        },
        notification: {
          title,
          body,
          type,
          imageUrl
        }
      }
    });

  } catch (error: any) {
    console.error('Send push notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
