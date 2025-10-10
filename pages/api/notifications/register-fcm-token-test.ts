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

    const { fcmToken, deviceType, appVersion } = req.body;

    // Validate required fields
    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        message: 'FCM token is required'
      });
    }

    // Validate FCM token format
    if (typeof fcmToken !== 'string' || fcmToken.length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Invalid FCM token format'
      });
    }

    // For testing purposes, skip Firebase validation if token starts with "test" or "mock"
    let isValidToken = true;
    if (!fcmToken.startsWith('test') && !fcmToken.startsWith('mock')) {
      // Only validate real tokens with Firebase
      isValidToken = await fcmService.validateToken(fcmToken);
    }

    if (!isValidToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid FCM token'
      });
    }

    // Update user's FCM token
    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { 
        fcmToken,
        lastActive: new Date()
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Subscribe user to general notifications topic (only for real tokens)
    if (!fcmToken.startsWith('test') && !fcmToken.startsWith('mock')) {
      await fcmService.subscribeToTopic(fcmToken, 'general_notifications');

      // Subscribe based on user preferences
      if (user.notificationSettings.likeNotifications) {
        await fcmService.subscribeToTopic(fcmToken, 'like_notifications');
      }
      if (user.notificationSettings.commentNotifications) {
        await fcmService.subscribeToTopic(fcmToken, 'comment_notifications');
      }
      if (user.notificationSettings.followNotifications) {
        await fcmService.subscribeToTopic(fcmToken, 'follow_notifications');
      }
      if (user.notificationSettings.messageNotifications) {
        await fcmService.subscribeToTopic(fcmToken, 'message_notifications');
      }
    }

    const subscribedTopics = [
      'general_notifications',
      ...(user.notificationSettings.likeNotifications ? ['like_notifications'] : []),
      ...(user.notificationSettings.commentNotifications ? ['comment_notifications'] : []),
      ...(user.notificationSettings.followNotifications ? ['follow_notifications'] : []),
      ...(user.notificationSettings.messageNotifications ? ['message_notifications'] : [])
    ];

    res.status(200).json({
      success: true,
      message: 'FCM token registered successfully',
      data: {
        userId: user._id,
        fcmTokenRegistered: true,
        deviceType: deviceType || 'unknown',
        appVersion: appVersion || '1.0.0',
        subscribedTopics,
        isMockToken: fcmToken.startsWith('test') || fcmToken.startsWith('mock'),
        note: fcmToken.startsWith('test') || fcmToken.startsWith('mock') 
          ? 'Mock token registered for testing. Use real FCM token for actual push notifications.' 
          : 'Real FCM token registered successfully.'
      }
    });

  } catch (error: any) {
    console.error('FCM token registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
