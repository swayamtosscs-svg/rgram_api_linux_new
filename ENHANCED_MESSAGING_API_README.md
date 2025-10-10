# Enhanced Messaging API with Media Support

This document describes the comprehensive messaging system with image and video support, including local storage management and database operations.

## 🚀 **Features**

- **Send Messages**: Text, images, videos, audio, and files with local storage
- **Receive Messages**: Get chat history with media information
- **Edit Messages**: Update message content (24-hour limit)
- **Delete Messages**: Soft delete or hard delete with media cleanup
- **Media Management**: Upload, retrieve, and delete media files
- **Local Storage**: Files stored in organized folder structure
- **Database Integration**: Media metadata stored in MongoDB
- **Security**: JWT authentication and user isolation
- **File Organization**: Automatic categorization by file type

## 📍 **API Endpoints**

### **1. Enhanced Messaging API**
**Endpoint:** `/api/chat/enhanced-message`

**Methods:**
- `POST` - Send message with media upload
- `GET` - Get messages with media info
- `PUT` - Edit message content
- `DELETE` - Delete message and media

### **2. Media Management API**
**Endpoint:** `/api/chat/media-management`

**Methods:**
- `GET` - Get user's media files
- `DELETE` - Delete specific media file
- `POST` - Cleanup orphaned media files

## 🔐 **Authentication**

All APIs require JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 📤 **Send Message with Media**

### **Endpoint:** `POST /api/chat/enhanced-message`

**Request:** Multipart form data
```
Content-Type: multipart/form-data

Fields:
- toUserId: string (required)
- content: string (required)
- messageType: string (optional, default: 'text')
- replyTo: string (optional)

Files:
- file: File (optional, for media messages)
```

**Supported File Types:**
- Images: jpg, jpeg, png, gif, webp, svg
- Videos: mp4, avi, mov, wmv, flv, webm
- Audio: mp3, wav, ogg, aac, m4a
- Documents: pdf, doc, docx, txt
- General: any other file type

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "message": {
      "_id": "message_id",
      "content": "Hello! Check out this image",
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
      "mediaUrl": "/uploads/sender_id/images/sender_id_1640995200000_abc123def.jpg",
      "mediaInfo": {
        "fileName": "sender_id_1640995200000_abc123def.jpg",
        "originalName": "vacation_photo.jpg",
        "localPath": "/path/to/public/uploads/sender_id/images/sender_id_1640995200000_abc123def.jpg",
        "publicUrl": "/uploads/sender_id/images/sender_id_1640995200000_abc123def.jpg",
        "size": 2048576,
        "mimetype": "image/jpeg",
        "folder": "images",
        "uploadedAt": "2024-01-01T10:30:00.000Z"
      },
      "isRead": false,
      "createdAt": "2024-01-01T10:30:00.000Z"
    },
    "threadId": "thread_id",
    "mediaInfo": {
      "fileName": "sender_id_1640995200000_abc123def.jpg",
      "originalName": "vacation_photo.jpg",
      "publicUrl": "/uploads/sender_id/images/sender_id_1640995200000_abc123def.jpg",
      "size": 2048576,
      "mimetype": "image/jpeg",
      "folder": "images"
    }
  }
}
```

## 📥 **Get Messages**

### **Endpoint:** `GET /api/chat/enhanced-message?threadId=thread_id&limit=50&before=timestamp&after=timestamp`

**Query Parameters:**
- `threadId` - Chat thread ID (required)
- `limit` - Number of messages per page (default: 50)
- `before` - Get messages before this timestamp
- `after` - Get messages after this timestamp

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "_id": "message_id",
        "content": "Hello! Check out this image",
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
        "mediaUrl": "/uploads/sender_id/images/sender_id_1640995200000_abc123def.jpg",
        "mediaInfo": {
          "fileName": "sender_id_1640995200000_abc123def.jpg",
          "originalName": "vacation_photo.jpg",
          "publicUrl": "/uploads/sender_id/images/sender_id_1640995200000_abc123def.jpg",
          "size": 2048576,
          "mimetype": "image/jpeg",
          "folder": "images",
          "uploadedAt": "2024-01-01T10:30:00.000Z"
        },
        "isRead": true,
        "readAt": "2024-01-01T10:35:00.000Z",
        "createdAt": "2024-01-01T10:30:00.000Z"
      }
    ],
    "thread": {
      "_id": "thread_id",
      "participants": ["sender_id", "recipient_id"],
      "lastMessageAt": "2024-01-01T10:30:00.000Z"
    },
    "hasMore": false
  }
}
```

