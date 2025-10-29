# Complete Messaging API Documentation with Notifications

यह document सभी messaging APIs और notification system का complete documentation है।

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Notification System](#notification-system)
5. [Examples](#examples)
6. [Error Handling](#error-handling)

---

## 🎯 Overview

यह messaging system text messages, images, videos, audio, और files के साथ complete messaging functionality provide करता है। साथ ही जब कोई new message आता है, तो receiving user को automatically notification मिलती है।

### Features:
- ✅ Text messages भेजना और प्राप्त करना
- ✅ Media messages (Images, Videos, Audio, Files) भेजना
- ✅ Messages को edit करना (24 hours तक)
- ✅ Messages को delete करना (soft/hard delete)
- ✅ Chat threads/conversations list प्राप्त करना
- ✅ Messages को read mark करना
- ✅ **Automatic notifications** जब नया message आता है
- ✅ User information प्राप्त करना

---

## 🔐 Authentication

सभी APIs के लिए JWT token required है। Authorization header में token भेजें:

```http
Authorization: Bearer <your_jwt_token>
```

---

## 📍 API Endpoints

### 1. Messages पाने के लिए (Get Messages)

#### Primary API - Thread के Messages:
**Endpoint:** `GET /api/chat/enhanced-message?threadId={threadId}&limit=50`

**Query Parameters:**
- `threadId` (required) - Chat thread का ID
- `limit` (optional, default: 50) - Kitne messages return करने हैं
- `before` (optional) - इस timestamp से पहले के messages
- `after` (optional) - इस timestamp के बाद के messages

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "_id": "message_id",
        "content": "Hello! How are you?",
        "messageType": "text",
        "sender": {
          "_id": "sender_id",
          "username": "john_doe",
          "fullName": "John Doe",
          "avatar": "avatar_url"
        },
        "recipient": {
          "_id": "recipient_id",
          "username": "jane_smith",
          "fullName": "Jane Smith",
          "avatar": "avatar_url"
        },
        "isRead": true,
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "thread": {
      "_id": "thread_id",
      "participants": ["sender_id", "recipient_id"],
      "lastMessageAt": "2024-01-15T10:30:00.000Z"
    },
    "hasMore": false
  }
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:5001/api/chat/enhanced-message?threadId=thread_id_here&limit=50" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

#### User के सभी Conversations:
**Endpoint:** `GET /api/chat/enhanced-message?userId={userId}&limit=100`

**Query Parameters:**
- `userId` (required) - User का ID (sirf अपना userId use करें)
- `limit` (optional, default: 100) - Kitne conversations return करने हैं

**Response:**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "threadId": "thread_id",
        "otherParticipant": {
          "id": "user_id",
          "username": "jane_smith",
          "fullName": "Jane Smith",
          "avatar": "avatar_url"
        },
        "lastMessage": {
          "content": "Hello!",
          "messageType": "text",
          "createdAt": "2024-01-15T10:30:00.000Z"
        },
        "unreadCount": 2,
        "lastMessageAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "total": 1
  }
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:5001/api/chat/enhanced-message?userId=your_user_id&limit=100" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

#### Alternative API - Chat List:
**Endpoint:** `GET /api/chat/list?page=1&limit=20`

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 20) - Kitne threads per page

**Response:**
```json
{
  "success": true,
  "message": "Chat threads retrieved successfully",
  "data": {
    "threads": [
      {
        "id": "thread_id",
        "participants": [
          {
            "id": "user_id",
            "username": "jane_smith",
            "fullName": "Jane Smith",
            "avatar": "avatar_url"
          }
        ],
        "otherParticipant": {
          "id": "user_id",
          "username": "jane_smith",
          "fullName": "Jane Smith",
          "avatar": "avatar_url"
        },
        "lastMessage": {
          "id": "message_id",
          "content": "Hello!",
          "messageType": "text",
          "sender": "sender_id",
          "createdAt": "2024-01-15T10:30:00.000Z"
        },
        "lastMessageAt": "2024-01-15T10:30:00.000Z",
        "unreadCount": 2
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 10,
      "pages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

---

### 2. Message भेजने के लिए (Send Message)

#### Text Message भेजना:
**Endpoint:** `POST /api/chat/quick-message`

**Request Body:**
```json
{
  "toUserId": "recipient_user_id",
  "content": "Hello! How are you?",
  "messageType": "text"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "messageId": "message_id",
    "threadId": "thread_id",
    "content": "Hello! How are you?",
    "sentAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5001/api/chat/quick-message \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "toUserId": "recipient_user_id",
    "content": "Hello! How are you?",
    "messageType": "text"
  }'
