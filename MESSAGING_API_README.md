# Messaging API Documentation

This document describes the comprehensive messaging system APIs for the API Rgram application.

## Base URL
```
http://localhost:5001/api/chat
```

## Authentication
All API endpoints require authentication using JWT tokens in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### 1. Send Message
**POST** `/api/chat/send`

Send a new message to a user or create a new chat thread.

**Request Body:**
```json
{
  "toUserId": "user_id_here",
  "content": "Hello! How are you?",
  "messageType": "text",
  "mediaUrl": "https://example.com/image.jpg", // Optional for non-text messages
  "replyTo": "message_id_to_reply_to" // Optional
}
```

**Message Types:**
- `text` - Plain text message (default)
- `image` - Image message (requires mediaUrl)
- `video` - Video message (requires mediaUrl)
- `audio` - Audio message (requires mediaUrl)
- `file` - File message (requires mediaUrl)
- `location` - Location message (requires mediaUrl)

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
        "username": "sender_username",
        "fullName": "Sender Name",
        "avatar": "avatar_url"
      },
      "recipient": {
        "_id": "recipient_id",
        "username": "recipient_username",
        "fullName": "Recipient Name",
        "avatar": "avatar_url"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "threadId": "thread_id"
  }
}
```

### 2. Get Chat Threads List
**GET** `/api/chat/list?page=1&limit=20`

Get a list of all chat threads for the authenticated user.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Number of threads per page (default: 20)

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
            "username": "username",
            "fullName": "Full Name",
            "avatar": "avatar_url"
          }
        ],
        "otherParticipant": {
          "id": "other_user_id",
          "username": "other_username",
          "fullName": "Other User Name",
          "avatar": "other_avatar_url"
        },
        "lastMessage": {
          "id": "message_id",
          "content": "Last message content",
          "messageType": "text",
          "sender": "sender_id",
          "createdAt": "2024-01-01T00:00:00.000Z"
        },
        "lastMessageAt": "2024-01-01T00:00:00.000Z",
        "unreadCount": 5,
        "isGroupChat": false,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "pages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 3. Get Messages by Thread ID
**GET** `/api/chat/thread/{thread_id}?page=1&limit=50`

Get all messages in a specific chat thread with pagination.

**Path Parameters:**
- `thread_id` - The ID of the chat thread

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Number of messages per page (default: 50)

**Response:**
```json
{
  "success": true,
  "message": "Messages retrieved successfully",
  "data": {
    "messages": [
      {
        "_id": "message_id",
        "content": "Message content",
        "messageType": "text",
        "sender": {
          "_id": "sender_id",
          "username": "sender_username",
          "fullName": "Sender Name",
          "avatar": "avatar_url"
        },
        "recipient": {
          "_id": "recipient_id",
          "username": "recipient_username",
          "fullName": "Recipient Name",
          "avatar": "avatar_url"
        },
        "isRead": true,
        "readAt": "2024-01-01T00:00:00.000Z",
        "reactions": [
          {
            "user": "user_id",
            "emoji": "👍",
            "createdAt": "2024-01-01T00:00:00.000Z"
          }
        ],
        "replyTo": {
          "_id": "reply_message_id",
          "content": "Original message",
          "sender": "original_sender_id"
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150,
      "pages": 3,
      "hasNext": true,
      "hasPrev": false
    },
    "thread": {
      "id": "thread_id",
      "participants": ["user_id_1", "user_id_2"],
      "isGroupChat": false,
      "lastMessageAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 4. Get Messages by User ID (Legacy)
**GET** `/api/chat/messages/{user_id}`

Get messages between the authenticated user and another specific user.

**Path Parameters:**
- `user_id` - The ID of the other user

**Response:**
```json
{
  "success": true,
  "message": "Messages",
  "data": {
    "messages": [
      {
        "_id": "message_id",
        "content": "Message content",
        "sender": {
          "_id": "sender_id",
          "username": "sender_username",
          "fullName": "Sender Name",
          "avatar": "avatar_url"
        },
        "recipient": {
          "_id": "recipient_id",
          "username": "recipient_username",
          "fullName": "Recipient Name",
          "avatar": "avatar_url"
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### 5. Mark Messages as Read
**POST** `/api/chat/mark-read`

Mark messages as read in a specific thread.

**Request Body:**
```json
{
  "threadId": "thread_id",
  "messageIds": ["message_id_1", "message_id_2"] // Optional: specific message IDs
}
```

**Response:**
```json
{
  "success": true,
  "message": "Messages marked as read",
  "data": {
    "modifiedCount": 5,
    "threadId": "thread_id",
    "unreadCount": 0
  }
}
```

### 6. Delete Message
**DELETE** `/api/chat/delete-message`

Delete a message (soft delete - only the sender can delete their own messages).

**Request Body:**
```json
{
  "messageId": "message_id_to_delete"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message deleted successfully",
  "data": {
    "messageId": "message_id",
    "deletedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 7. Search Messages
**GET** `/api/chat/search?q=search_term&threadId=thread_id&page=1&limit=20`

Search through messages using text search.

**Query Parameters:**
- `q` - Search query (required)
- `threadId` - Optional: limit search to specific thread
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 20)

**Response:**
```json
{
  "success": true,
  "message": "Search completed successfully",
  "data": {
    "messages": [
      {
        "_id": "message_id",
        "content": "Message containing search term",
        "sender": {
          "_id": "sender_id",
          "username": "sender_username",
          "fullName": "Sender Name",
          "avatar": "avatar_url"
        },
        "thread": {
          "id": "thread_id",
          "participants": ["user_id_1", "user_id_2"]
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "query": "search_term",
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25,
      "pages": 2,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 8. Get Unread Count
**GET** `/api/chat/unread-count`

Get unread message counts for all threads and total unread count.

**Response:**
```json
{
  "success": true,
  "message": "Unread counts retrieved successfully",
  "data": {
    "totalUnread": 15,
    "threads": [
      {
        "threadId": "thread_id",
        "unreadCount": 5,
        "lastMessageAt": "2024-01-01T00:00:00.000Z",
        "otherParticipant": {
          "id": "other_user_id",
          "username": "other_username",
          "fullName": "Other User Name",
          "avatar": "avatar_url"
        },
        "isGroupChat": false
      }
    ]
  }
}
```

### 9. Add/Remove Reaction
**POST** `/api/chat/reaction` - Add or update reaction
**DELETE** `/api/chat/reaction` - Remove reaction

Add, update, or remove reactions on messages.

**Request Body:**
```json
{
  "messageId": "message_id",
  "emoji": "👍"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reaction added successfully",
  "data": {
    "messageId": "message_id",
    "reactions": [
      {
        "user": "user_id",
        "emoji": "👍",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (only in development)"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created (for new resources)
- `400` - Bad Request (missing/invalid parameters)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (access denied)
- `404` - Not Found
- `405` - Method Not Allowed
- `500` - Internal Server Error

## Features

### Message Types
- **Text Messages**: Plain text with support for markdown-like formatting
- **Media Messages**: Images, videos, audio, and files with URL storage
- **Location Messages**: Geographic coordinates and location data
- **Reply Messages**: Reply to specific messages in threads

### Message Status
- **Read/Unread Tracking**: Automatic tracking of message read status
- **Unread Counts**: Per-thread and total unread message counts
- **Read Timestamps**: When messages were read

### Message Interactions
- **Reactions**: Emoji reactions on messages
- **Soft Delete**: Messages can be deleted but remain in database
- **Search**: Full-text search across message content

### Thread Management
- **Auto-creation**: Threads are automatically created when first message is sent
- **Participant Management**: Support for both 1-on-1 and group chats
- **Last Message Tracking**: Always shows the most recent message
- **Activity Timestamps**: Track when threads were last active

### Performance Features
- **Pagination**: All list endpoints support pagination
- **Database Indexing**: Optimized queries with proper MongoDB indexes
- **Population**: Efficient loading of related user data
- **Lean Queries**: Fast data retrieval without Mongoose overhead

## Usage Examples

### JavaScript/Node.js
```javascript
const sendMessage = async (toUserId, content) => {
  const response = await fetch('/api/chat/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      toUserId,
      content,
      messageType: 'text'
    })
  });
  
  return response.json();
};

const getThreadMessages = async (threadId, page = 1) => {
  const response = await fetch(`/api/chat/thread/${threadId}?page=${page}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};
```

### cURL Examples
```bash
# Send a message
curl -X POST http://localhost:5001/api/chat/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"toUserId":"user_id","content":"Hello!","messageType":"text"}'

# Get chat threads
curl -X GET http://localhost:5001/api/chat/list \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get messages in a thread
curl -X GET http://localhost:5001/api/chat/thread/thread_id \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Database Schema

The messaging system uses two main collections:

### ChatThread
- `participants`: Array of user IDs
- `lastMessageAt`: Timestamp of last message
- `lastMessage`: Reference to last message
- `unreadCount`: Map of user ID to unread count
- `isGroupChat`: Boolean for group chat support
- `groupName`: Name for group chats
- `groupAvatar`: Avatar for group chats

### Message
- `thread`: Reference to chat thread
- `sender`: Reference to sender user
- `recipient`: Reference to recipient user
- `content`: Message content
- `messageType`: Type of message
- `mediaUrl`: URL for media messages
- `isRead`: Read status
- `readAt`: Read timestamp
- `reactions`: Array of user reactions
- `replyTo`: Reference to replied message
- `isDeleted`: Soft delete flag
- `deletedAt`: Deletion timestamp

## Security Features

- **JWT Authentication**: All endpoints require valid JWT tokens
- **User Authorization**: Users can only access their own conversations
- **Input Validation**: All inputs are validated and sanitized
- **Rate Limiting**: Built-in protection against abuse
- **Soft Deletes**: Messages are never permanently deleted
- **Access Control**: Users can only modify their own messages

## Performance Considerations

- **Database Indexes**: Optimized for common query patterns
- **Pagination**: Prevents loading large datasets
- **Lean Queries**: Fast data retrieval without Mongoose overhead
- **Population Limits**: Only load necessary user data
- **Caching**: Consider implementing Redis for frequently accessed data

## Future Enhancements

- **Real-time Messaging**: WebSocket support for instant messaging
- **Push Notifications**: Mobile push notifications for new messages
- **Message Encryption**: End-to-end encryption for privacy
- **File Upload**: Direct file upload to cloud storage
- **Message Threading**: Better support for conversation threads
- **Typing Indicators**: Show when users are typing
- **Message Status**: Delivered, read receipts
- **Message Pinning**: Pin important messages in threads