## ✏️ **Edit Message**

### **Endpoint:** `PUT /api/chat/enhanced-message`

**Request Body:**
```json
{
  "messageId": "message_id",
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
      "messageType": "text",
      "sender": {
        "_id": "sender_id",
        "username": "john_doe",
        "fullName": "John Doe",
        "avatar": "avatar_url"
      },
      "updatedAt": "2024-01-01T11:00:00.000Z"
    }
  }
}
```

## 🗑️ **Delete Message**

### **Endpoint:** `DELETE /api/chat/enhanced-message`

**Request Body:**
```json
{
  "messageId": "message_id",
  "deleteType": "soft"
}
```

**Delete Types:**
- `soft` - Mark as deleted, remove media info (default)
- `hard` - Permanently delete message and media files

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

## 📁 **Media Management**

### **Get Media Files**

**Endpoint:** `GET /api/chat/media-management?folder=images&messageId=message_id`

**Query Parameters:**
- `folder` - Filter by folder (images, videos, audio, documents, general)
- `messageId` - Get media for specific message

**Response:**
```json
{
  "success": true,
  "data": {
    "mediaByFolder": {
      "images": [
        {
          "messageId": "message_id",
          "fileName": "sender_id_1640995200000_abc123def.jpg",
          "originalName": "vacation_photo.jpg",
          "publicUrl": "/uploads/sender_id/images/sender_id_1640995200000_abc123def.jpg",
          "size": 2048576,
          "mimetype": "image/jpeg",
          "folder": "images",
          "uploadedAt": "2024-01-01T10:30:00.000Z",
          "messageType": "image",
          "messageContent": "Check out this photo!",
          "createdAt": "2024-01-01T10:30:00.000Z"
        }
      ],
      "videos": [],
      "audio": [],
      "documents": [],
      "general": []
    },
    "summary": {
      "totalFiles": 1,
      "totalSize": 2048576,
      "totalSizeFormatted": "2.05 MB",
      "folders": [
        {
          "name": "images",
          "count": 1,
          "size": 2048576
        },
        {
          "name": "videos",
          "count": 0,
          "size": 0
        }
      ]
    }
  }
}
```

### **Delete Media File**

**Endpoint:** `DELETE /api/chat/media-management`

**Request Body:**
```json
{
  "messageId": "message_id",
  "fileName": "sender_id_1640995200000_abc123def.jpg",
  "deleteFromDB": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Media file processed successfully",
  "data": {
    "messageId": "message_id",
    "fileName": "sender_id_1640995200000_abc123def.jpg",
    "originalName": "vacation_photo.jpg",
    "fileDeleted": true,
    "dbUpdated": true,
    "actions": {
      "fileDeleted": true,
      "databaseUpdated": true,
      "messageDeleted": false
    }
  }
}
```

### **Cleanup Orphaned Media**

**Endpoint:** `POST /api/chat/media-management`

**Request Body:**
```json
{
  "dryRun": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Orphaned files scan completed",
  "data": {
    "dryRun": true,
    "summary": {
      "totalFilesInDB": 5,
      "totalFilesOnDisk": 7,
      "orphanedFiles": 2,
      "deletedFiles": 0,
      "totalSizeFreed": 0,
      "totalSizeFreedFormatted": "0 Bytes"
    },
    "orphanedFiles": [
      {
        "name": "old_file.jpg",
        "folder": "images",
        "size": 1024000,
        "sizeFormatted": "1.02 MB",
        "modified": "2024-01-01T09:00:00.000Z",
        "path": "/path/to/public/uploads/user_id/images/old_file.jpg"
      }
    ],
    "deletedFiles": []
  }
}
```

## 📂 **File Storage Structure**

