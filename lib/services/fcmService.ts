import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FCM_PROJECT_ID,
    private_key_id: process.env.FCM_PRIVATE_KEY_ID,
    private_key: process.env.FCM_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FCM_CLIENT_EMAIL,
    client_id: process.env.FCM_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FCM_CLIENT_EMAIL}`
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    projectId: process.env.FCM_PROJECT_ID
  });
}

export interface PushNotificationData {
  title: string;
  body: string;
  imageUrl?: string;
  data?: {
    type: string;
    userId?: string;
    postId?: string;
    commentId?: string;
    storyId?: string;
    [key: string]: any;
  };
}

export interface NotificationPayload {
  notification: {
    title: string;
    body: string;
    imageUrl?: string;
  };
  data: { [key: string]: string };
  android: {
    notification: {
      icon: string;
      color: string;
      sound: string;
      channel_id: string;
    };
    priority: 'high' | 'normal';
  };
  apns: {
    payload: {
      aps: {
        alert: {
          title: string;
          body: string;
        };
        badge: number;
        sound: string;
        category: string;
      };
    };
  };
}

class FCMService {
  /**
   * Send push notification to a single device
   */
  async sendToDevice(fcmToken: string, notificationData: PushNotificationData): Promise<boolean> {
    try {
      if (!fcmToken) {
        console.log('No FCM token provided');
        return false;
      }

      const payload: NotificationPayload = {
        notification: {
          title: notificationData.title,
          body: notificationData.body,
          ...(notificationData.imageUrl && { imageUrl: notificationData.imageUrl })
        },
        data: {
          type: notificationData.data?.type || 'general',
          ...(notificationData.data?.userId && { userId: notificationData.data.userId }),
          ...(notificationData.data?.postId && { postId: notificationData.data.postId }),
          ...(notificationData.data?.commentId && { commentId: notificationData.data.commentId }),
          ...(notificationData.data?.storyId && { storyId: notificationData.data.storyId }),
          click_action: 'FLUTTER_NOTIFICATION_CLICK'
        },
        android: {
          notification: {
            icon: 'ic_notification',
            color: '#FF6B6B',
            sound: 'default',
            channel_id: 'rgram_notifications'
          },
          priority: 'high'
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: notificationData.title,
                body: notificationData.body
              },
              badge: 1,
              sound: 'default',
              category: 'NOTIFICATION'
            }
          }
        }
      };

      const response = await admin.messaging().send({
        token: fcmToken,
        ...payload
      });

      console.log('Successfully sent message:', response);
      return true;
    } catch (error) {
      console.error('Error sending FCM message:', error);
      return false;
    }
  }

  /**
   * Send push notification to multiple devices
   */
  async sendToMultipleDevices(fcmTokens: string[], notificationData: PushNotificationData): Promise<{ successCount: number; failureCount: number }> {
    try {
      if (!fcmTokens || fcmTokens.length === 0) {
        console.log('No FCM tokens provided');
        return { successCount: 0, failureCount: 0 };
      }

      const payload: NotificationPayload = {
        notification: {
          title: notificationData.title,
          body: notificationData.body,
          ...(notificationData.imageUrl && { imageUrl: notificationData.imageUrl })
        },
        data: {
          type: notificationData.data?.type || 'general',
          ...(notificationData.data?.userId && { userId: notificationData.data.userId }),
          ...(notificationData.data?.postId && { postId: notificationData.data.postId }),
          ...(notificationData.data?.commentId && { commentId: notificationData.data.commentId }),
          ...(notificationData.data?.storyId && { storyId: notificationData.data.storyId }),
          click_action: 'FLUTTER_NOTIFICATION_CLICK'
        },
        android: {
          notification: {
            icon: 'ic_notification',
            color: '#FF6B6B',
            sound: 'default',
            channel_id: 'rgram_notifications'
          },
          priority: 'high'
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: notificationData.title,
                body: notificationData.body
              },
              badge: 1,
              sound: 'default',
              category: 'NOTIFICATION'
            }
          }
        }
      };

      const messages = fcmTokens.map(token => ({
        token,
        ...payload
      }));
      
      const response = await admin.messaging().sendEach(messages);

      console.log('Successfully sent messages:', response);
      return {
        successCount: response.successCount,
        failureCount: response.failureCount
      };
    } catch (error) {
      console.error('Error sending FCM multicast message:', error);
      return { successCount: 0, failureCount: fcmTokens.length };
    }
  }

  /**
   * Send notification to a topic
   */
  async sendToTopic(topic: string, notificationData: PushNotificationData): Promise<boolean> {
    try {
      const payload: NotificationPayload = {
        notification: {
          title: notificationData.title,
          body: notificationData.body,
          ...(notificationData.imageUrl && { imageUrl: notificationData.imageUrl })
        },
        data: {
          type: notificationData.data?.type || 'general',
          ...(notificationData.data?.userId && { userId: notificationData.data.userId }),
          ...(notificationData.data?.postId && { postId: notificationData.data.postId }),
          ...(notificationData.data?.commentId && { commentId: notificationData.data.commentId }),
          ...(notificationData.data?.storyId && { storyId: notificationData.data.storyId }),
          click_action: 'FLUTTER_NOTIFICATION_CLICK'
        },
        android: {
          notification: {
            icon: 'ic_notification',
            color: '#FF6B6B',
            sound: 'default',
            channel_id: 'rgram_notifications'
          },
          priority: 'high'
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: notificationData.title,
                body: notificationData.body
              },
              badge: 1,
              sound: 'default',
              category: 'NOTIFICATION'
            }
          }
        }
      };

      const response = await admin.messaging().send({
        topic: topic,
        ...payload
      });

      console.log('Successfully sent message to topic:', response);
      return true;
    } catch (error) {
      console.error('Error sending FCM topic message:', error);
      return false;
    }
  }

  /**
   * Subscribe user to a topic
   */
  async subscribeToTopic(fcmToken: string, topic: string): Promise<boolean> {
    try {
      await admin.messaging().subscribeToTopic(fcmToken, topic);
      console.log(`Successfully subscribed token to topic: ${topic}`);
      return true;
    } catch (error) {
      console.error('Error subscribing to topic:', error);
      return false;
    }
  }

  /**
   * Unsubscribe user from a topic
   */
  async unsubscribeFromTopic(fcmToken: string, topic: string): Promise<boolean> {
    try {
      await admin.messaging().unsubscribeFromTopic(fcmToken, topic);
      console.log(`Successfully unsubscribed token from topic: ${topic}`);
      return true;
    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
      return false;
    }
  }

  /**
   * Validate FCM token
   */
  async validateToken(fcmToken: string): Promise<boolean> {
    try {
      // Try to send a test message to validate the token
      await admin.messaging().send({
        token: fcmToken,
        data: {
          test: 'validation'
        }
      });
      return true;
    } catch (error) {
      console.error('FCM token validation failed:', error);
      return false;
    }
  }

  /**
   * Create notification data for different types
   */
  createNotificationData(type: string, senderName: string, content: string, additionalData?: any): PushNotificationData {
    const baseData = {
      type,
      ...additionalData
    };

    switch (type) {
      case 'like':
        return {
          title: 'New Like',
          body: `${senderName} liked your post`,
          data: baseData
        };
      
      case 'comment':
        return {
          title: 'New Comment',
          body: `${senderName} commented: ${content}`,
          data: baseData
        };
      
      case 'follow':
        return {
          title: 'New Follower',
          body: `${senderName} started following you`,
          data: baseData
        };
      
      case 'follow_request':
        return {
          title: 'Follow Request',
          body: `${senderName} wants to follow you`,
          data: baseData
        };
      
      case 'message':
        return {
          title: `Message from ${senderName}`,
          body: content,
          data: baseData
        };
      
      case 'mention':
        return {
          title: 'You were mentioned',
          body: `${senderName} mentioned you in a post`,
          data: baseData
        };
      
      case 'story_view':
        return {
          title: 'Story View',
          body: `${senderName} viewed your story`,
          data: baseData
        };
      
      default:
        return {
          title: 'New Notification',
          body: content,
          data: baseData
        };
    }
  }
}

export default new FCMService();
