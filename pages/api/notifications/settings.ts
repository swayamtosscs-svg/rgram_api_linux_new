import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/middleware/auth';
import { updateNotificationSettings } from '@/lib/utils/pushNotificationHelper';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
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
      pushNotifications,
      emailNotifications,
      likeNotifications,
      commentNotifications,
      followNotifications,
      messageNotifications
    } = req.body;

    // Validate settings
    const settings: any = {};
    
    if (typeof pushNotifications === 'boolean') {
      settings.pushNotifications = pushNotifications;
    }
    if (typeof emailNotifications === 'boolean') {
      settings.emailNotifications = emailNotifications;
    }
    if (typeof likeNotifications === 'boolean') {
      settings.likeNotifications = likeNotifications;
    }
    if (typeof commentNotifications === 'boolean') {
      settings.commentNotifications = commentNotifications;
    }
    if (typeof followNotifications === 'boolean') {
      settings.followNotifications = followNotifications;
    }
    if (typeof messageNotifications === 'boolean') {
      settings.messageNotifications = messageNotifications;
    }

    if (Object.keys(settings).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one notification setting must be provided'
      });
    }

    // Update notification settings
    const success = await updateNotificationSettings(decoded.userId, settings);

    if (!success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update notification settings'
      });
    }

    // Get updated user settings
    const user = await User.findById(decoded.userId).select('notificationSettings fcmToken');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification settings updated successfully',
      data: {
        userId: user._id,
        notificationSettings: user.notificationSettings,
        fcmTokenRegistered: !!user.fcmToken
      }
    });

  } catch (error: any) {
    console.error('Update notification settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