Files are organized in the following structure:
```
public/uploads/
└── {userId}/
    ├── images/
    │   ├── {userId}_{timestamp}_{random}.jpg
    │   └── {userId}_{timestamp}_{random}.png
    ├── videos/
    │   ├── {userId}_{timestamp}_{random}.mp4
    │   └── {userId}_{timestamp}_{random}.avi
    ├── audio/
    │   ├── {userId}_{timestamp}_{random}.mp3
    │   └── {userId}_{timestamp}_{random}.wav
    ├── documents/
    │   ├── {userId}_{timestamp}_{random}.pdf
    │   └── {userId}_{timestamp}_{random}.docx
    └── general/
        └── {userId}_{timestamp}_{random}.{ext}
```

## 🔧 **Usage Examples**

### **JavaScript/Node.js**

```javascript
// Send message with image
const sendMessageWithImage = async (toUserId, content, imageFile) => {
  const formData = new FormData();
  formData.append('toUserId', toUserId);
  formData.append('content', content);
  formData.append('messageType', 'image');
  formData.append('file', imageFile);

  const response = await fetch('/api/chat/enhanced-message', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  return response.json();
};

// Get messages
const getMessages = async (threadId) => {
  const response = await fetch(`/api/chat/enhanced-message?threadId=${threadId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};

// Delete media file
const deleteMediaFile = async (messageId, deleteFromDB = false) => {
  const response = await fetch('/api/chat/media-management', {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messageId,
      deleteFromDB
    })
  });
  
  return response.json();
};
```

### **cURL Examples**

```bash
# Send message with image
curl -X POST http://localhost:5001/api/chat/enhanced-message \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "toUserId=recipient_id" \
  -F "content=Check out this photo!" \
  -F "messageType=image" \
  -F "file=@/path/to/image.jpg"

# Get messages
curl -X GET "http://localhost:5001/api/chat/enhanced-message?threadId=thread_id" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Delete message
curl -X DELETE http://localhost:5001/api/chat/enhanced-message \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"messageId":"message_id","deleteType":"soft"}'

# Get media files
curl -X GET "http://localhost:5001/api/chat/media-management?folder=images" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Delete media file
curl -X DELETE http://localhost:5001/api/chat/media-management \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"messageId":"message_id","deleteFromDB":true}'

# Cleanup orphaned files
curl -X POST http://localhost:5001/api/chat/media-management \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"dryRun":false}'
```

## 🛡️ **Security Features**

- **JWT Authentication**: All endpoints require valid JWT tokens
- **User Authorization**: Users can only access their own conversations and media
- **File Type Validation**: Only allowed file types can be uploaded
- **File Size Limits**: Maximum 100MB per file
- **Path Traversal Protection**: Files are stored in user-specific directories
- **Input Validation**: All inputs are validated and sanitized

## 📊 **Database Schema**

### **Enhanced Message Model**
```typescript
interface IMessage {
  _id: string;
  thread: ObjectId;
  sender: ObjectId;
  recipient: ObjectId;
  content: string;
  messageType: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location';
  mediaUrl?: string;
  mediaInfo?: {
    fileName: string;
    originalName: string;
    localPath: string;
    publicUrl: string;
    size: number;
    mimetype: string;
    folder: string;
    uploadedAt: Date;
  };
  isRead: boolean;
  readAt?: Date;
  reactions: Array<{
    user: ObjectId;
    emoji: string;
    createdAt: Date;
  }>;
  replyTo?: ObjectId;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## ⚡ **Performance Considerations**

- **File Organization**: Files are organized by type for efficient access
- **Database Indexing**: Optimized queries with proper MongoDB indexes
- **Pagination**: All list endpoints support pagination
- **Lean Queries**: Fast data retrieval without Mongoose overhead
- **File Cleanup**: Orphaned file detection and cleanup tools
- **Storage Management**: Automatic file size tracking and reporting

## 🔄 **Error Handling**

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
- `413` - Payload Too Large (file too big)
- `500` - Internal Server Error

## 🚀 **Future Enhancements**

- **Cloud Storage Integration**: Support for AWS S3, Google Cloud Storage
- **Image Processing**: Automatic thumbnail generation and optimization
- **Video Streaming**: Support for video streaming and transcoding
- **File Compression**: Automatic compression for large files
- **CDN Integration**: Content delivery network for faster access
- **Real-time Updates**: WebSocket support for instant messaging
- **Push Notifications**: Mobile push notifications for new messages
- **Message Encryption**: End-to-end encryption for privacy
