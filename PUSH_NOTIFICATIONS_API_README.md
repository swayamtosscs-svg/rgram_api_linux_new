# Push Notifications API Documentation

Complete Firebase Cloud Messaging (FCM) integration for sending real-time push notifications even when the app is closed.

## 🚀 **Features**

- **Real-time Push Notifications**: Send notifications even when app is closed
- **FCM Token Management**: Register and manage device tokens
- **Notification Settings**: Granular control over notification types
- **Topic Subscriptions**: Subscribe users to specific notification topics
- **Bulk Notifications**: Send notifications to multiple users
- **Auto-notification Creation**: Automatically create notifications with push
- **Cross-platform Support**: Works on Android, iOS, and Web

## 📍 **API Endpoints**

### **1. Register FCM Token**
**Endpoint:** `POST /api/notifications/register-fcm-token`

Register a device's FCM token for receiving push notifications.

**Request:**
```json
{
  "fcmToken": "device-fcm-token-here",
  "deviceType": "android",
  "appVersion": "1.0.0"
}
```

**Response:**
```json
{
  "success": true,
  "message": "FCM token registered successfully",
  "data": {
    "userId": "user_id",
    "fcmTokenRegistered": true,
    "deviceType": "android",
    "appVersion": "1.0.0",
    "subscribedTopics": [
      "general_notifications",
      "like_notifications",
      "comment_notifications"
    ]
  }
}
```

### **2. Send Push Notification**
**Endpoint:** `POST /api/notifications/send-push`

Send a push notification to a specific user.

**Request:**
```json
{
  "recipientId": "user_id",
  "title": "New Like",
  "body": "John Doe liked your post",
  "type": "like",
  "imageUrl": "https://example.com/image.jpg",
  "data": {
    "postId": "post_id",
    "customData": "value"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Push notification sent successfully",
  "data": {
    "notificationSent": true,
    "recipient": {
      "id": "user_id",
      "username": "recipient_username"
    },
    "sender": {
      "id": "sender_id",
      "username": "sender_username",
      "fullName": "Sender Name"
    },
    "notification": {
      "title": "New Like",
      "body": "John Doe liked your post",
      "type": "like",
      "imageUrl": "https://example.com/image.jpg"
    }
  }
}
```

### **3. Create Notification with Push**
**Endpoint:** `POST /api/notifications/create-with-push`

Create a notification in the database and automatically send push notification.

**Request:**
```json
{
  "recipientId": "user_id",
  "type": "like",
  "content": "Someone liked your post",
  "relatedPostId": "post_id",
  "relatedCommentId": "comment_id",
  "relatedStoryId": "story_id",
  "sendPush": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification created successfully",
  "data": {
    "notification": {
      "_id": "notification_id",
      "type": "like",
      "content": "Someone liked your post",
      "sender": {
        "username": "sender_username",
        "fullName": "Sender Name",
        "avatar": "avatar_url"
      },
      "isRead": false,
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "pushNotification": {
      "sent": true,
      "recipient": "recipient_username",
      "type": "like"
    }
  }
}
```

### **4. Update Notification Settings**
**Endpoint:** `PUT /api/notifications/settings`

Update user's notification preferences and manage topic subscriptions.

**Request:**
```json
{
  "pushNotifications": true,
  "emailNotifications": true,
  "likeNotifications": true,
  "commentNotifications": true,
  "followNotifications": true,
  "messageNotifications": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification settings updated successfully",
  "data": {
    "userId": "user_id",
    "notificationSettings": {
      "pushNotifications": true,
      "emailNotifications": true,
      "likeNotifications": true,
      "commentNotifications": true,
      "followNotifications": true,
      "messageNotifications": true
    },
    "fcmTokenRegistered": true
  }
}
```

## 🔐 **Authentication**

All endpoints require JWT authentication:

```http
Authorization: Bearer <your-jwt-token>
```

## 📱 **Notification Types**

| Type | Description | Auto Push |
|------|-------------|-----------|
| `mention` | User mentioned in post/comment | ✅ |
| `like` | Post/reel liked | ✅ |
| `comment` | New comment on post | ✅ |
| `reply` | Reply to comment | ✅ |
| `share` | Post shared | ✅ |
| `follow` | New follower | ✅ |
| `follow_request` | Follow request received | ✅ |
| `follow_accepted` | Follow request accepted | ✅ |
| `story_view` | Story viewed | ✅ |
| `block` | User blocked | ✅ |
| `unblock` | User unblocked | ✅ |
| `collaboration_request` | Collaboration request | ✅ |
| `collaboration_accepted` | Collaboration accepted | ✅ |
| `collaboration_rejected` | Collaboration rejected | ✅ |

## 🎯 **Topic Subscriptions**

Users are automatically subscribed to topics based on their notification settings:

- `general_notifications` - Always subscribed
- `like_notifications` - When like notifications enabled
- `comment_notifications` - When comment notifications enabled
- `follow_notifications` - When follow notifications enabled
- `message_notifications` - When message notifications enabled