```

---

#### Enhanced Message (with Reply Support):
**Endpoint:** `POST /api/chat/enhanced-message`

**Request Body:**
```json
{
  "toUserId": "recipient_user_id",
  "content": "Hello! How are you?",
  "messageType": "text",
  "mediaUrl": "https://example.com/image.jpg",
  "replyTo": "message_id_to_reply_to"
}
```

**Message Types:**
- `text` - Plain text message (default)
- `image` - Image message (mediaUrl required)
- `video` - Video message (mediaUrl required)
- `audio` - Audio message (mediaUrl required)
- `file` - File message (mediaUrl required)
- `location` - Location message (mediaUrl required)

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "message": {
      "_id": "message_id",
      "content": "Hello! How are you?",
      "messageType": "text",
      "sender": {
        "_id": "sender_id",
        "username": "john_doe",
        "fullName": "John Doe",
        "avatar": "avatar_url"
      },
      "recipient": {
        "_id": "recipient_id",
        "username": "jane_smith",
        "fullName": "Jane Smith",
        "avatar": "avatar_url"
      },
      "isRead": false,
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "threadId": "thread_id"
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5001/api/chat/enhanced-message \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "toUserId": "recipient_user_id",
    "content": "Hello! How are you?",
    "messageType": "text"
  }'
```

---

### 3. Media Message भेजने के लिए (Send Media)

**Endpoint:** `POST /api/chat/send-media`

**Request:** Multipart form data

**Fields:**
- `toUserId` (required) - Recipient का user ID
- `content` (required) - Message content/caption
- `messageType` (optional, default: 'text') - Message type
- `replyTo` (optional) - Reply karne ke liye message ID
- `file` (required) - Media file

**Supported File Types:**
- **Images:** jpg, jpeg, png, gif, webp, svg
- **Videos:** mp4, avi, mov, wmv, flv, webm
- **Audio:** mp3, wav, ogg, aac, m4a
- **Documents:** pdf, doc, docx, txt
- **General:** any other file type

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "message": {
      "_id": "message_id",
      "content": "Check out this image!",
      "messageType": "image",
      "sender": {
        "_id": "sender_id",
        "username": "john_doe",
        "fullName": "John Doe",
        "avatar": "avatar_url"
      },
      "recipient": {
        "_id": "recipient_id",
        "username": "jane_smith",
        "fullName": "Jane Smith",
        "avatar": "avatar_url"
      },
      "mediaUrl": "/uploads/sender_id/images/file.jpg",
      "mediaInfo": {
        "fileName": "file.jpg",
        "originalName": "photo.jpg",
        "publicUrl": "/uploads/sender_id/images/file.jpg",
        "size": 2048576,
        "mimetype": "image/jpeg",
        "folder": "images"
      },
      "isRead": false,
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "threadId": "thread_id"
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5001/api/chat/send-media \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "toUserId=recipient_user_id" \
  -F "content=Check out this image!" \
  -F "messageType=image" \
  -F "file=@/path/to/image.jpg"
```

---

### 4. Message Delete करने के लिए

**Endpoint:** `DELETE /api/chat/enhanced-message`

**Request Body:**
```json
{
  "messageId": "message_id_to_delete",
  "deleteType": "soft"
}
```

**Delete Types:**
- `soft` - Message को delete mark करता है, "[Message deleted]" दिखता है (default)
- `hard` - Message को permanently delete करता है

**Response:**
```json
{
  "success": true,
  "message": "Message deleted successfully",
  "data": {
    "messageId": "message_id",
    "deleteType": "soft",
    "mediaDeleted": false
  }
}
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:5001/api/chat/enhanced-message \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messageId": "message_id_to_delete",
    "deleteType": "soft"
  }'
