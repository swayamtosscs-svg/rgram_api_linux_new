# Messaging CRUD API Documentation

Complete messaging system with send, receive, edit, and delete functionality for Instagram-like social media platform.

## 🚀 **Features**

- **Send Messages**: Text, media, and location messages
- **Receive Messages**: Get chat history with pagination
- **Edit Messages**: Update message content (24-hour limit)
- **Delete Messages**: Soft delete (shows "[Message deleted]") or hard delete
- **Real-time Updates**: Unread count management
- **Security**: JWT authentication and user isolation
- **Media Support**: Images, videos, audio, files, and location

## 📍 **API Endpoints**

### **1. Comprehensive Messaging API**
**Endpoint:** `/api/chat/message-crud`

**Methods:**
- `POST` - Send message
- `GET` - Get messages
- `PUT` - Edit message
- `DELETE` - Delete message

### **2. Quick Messaging API**
**Endpoint:** `/api/chat/quick-message`

**Methods:** Same as above but simplified responses

## 🔐 **Authentication**

All APIs require JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 📤 **Send Message**

### **Endpoint:** `POST /api/chat/message-crud`

**Request Body:**
```json
{
  "toUserId": "68ad57cdceb840899bef3404",
  "content": "Hello! How are you?",
  "messageType": "text",
  "mediaUrl": "https://example.com/image.jpg",
  "replyTo": "message_id_to_reply_to"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "message": {
      "_id": "message_id",
      "content": "Hello! How are you?",
      "sender": {
        "username": "john_doe",
        "fullName": "John Doe",
        "avatar": "avatar_url"
      },
      "recipient": "68ad57cdceb840899bef3404",
      "messageType": "text",
      "isRead": false,
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "threadId": "thread_id"
  }
}
```

## 📥 **Get Messages**

### **Endpoint:** `GET /api/chat/message-crud?threadId=thread_id&limit=50&before=timestamp&after=timestamp`

**Query Parameters:**
- `threadId` (required): Chat thread ID
- `limit` (optional): Number of messages to fetch (default: 50)
- `before` (optional): Get messages before this timestamp
- `after` (optional): Get messages after this timestamp

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "_id": "message_id",
        "content": "Hello! How are you?",
        "sender": {
          "username": "john_doe",
          "fullName": "John Doe",
          "avatar": "avatar_url"
        },
        "recipient": "68ad57cdceb840899bef3404",
        "messageType": "text",
        "isRead": true,
        "readAt": "2024-01-15T10:35:00.000Z",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "thread": {
      "_id": "thread_id",
      "participants": ["user1_id", "user2_id"],
      "lastMessageAt": "2024-01-15T10:30:00.000Z",
      "unreadCount": { "user2_id": 0 }
    },
    "hasMore": false
  }
}
```

## ✏️ **Edit Message**

### **Endpoint:** `PUT /api/chat/message-crud`

**Request Body:**
```json
{
  "messageId": "message_id_to_edit",
  "content": "Updated message content"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message updated successfully",
  "data": {
    "message": {
      "_id": "message_id",
      "content": "Updated message content",
      "sender": "user_id",
      "recipient": "recipient_id",
      "messageType": "text",
      "isRead": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T11:00:00.000Z"
    }
  }
}
```

**⚠️ Limitations:**
- Only message sender can edit
- 24-hour time limit from creation
- Cannot edit deleted messages

## 🗑️ **Delete Message**

### **Endpoint:** `DELETE /api/chat/message-crud`

**Request Body:**
```json
{
  "messageId": "message_id_to_delete",
  "deleteType": "soft"
}
```

**Delete Types:**
- `soft` (default): Shows "[Message deleted]" but keeps in database
- `hard`: Permanently removes from database

**Response:**
```json
{
  "success": true,
  "message": "Message deleted successfully",
  "data": {
    "messageId": "message_id",
    "deleteType": "soft"
  }
}
```

**⚠️ Limitations:**
- Only message sender can delete
- Soft delete shows "[Message deleted]" to recipients

## 📱 **cURL Examples**

### **Send Message:**
```bash
curl -X POST "https://api-rgram1.vercel.app/api/chat/quick-message" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "toUserId": "68ad57cdceb840899bef3404",
    "content": "Hello! How are you?",
    "messageType": "text"
  }'
```

### **Get Messages:**
```bash
curl -X GET "https://api-rgram1.vercel.app/api/chat/quick-message?threadId=thread_id&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **Edit Message:**
```bash
curl -X PUT "https://api-rgram1.vercel.app/api/chat/quick-message" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messageId": "message_id",
    "content": "Updated message content"
  }'
```

### **Delete Message:**
```bash
curl -X DELETE "https://api-rgram1.vercel.app/api/chat/quick-message" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messageId": "message_id",
    "deleteType": "soft"
  }'
```

## 🔄 **Message Types**

| Type | Description | Media Required |
|------|-------------|----------------|
| `text` | Plain text message | No |
| `image` | Image message | Yes |
| `video` | Video message | Yes |
| `audio` | Audio message | Yes |
| `file` | File/document | Yes |
| `location` | Location sharing | Yes |

## 🛡️ **Security Features**

- **JWT Authentication**: All requests require valid token
- **User Isolation**: Users can only access their own chat threads
- **Ownership Verification**: Only message sender can edit/delete
- **Input Validation**: Content length and type validation
- **Rate Limiting**: Built-in protection against abuse

## 📊 **Database Schema**

### **Message Model:**
```typescript
interface IMessage {
  _id: string;
  thread: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  content: string;
  messageType: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location';
  mediaUrl?: string;
  isRead: boolean;
  readAt?: Date;
  reactions: Array<{ user: mongoose.Types.ObjectId; emoji: string; createdAt: Date }>;
  replyTo?: mongoose.Types.ObjectId;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### **Chat Thread Model:**
```typescript
interface IChatThread {
  _id: string;
  participants: mongoose.Types.ObjectId[];
  lastMessageAt: Date;
  lastMessage: mongoose.Types.ObjectId;
  unreadCount: { [userId: string]: number };
  isGroupChat: boolean;
  groupName?: string;
  groupAvatar?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🚨 **Error Handling**

### **Common Error Responses:**

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "message": "toUserId and content are required"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "You can only edit your own messages"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Message not found"
}
```

## 🧪 **Testing**

### **Test Script:**
```javascript
// Test all messaging operations
const testMessaging = async (token) => {
  // 1. Send message
  const sendResponse = await fetch('/api/chat/quick-message', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      toUserId: '68ad57cdceb840899bef3404',
      content: 'Test message'
    })
  });

  // 2. Get messages
  const getResponse = await fetch('/api/chat/quick-message?threadId=thread_id', {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  // 3. Edit message
  const editResponse = await fetch('/api/chat/quick-message', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messageId: 'message_id',
      content: 'Updated message'
    })
  });

  // 4. Delete message
  const deleteResponse = await fetch('/api/chat/quick-message', {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messageId: 'message_id',
      deleteType: 'soft'
    })
  });
};
```

## 🔮 **Future Enhancements**

- **Real-time Updates**: WebSocket integration
- **Message Encryption**: End-to-end encryption
- **Push Notifications**: Mobile push alerts
- **Message Search**: Advanced search functionality
- **File Upload**: Direct file upload support
- **Group Chats**: Multi-user conversations
- **Message Reactions**: Emoji reactions
- **Message Forwarding**: Forward messages to other chats

---

**Built with ❤️ using Next.js, TypeScript, and MongoDB**
