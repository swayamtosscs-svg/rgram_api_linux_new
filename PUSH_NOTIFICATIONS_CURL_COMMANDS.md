# 🔥 Firebase Push Notifications - CURL Commands

Complete curl commands to test your push notification APIs.

## 📋 **Prerequisites**

Before running these commands, make sure you have:
- ✅ JWT token from your authentication API
- ✅ Valid user ID from your database
- ✅ Server running on `http://localhost:3000`

## 🔑 **Get JWT Token First**

```bash
# Login to get JWT token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_id_here",
      "username": "username",
      "email": "email@example.com"
    }
  }
}
```

## 🚀 **Push Notification CURL Commands**

### **1. Register FCM Token**

```bash
curl -X POST http://localhost:3000/api/notifications/register-fcm-token \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fcmToken": "device-fcm-token-here",
    "deviceType": "android",
    "appVersion": "1.0.0"
  }'
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

```bash
curl -X POST http://localhost:3000/api/notifications/send-push \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientId": "RECIPIENT_USER_ID",
    "title": "🔥 New Notification",
    "body": "You have a new message!",
    "type": "message",
    "imageUrl": "https://example.com/image.jpg",
    "data": {
      "messageId": "msg_123",
      "senderId": "sender_id",
      "customData": "value"
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Push notification sent successfully",
  "data": {
    "notificationSent": true,
    "recipient": {
      "id": "recipient_id",
      "username": "recipient_username"
    },
    "sender": {
      "id": "sender_id",
      "username": "sender_username",
      "fullName": "Sender Name"
    },
    "notification": {
      "title": "🔥 New Notification",
      "body": "You have a new message!",
      "type": "message",
      "imageUrl": "https://example.com/image.jpg"
    }
  }
}
```

### **3. Create Notification with Push**

```bash
curl -X POST http://localhost:3000/api/notifications/create-with-push \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientId": "RECIPIENT_USER_ID",
    "type": "like",
    "content": "John Doe liked your post",
    "relatedPostId": "post_id_123",
    "sendPush": true
  }'
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
      "content": "John Doe liked your post",
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

```bash
curl -X PUT http://localhost:3000/api/notifications/settings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pushNotifications": true,
    "emailNotifications": true,
    "likeNotifications": true,
    "commentNotifications": true,
    "followNotifications": true,
    "messageNotifications": true
  }'
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

### **5. Get Notifications**

```bash
curl -X GET "http://localhost:3000/api/notifications/list?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": {
    "notifications": [
      {
        "_id": "notification_id",
        "type": "like",
        "content": "John Doe liked your post",
        "sender": {
          "username": "john_doe",
          "fullName": "John Doe",
          "avatar": "avatar_url"
        },
        "isRead": false,
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "unreadCount": 5,
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalNotifications": 25,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### **6. Mark Notifications as Read**

```bash
curl -X PUT http://localhost:3000/api/notifications/mark-read \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "notificationIds": ["notification_id_1", "notification_id_2"]
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Notifications marked as read"
}
```

## 🧪 **Test Different Notification Types**

### **Like Notification**
```bash
curl -X POST http://localhost:3000/api/notifications/create-with-push \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientId": "RECIPIENT_USER_ID",
    "type": "like",
    "content": "Someone liked your post",
    "relatedPostId": "post_id",
    "sendPush": true
  }'
```

### **Comment Notification**
```bash
curl -X POST http://localhost:3000/api/notifications/create-with-push \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientId": "RECIPIENT_USER_ID",
    "type": "comment",
    "content": "John Doe commented: Great post!",
    "relatedPostId": "post_id",
    "relatedCommentId": "comment_id",
    "sendPush": true
  }'
```

### **Follow Notification**
```bash
curl -X POST http://localhost:3000/api/notifications/create-with-push \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientId": "RECIPIENT_USER_ID",
    "type": "follow",
    "content": "John Doe started following you",
    "sendPush": true
  }'
```

### **Message Notification**
```bash
curl -X POST http://localhost:3000/api/notifications/send-push \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientId": "RECIPIENT_USER_ID",
    "title": "Message from John Doe",
    "body": "Hey! How are you doing?",
    "type": "message",
    "data": {
      "messageId": "msg_123",
      "senderId": "sender_id"
    }
  }'
```

### **Story View Notification**
```bash
curl -X POST http://localhost:3000/api/notifications/create-with-push \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientId": "RECIPIENT_USER_ID",
    "type": "story_view",
    "content": "John Doe viewed your story",
    "relatedStoryId": "story_id",
    "sendPush": true
  }'
```

## 🔧 **Quick Test Script**

Create a file `test-notifications.sh`:

```bash
#!/bin/bash

# Set your variables
JWT_TOKEN="your-jwt-token-here"
RECIPIENT_ID="recipient-user-id"
FCM_TOKEN="test-fcm-token"

echo "🔥 Testing Push Notifications..."

# 1. Register FCM Token
echo "1. Registering FCM Token..."
curl -X POST http://localhost:3000/api/notifications/register-fcm-token \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"fcmToken\": \"$FCM_TOKEN\", \"deviceType\": \"android\", \"appVersion\": \"1.0.0\"}"

echo -e "\n\n"

# 2. Send Push Notification
echo "2. Sending Push Notification..."
curl -X POST http://localhost:3000/api/notifications/send-push \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"recipientId\": \"$RECIPIENT_ID\", \"title\": \"Test Notification\", \"body\": \"This is a test!\", \"type\": \"general\"}"

echo -e "\n\n"

# 3. Create Notification with Push
echo "3. Creating Notification with Push..."
curl -X POST http://localhost:3000/api/notifications/create-with-push \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"recipientId\": \"$RECIPIENT_ID\", \"type\": \"like\", \"content\": \"Test like notification\", \"sendPush\": true}"

echo -e "\n\n"

# 4. Get Notifications
echo "4. Getting Notifications..."
curl -X GET "http://localhost:3000/api/notifications/list?page=1&limit=5" \
  -H "Authorization: Bearer $JWT_TOKEN"

echo -e "\n\n🎉 Tests completed!"
```

## 💡 **Tips for Testing**

1. **Replace Variables:**
   - `YOUR_JWT_TOKEN` - Get from login API
   - `RECIPIENT_USER_ID` - Use valid user ID from database
   - `FCM_TOKEN` - Use real device token for actual delivery

2. **Test with Real Tokens:**
   - Use actual FCM tokens from mobile devices
   - Test on different platforms (Android, iOS, Web)

3. **Check Responses:**
   - Look for `"success": true` in responses
   - Check `"notificationSent": true` for push delivery

4. **Monitor Firebase Console:**
   - Check delivery reports in Firebase Console
   - Monitor error rates and success rates

## 🚨 **Common Issues**

### **401 Unauthorized**
```bash
# Make sure JWT token is valid
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email", "password": "your-password"}'
```

### **404 Not Found**
```bash
# Check if server is running
curl http://localhost:3000/api/health
```

### **400 Bad Request**
```bash
# Validate JSON format and required fields
# Make sure recipientId exists in database
```

## 🎉 **Success Indicators**

- ✅ `"success": true` in response
- ✅ `"notificationSent": true` for push notifications
- ✅ `"fcmTokenRegistered": true` for token registration
- ✅ Notifications appear in Firebase Console
- ✅ Real devices receive push notifications

**Your push notification system is ready!** 🚀