```

---

### 5. Message Update करने के लिए

**Endpoint:** `PUT /api/chat/quick-message`

**Request Body:**
```json
{
  "messageId": "message_id_to_update",
  "content": "Updated message content"
}
```

**Note:** Messages को sirf 24 hours तक edit किया जा सकता है।

**Response:**
```json
{
  "success": true,
  "message": "Message updated successfully",
  "data": {
    "messageId": "message_id",
    "content": "Updated message content",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

**cURL Example:**
```bash
curl -X PUT http://localhost:5001/api/chat/quick-message \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messageId": "message_id_to_update",
    "content": "Updated message content"
  }'
```

---

### 6. Messages को Read Mark करने के लिए

**Endpoint:** `POST /api/chat/mark-read`

**Request Body:**
```json
{
  "threadId": "thread_id",
  "messageIds": ["message_id_1", "message_id_2"]
}
```

**Note:** `messageIds` optional hai. Agar provide नहीं किया, तो thread के सभी unread messages को read mark करता है।

**Response:**
```json
{
  "success": true,
  "message": "Messages marked as read",
  "data": {
    "modifiedCount": 2,
    "threadId": "thread_id",
    "unreadCount": 0
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5001/api/chat/mark-read \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "threadId": "thread_id",
    "messageIds": ["message_id_1", "message_id_2"]
  }'
```

---

### 7. User Info पाने के लिए

**Endpoint:** `GET /api/user/profile/[user_id]`

**Query Parameters:**
- `user_id` (required) - User का ID

**Response:**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "username": "jane_smith",
      "fullName": "Jane Smith",
      "avatar": "avatar_url",
      "bio": "Bio text here",
      "isPrivate": false,
      "isVerified": true,
      "followersCount": 100,
      "followingCount": 50,
      "postsCount": 25,
      "reelsCount": 10,
      "isOwnProfile": false,
      "isFollowing": true
    }
  }
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:5001/api/user/profile/user_id_here" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔔 Notification System

जब कोई user दूसरे user को message भेजता है, तो automatically notification create होती है और recipient user को notification मिलती है।

### Notification Details:

1. **Automatic Creation:** 
   - जब भी message send होता है (`POST /api/chat/quick-message`, `POST /api/chat/enhanced-message`, `POST /api/chat/send-media`)
   - Automatically notification create होती है
   - Notification type: `message`

2. **Notification Content:**
   - Text messages के लिए: `"{sender_name} sent you a message: {message_preview}"`
   - Media messages के लिए: `"{sender_name} sent you a {message_type}"` (e.g., "John sent you an image")

3. **Notification Fields:**
   - `type`: `"message"`
   - `sender`: Message sender का user ID
   - `recipient`: Message recipient का user ID
   - `content`: Notification message
   - `relatedMessage`: Related message का ID
   - `isRead`: false (default)

---

### Notifications पाने के लिए:

#### Get All Notifications:
**Endpoint:** `GET /api/notifications?page=1&limit=20`

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 20) - Kitne notifications per page
- `unreadOnly` (optional) - Agar `true`, तो sirf unread notifications

**Response:**
```json
{
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": {
    "notifications": [
      {
        "_id": "notification_id",
        "type": "message",
        "sender": {
          "_id": "sender_id",
          "username": "john_doe",
          "fullName": "John Doe",
          "avatar": "avatar_url"
        },
        "content": "John Doe sent you a message: Hello! How are you?",
        "relatedMessage": "message_id",
        "isRead": false,
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "unreadCount": 5,
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalNotifications": 5,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:5001/api/notifications?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

#### Get Unread Count:
Notifications API automatically unread count return करता है response में।

---

#### Mark Notifications as Read:
**Endpoint:** `PUT /api/notifications`

**Request Body:**
```json
{
  "notificationIds": ["notification_id_1", "notification_id_2"]
}
```

**Note:** `notificationIds` optional hai. Agar provide नहीं किया, तो सभी notifications को read mark करता है।

**Response:**
```json
{
  "success": true,
  "message": "Notifications marked as read",
  "data": {
    "modifiedCount": 2
  }
}
```

**cURL Example:**
```bash
curl -X PUT http://localhost:5001/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "notificationIds": ["notification_id_1", "notification_id_2"]
  }'
