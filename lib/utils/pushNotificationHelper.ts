import User from '@/lib/models/User';
import fcmService from '@/lib/services/fcmService';

export interface NotificationData {
  recipientId: string;
  senderId: string;
  type: string;
  content: string;
  relatedPostId?: string;
  relatedCommentId?: string;
  relatedStoryId?: string;
}

/**
 * Create notification and send push notification
 */
export async function createNotificationWithPush(notificationData: NotificationData) {
  try {
    // Get sender and recipient info
    const [sender, recipient] = await Promise.all([
      User.findById(notificationData.senderId).select('username fullName avatar'),
      User.findById(notificationData.recipientId).select('fcmToken notificationSettings username')
    ]);

    if (!sender || !recipient) {
      throw new Error('Sender or recipient not found');
    }

    // Check if recipient has push notifications enabled
    if (!recipient.notificationSettings.pushNotifications) {
      console.log('Push notifications disabled for recipient:', recipient.username);
      return null;
    }

    // Check if recipient has FCM token
    if (!recipient.fcmToken) {
      console.log('No FCM token found for recipient:', recipient.username);
      return null;
    }

    // Create push notification data based on type
    const pushNotificationData = fcmService.createNotificationData(
      notificationData.type,
      sender.fullName || sender.username,
      notificationData.content,
      {
        userId: sender._id.toString(),
        postId: notificationData.relatedPostId,
        commentId: notificationData.relatedCommentId,
        storyId: notificationData.relatedStoryId
      }
    );

    // Send push notification
    const notificationSent = await fcmService.sendToDevice(
      recipient.fcmToken,
      pushNotificationData
    );

    console.log(`Push notification ${notificationSent ? 'sent' : 'failed'} to ${recipient.username} for ${notificationData.type}`);

    return {
      notificationSent,
      recipient: recipient.username,
      type: notificationData.type
    };

  } catch (error) {
    console.error('Error creating notification with push:', error);
    return null;
  }
}

/**
 * Send push notification to multiple users
 */
export async function sendBulkPushNotification(
  recipientIds: string[],
  title: string,
  body: string,
  type: string = 'general',
  additionalData: any = {}
) {
  try {
    // Get all recipients with FCM tokens
    const recipients = await User.find({
      _id: { $in: recipientIds },
      'notificationSettings.pushNotifications': true,
      fcmToken: { $exists: true, $ne: '' }
    }).select('fcmToken username');

    if (recipients.length === 0) {
      console.log('No recipients with valid FCM tokens found');
      return { successCount: 0, failureCount: 0 };
    }

    const fcmTokens = recipients.map(recipient => recipient.fcmToken).filter((token): token is string => token !== undefined);

    const notificationData = {
      title,
      body,
      data: {
        type,
        ...additionalData
      }
    };

    const result = await fcmService.sendToMultipleDevices(fcmTokens, notificationData);

    console.log(`Bulk push notification sent: ${result.successCount} success, ${result.failureCount} failed`);

    return result;

  } catch (error) {
    console.error('Error sending bulk push notification:', error);
    return { successCount: 0, failureCount: recipientIds.length };
  }
}

/**
 * Send push notification to topic subscribers
 */
export async function sendTopicPushNotification(
  topic: string,
  title: string,
  body: string,
  type: string = 'general',
  additionalData: any = {}
) {
  try {
    const notificationData = {
      title,
      body,
      data: {
        type,
        ...additionalData
      }
    };

    const success = await fcmService.sendToTopic(topic, notificationData);

    console.log(`Topic push notification ${success ? 'sent' : 'failed'} to topic: ${topic}`);

    return success;

  } catch (error) {
    console.error('Error sending topic push notification:', error);
    return false;
  }
}

/**
 * Update user notification settings and manage topic subscriptions
 */
export async function updateNotificationSettings(
  userId: string,
  settings: {
    pushNotifications?: boolean;
    emailNotifications?: boolean;
    likeNotifications?: boolean;
    commentNotifications?: boolean;
    followNotifications?: boolean;
    messageNotifications?: boolean;
  }
) {
  try {
    const user = await User.findById(userId).select('fcmToken notificationSettings');
    if (!user) {
      throw new Error('User not found');
    }

    // Update notification settings
    const updatedSettings = {
      ...user.notificationSettings,
      ...settings
    };

    await User.findByIdAndUpdate(userId, {
      notificationSettings: updatedSettings
    });

    // Manage topic subscriptions if user has FCM token
    if (user.fcmToken) {
      const topics = {
        like_notifications: updatedSettings.likeNotifications,
        comment_notifications: updatedSettings.commentNotifications,
        follow_notifications: updatedSettings.followNotifications,
        message_notifications: updatedSettings.messageNotifications
      };

      for (const [topic, shouldSubscribe] of Object.entries(topics)) {
        if (shouldSubscribe) {
          await fcmService.subscribeToTopic(user.fcmToken, topic);
        } else {
          await fcmService.unsubscribeFromTopic(user.fcmToken, topic);
        }
      }
    }

    console.log(`Notification settings updated for user: ${userId}`);

    return true;

  } catch (error) {
    console.error('Error updating notification settings:', error);
    return false;
  }
}