## 🛠 **Environment Setup**

### Required Environment Variables

```env
# Firebase Cloud Messaging
FCM_PROJECT_ID=your-firebase-project-id
FCM_PRIVATE_KEY_ID=your-private-key-id
FCM_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
FCM_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FCM_CLIENT_ID=your-client-id
```

### Installation

1. Install Firebase Admin SDK:
```bash
npm install firebase-admin
```

2. Set up Firebase project and download service account key
3. Add environment variables to `.env.local`
4. Test the configuration

## 📊 **Database Schema Updates**

### User Model Updates

```typescript
interface IUser {
  // ... existing fields
  fcmToken?: string;
  notificationSettings: {
    pushNotifications: boolean;
    emailNotifications: boolean;
    likeNotifications: boolean;
    commentNotifications: boolean;
    followNotifications: boolean;
    messageNotifications: boolean;
  };
}
```

## 🔧 **Utility Functions**

### Push Notification Helper

```typescript
import { createNotificationWithPush, sendBulkPushNotification } from '@/lib/utils/pushNotificationHelper';

// Create notification with automatic push
await createNotificationWithPush({
  recipientId: 'user_id',
  senderId: 'sender_id',
  type: 'like',
  content: 'Someone liked your post',
  relatedPostId: 'post_id'
});

// Send bulk notifications
await sendBulkPushNotification(
  ['user1', 'user2', 'user3'],
  'New Feature',
  'Check out our latest update!',
  'general'
);
```

## 📱 **Client Integration**

### Android (Flutter)

```dart
// Get FCM token
String? token = await FirebaseMessaging.instance.getToken();

// Register token with API
await http.post(
  Uri.parse('$baseUrl/api/notifications/register-fcm-token'),
  headers: {
    'Authorization': 'Bearer $jwtToken',
    'Content-Type': 'application/json',
  },
  body: jsonEncode({
    'fcmToken': token,
    'deviceType': 'android',
    'appVersion': '1.0.0',
  }),
);
```

### iOS (Swift)

```swift
// Get FCM token
Messaging.messaging().token { token, error in
  if let error = error {
    print("Error fetching FCM registration token: \(error)")
  } else if let token = token {
    // Register token with API
    registerFCMToken(token: token)
  }
}
```

### Web (JavaScript)

```javascript
// Get FCM token
import { getMessaging, getToken } from 'firebase/messaging';

const messaging = getMessaging();
const token = await getToken(messaging, {
  vapidKey: 'your-vapid-key'
});

// Register token with API
fetch('/api/notifications/register-fcm-token', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    fcmToken: token,
    deviceType: 'web',
    appVersion: '1.0.0',
  }),
});
```

## 🚨 **Error Handling**

### Common Error Responses

```json
{
  "success": false,
  "message": "FCM token is required",
  "error": "Validation error details"
}
```

### Error Codes

- `400` - Bad Request (missing/invalid parameters)
- `401` - Unauthorized (invalid JWT token)
- `404` - Not Found (user/recipient not found)
- `500` - Internal Server Error (FCM service error)

## 🔍 **Testing**

### Test FCM Token Registration

```bash
curl -X POST http://localhost:3000/api/notifications/register-fcm-token \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fcmToken": "test-token",
    "deviceType": "android",
    "appVersion": "1.0.0"
  }'
```

### Test Push Notification

```bash
curl -X POST http://localhost:3000/api/notifications/send-push \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientId": "USER_ID",
    "title": "Test Notification",
    "body": "This is a test push notification",
    "type": "general"
  }'
```

## 📈 **Performance Considerations**

- **Token Validation**: FCM tokens are validated before sending
- **Batch Processing**: Use bulk endpoints for multiple notifications
- **Topic Subscriptions**: Efficient for broadcasting to many users
- **Error Handling**: Failed notifications are logged but don't break the flow
- **Rate Limiting**: Consider implementing rate limiting for high-volume scenarios

## 🔒 **Security**

- **Token Security**: FCM tokens are stored securely in database
- **User Privacy**: Users can disable push notifications
- **Authentication**: All endpoints require valid JWT tokens
- **Validation**: Input validation prevents malicious requests
- **Environment Variables**: Sensitive keys stored in environment variables

## 📚 **Additional Resources**

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [FCM Environment Template](./FCM_PUSH_NOTIFICATIONS_ENV_TEMPLATE.txt)
- [Postman Collection](./push-notifications-postman-collection.json)

## 🆘 **Troubleshooting**

### Common Issues

1. **Invalid FCM Token**: Ensure token is valid and not expired
2. **Authentication Error**: Check Firebase service account permissions
3. **Project ID Mismatch**: Verify FCM_PROJECT_ID matches Firebase project
4. **Private Key Format**: Ensure proper newline formatting in private key

### Debug Mode

Set `NODE_ENV=development` for detailed error messages in API responses.

### Logs

Check server logs for FCM-related errors and success messages.