```

---

## 📊 Complete API Summary Table

| Function | Method | Endpoint | Purpose |
|----------|--------|----------|---------|
| **Get Messages** | GET | `/api/chat/enhanced-message?threadId=xxx` | Thread के messages |
| **Get Conversations** | GET | `/api/chat/enhanced-message?userId=xxx` | User के सभी conversations |
| **Get Chat List** | GET | `/api/chat/list` | All chat threads with pagination |
| **Send Message** | POST | `/api/chat/quick-message` | Text message भेजना |
| **Send Enhanced Message** | POST | `/api/chat/enhanced-message` | Message with reply support |
| **Send Media** | POST | `/api/chat/send-media` | Image/Video भेजना |
| **Delete Message** | DELETE | `/api/chat/enhanced-message` | Message delete करना |
| **Update Message** | PUT | `/api/chat/quick-message` | Message update करना |
| **Mark Read** | POST | `/api/chat/mark-read` | Messages को read mark करना |
| **Get User Info** | GET | `/api/user/profile/[user_id]` | User details |
| **Get Notifications** | GET | `/api/notifications` | All notifications |
| **Mark Notifications Read** | PUT | `/api/notifications` | Mark as read |

---

## 💡 Usage Examples

### Complete Flow Example:

1. **User A sends message to User B:**
```bash
curl -X POST http://localhost:5001/api/chat/quick-message \
  -H "Authorization: Bearer USER_A_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "toUserId": "user_b_id",
    "content": "Hello! How are you?",
    "messageType": "text"
  }'
```

2. **Automatically, User B gets notification:**
   - Notification automatically create हो जाती है
   - Type: `message`
   - Content: `"User A sent you a message: Hello! How are you?"`

3. **User B can check notifications:**
```bash
curl -X GET "http://localhost:5001/api/notifications?page=1&limit=20" \
  -H "Authorization: Bearer USER_B_TOKEN"
```

4. **User B gets all conversations:**
```bash
curl -X GET "http://localhost:5001/api/chat/enhanced-message?userId=user_b_id&limit=100" \
  -H "Authorization: Bearer USER_B_TOKEN"
```

5. **User B opens thread and gets messages:**
```bash
curl -X GET "http://localhost:5001/api/chat/enhanced-message?threadId=thread_id&limit=50" \
  -H "Authorization: Bearer USER_B_TOKEN"
```

6. **User B marks messages as read:**
```bash
curl -X POST http://localhost:5001/api/chat/mark-read \
  -H "Authorization: Bearer USER_B_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "threadId": "thread_id"
  }'
```

---

## 🛡️ Error Handling

All APIs consistent error responses return करते हैं:

**Error Response Format:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (only in development)"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created (new resources)
- `400` - Bad Request (missing/invalid parameters)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (access denied)
- `404` - Not Found
- `405` - Method Not Allowed
- `413` - Payload Too Large (file too big)
- `500` - Internal Server Error

**Common Errors:**

1. **Missing Token:**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

2. **Invalid Token:**
```json
{
  "success": false,
  "message": "Invalid token"
}
```

3. **Missing Parameters:**
```json
{
  "success": false,
  "message": "toUserId and content are required"
}
```

4. **Access Denied:**
```json
{
  "success": false,
  "message": "Access denied to this chat thread"
}
```

---

## 🔧 Important Notes

1. **Notification System:**
   - Notifications automatically create होती हैं जब message send होता है
   - Notification creation fail होने पर भी message send हो जाता है (error handling)
   - User notifications list में नए messages के लिए notifications दिखेंगी

2. **Message Limits:**
   - Messages को sirf 24 hours तक edit किया जा सकता है
   - Soft delete से message "[Message deleted]" दिखता है
   - Hard delete से message permanently remove होता है

3. **Threads:**
   - Automatically create होते हैं जब पहली बार message भेजा जाता है
   - Two users के बीच एक ही thread होता है
   - Threads sorted होते हैं lastMessageAt के basis पर

4. **Unread Count:**
   - Automatically track होता है per thread
   - Mark as read करने से count decrease होता है

5. **User Info:**
   - Chat में user details के लिए `/api/user/profile/[user_id]` use करें
   - Profile API privacy settings को respect करता है

---

## 🚀 Integration Tips

1. **Frontend में notifications check करें:**
   - Periodic polling: हर कुछ seconds में notifications API call करें
   - WebSocket (अगर implement हो): Real-time notifications के लिए

2. **Message List Update:**
   - जब message send हो, तो local state में add करें
   - नई messages के लिए periodic refresh करें

3. **Notification Badge:**
   - `unreadCount` field use करें badge display के लिए
   - Notification के type के basis पर different icons दिखाएं

---

## 📝 Summary

यह complete messaging system है जो:
- ✅ All types of messages (text, media) support करता है
- ✅ Automatic notifications create करता है
- ✅ Conversation management provide करता है
- ✅ Read/unread status track करता है
- ✅ Message edit/delete functionality provide करता है
- ✅ Proper error handling और security features

सभी APIs JWT authentication के साथ secure हैं और proper error responses return करते हैं।

