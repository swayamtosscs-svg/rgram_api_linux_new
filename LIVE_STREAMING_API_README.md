# 🔴 Live Streaming API Documentation

A comprehensive live streaming API system for religious content including darshan, puja, aarti, bhajan, and discourse streams.

## 🚀 Features

- **Live Stream Management**: Create, start, end, and manage live streams
- **Real-time Viewer Tracking**: Track viewer joins, leaves, and engagement
- **Live Comments**: Real-time commenting system with moderation
- **Stream Discovery**: Search and filter live streams by category, status, etc.
- **Privacy Controls**: Support for private streams with viewer restrictions
- **Analytics**: Comprehensive stream analytics and viewer metrics
- **Multi-language Support**: Support for Hindi, English, Sanskrit, and Gujarati
- **Quality Options**: Multiple streaming quality options (480p, 720p, 1080p)

## 📋 API Endpoints

### 1. Create Live Stream
**POST** `/api/live-stream/create`

Creates a new live stream with specified settings.

**Request Body:**
```json
{
  "title": "Morning Darshan - Live",
  "description": "Join us for morning darshan and prayers",
  "category": "darshan",
  "isPrivate": false,
  "allowedViewers": [],
  "settings": {
    "quality": "720p",
    "enableChat": true,
    "enableLikes": true,
    "enableComments": true,
    "enableScreenShare": false,
    "maxViewers": 1000,
    "isArchived": true,
    "moderationEnabled": true,
    "language": "hindi",
    "deityName": "Krishna",
    "templeInfo": {
      "name": "ISKCON Temple",
      "location": "Mumbai, India",
      "contact": "+91-1234567890"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Live stream created successfully",
  "data": {
    "streamId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "streamKey": "stream_user123_1698765432123_abc123def",
    "streamUrl": "rtmp://your-streaming-server/live/stream_user123_1698765432123_abc123def",
    "playbackUrl": "https://your-streaming-server/live/stream_user123_1698765432123_abc123def/index.m3u8",
    "status": "pending"
  }
}
```

### 2. Start Live Stream
**POST** `/api/live-stream/start`

Starts a pending live stream.

**Request Body:**
```json
{
  "streamId": "64f8a1b2c3d4e5f6a7b8c9d0"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Live stream started successfully",
  "data": {
    "streamId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "status": "live",
    "startedAt": "2024-01-15T10:00:00.000Z",
    "streamUrl": "rtmp://your-streaming-server/live/stream_user123_1698765432123_abc123def",
    "playbackUrl": "https://your-streaming-server/live/stream_user123_1698765432123_abc123def/index.m3u8"
  }
}
```

### 3. End Live Stream
**POST** `/api/live-stream/end`

Ends an active live stream.

**Request Body:**
```json
{
  "streamId": "64f8a1b2c3d4e5f6a7b8c9d0"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Live stream ended successfully",
  "data": {
    "streamId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "status": "ended",
    "endedAt": "2024-01-15T11:30:00.000Z",
    "duration": 5400,
    "finalViewerCount": 150,
    "peakViewerCount": 200,
    "totalViews": 500
  }
}
```

### 4. Get Stream Details
**GET** `/api/live-stream/[id]`

Retrieves detailed information about a specific live stream.

**Response:**
```json
{
  "success": true,
  "data": {
    "streamId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "userId": "user123",
    "username": "TempleAdmin",
    "title": "Morning Darshan - Live",
    "description": "Join us for morning darshan and prayers",
    "status": "live",
    "category": "darshan",
    "streamUrl": "rtmp://your-streaming-server/live/stream_user123_1698765432123_abc123def",
    "playbackUrl": "https://your-streaming-server/live/stream_user123_1698765432123_abc123def/index.m3u8",
    "thumbnailUrl": "https://example.com/thumbnail.jpg",
    "startedAt": "2024-01-15T10:00:00.000Z",
    "endedAt": null,
    "duration": 1800,
    "viewerCount": 150,
    "peakViewerCount": 200,
    "totalViews": 500,
    "likes": 25,
    "comments": 12,
    "isPrivate": false,
    "allowedViewers": [],
    "tags": ["darshan", "morning", "temple", "prayers"],
    "location": "Mumbai, India",
    "settings": {
      "quality": "720p",
      "enableChat": true,
      "enableLikes": true,
      "enableComments": true,
      "enableScreenShare": false,
      "maxViewers": 1000,
      "isArchived": true,
      "moderationEnabled": true,
      "language": "hindi",
      "deityName": "Krishna",
      "templeInfo": {
        "name": "ISKCON Temple",
        "location": "Mumbai, India",
        "contact": "+91-1234567890"
      }
    },
    "createdAt": "2024-01-15T09:45:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### 5. Update Stream
**PUT** `/api/live-stream/[id]`

Updates stream details (only for pending streams).

**Request Body:**
```json
{
  "title": "Updated Morning Darshan",
  "description": "Updated description",
  "category": "puja",
  "isPrivate": true,
  "allowedViewers": ["user456", "user789"]
}
```

### 6. Delete Stream
**DELETE** `/api/live-stream/[id]`

Deletes a pending stream.

### 7. List Live Streams
**GET** `/api/live-stream/list`

Lists live streams with filtering and pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `status`: Stream status (live, ended, pending, cancelled, all)
- `category`: Stream category (darshan, puja, aarti, bhajan, discourse, other, all)
- `search`: Search query for title, description, or username
- `userId`: Filter by streamer ID
- `sortBy`: Sort field (createdAt, viewerCount, likes)
- `sortOrder`: Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "streams": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### 8. Live Comments
**GET** `/api/live-stream/comments?streamId=[id]`

Retrieves comments for a live stream.

**POST** `/api/live-stream/comments`

Posts a new comment.

**Request Body:**
```json
{
  "streamId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "message": "Beautiful darshan! 🙏",
  "parentComment": "comment_id_for_reply"
}
```

**PUT** `/api/live-stream/comments`

Updates an existing comment.

**DELETE** `/api/live-stream/comments`

Deletes a comment.

### 9. Viewer Tracking
**POST** `/api/live-stream/viewer`

Tracks viewer joins and leaves.

**Request Body:**
```json
{
  "streamId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "action": "join" // or "leave"
}
```

### 10. Stream Likes
**POST** `/api/live-stream/like`

Manages stream likes.

**Request Body:**
```json
{
  "streamId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "action": "like" // or "unlike"
}
```

## 🗄️ Database Models

### LiveStream Model
```typescript
interface ILiveStream {
  userId: string;
  username: string;
  title: string;
  description?: string;
  status: 'pending' | 'live' | 'ended' | 'cancelled';
  streamKey: string;
  streamUrl: string;
  playbackUrl: string;
  thumbnailUrl?: string;
  startedAt?: Date;
  endedAt?: Date;
  duration: number;
  viewerCount: number;
  peakViewerCount: number;
  totalViews: number;
  likes: number;
  comments: number;
  isPrivate: boolean;
  allowedViewers?: string[];
  activeViewers?: string[];
  viewerHistory?: Array<{
    viewerId: string;
    joinedAt: Date;
    leftAt?: Date;
    watchDuration?: number;
  }>;
  category: 'darshan' | 'puja' | 'aarti' | 'bhajan' | 'discourse' | 'other';
  tags?: string[];
  location?: string;
  settings: {
    quality: '720p' | '1080p' | '480p';
    enableChat: boolean;
    enableLikes: boolean;
    enableComments: boolean;
    enableScreenShare: boolean;
    maxViewers?: number;
    isArchived: boolean;
    moderationEnabled: boolean;
    language: string;
    deityName?: string;
    templeInfo?: {
      name: string;
      location: string;
      contact?: string;
    };
  };
}
```

### LiveComment Model
```typescript
interface ILiveComment {
  streamId: string;
  userId: string;
  username: string;
  userAvatar?: string;
  message: string;
  timestamp: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  likes: number;
  replies: string[];
  parentComment?: string;
  isHighlighted: boolean;
  isPinned: boolean;
}
```

## 🔐 Authentication

All endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📱 Demo Application

A comprehensive demo application is available at `/public/live-streaming-demo.html` that allows you to:

- Create and manage live streams
- Test all API endpoints
- View live stream details
- Post and view comments
- Track viewer engagement

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 16+
- MongoDB
- JWT authentication system
- Streaming server (e.g., RTMP server, HLS)

### 2. Installation
```bash
# Install dependencies
npm install

# Set up environment variables
cp env-template.txt .env.local

# Start development server
npm run dev
```

### 3. Environment Variables
```env
MONGODB_URI=mongodb://localhost:27017/your-database
JWT_SECRET=your-jwt-secret
STREAMING_SERVER_URL=rtmp://your-streaming-server
PLAYBACK_SERVER_URL=https://your-playback-server
```

### 4. Testing the APIs
1. Open `/public/live-streaming-demo.html` in your browser
2. Use the demo interface to test all endpoints
3. Check the browser console for detailed responses

## 🔧 Configuration

### Streaming Server Setup
The API generates RTMP URLs for streaming. You'll need to:

1. Set up an RTMP server (e.g., nginx-rtmp, Ant Media Server)
2. Configure HLS output for playback
3. Update the `STREAMING_SERVER_URL` and `PLAYBACK_SERVER_URL` in your environment

### Quality Settings
- **480p**: Lower bandwidth, wider compatibility
- **720p**: Balanced quality and bandwidth (default)
- **1080p**: High quality, higher bandwidth

### Privacy Controls
- **Public Streams**: Visible to all users
- **Private Streams**: Only visible to allowed viewers
- **Viewer Restrictions**: Control who can access private streams

## 📊 Analytics & Metrics

The system tracks comprehensive metrics:

- **Viewer Count**: Current active viewers
- **Peak Viewers**: Highest concurrent viewer count
- **Total Views**: Cumulative unique viewers
- **Watch Duration**: Individual viewer engagement
- **Engagement**: Likes, comments, and interactions

## 🛡️ Security Features

- **JWT Authentication**: Secure API access
- **User Authorization**: Users can only manage their own streams
- **Content Moderation**: Built-in moderation controls
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Comprehensive request validation

## 🔄 Real-time Features

- **Live Viewer Tracking**: Real-time viewer count updates
- **Live Comments**: Instant comment posting and retrieval
- **Stream Status Updates**: Real-time status changes
- **Engagement Metrics**: Live like and comment counts

## 🌐 API Rate Limits

- **Create Stream**: 5 requests per minute per user
- **Start/End Stream**: 10 requests per minute per user
- **Comments**: 20 requests per minute per user
- **Viewer Tracking**: 30 requests per minute per user

## 📝 Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `405`: Method Not Allowed
- `500`: Internal Server Error

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the demo application for usage examples
- Review the API documentation

## 🔮 Future Enhancements

- **WebRTC Support**: Browser-based streaming
- **Multi-bitrate Streaming**: Adaptive bitrate streaming
- **Advanced Analytics**: Detailed viewer behavior analysis
- **Content Moderation AI**: Automated content filtering
- **Mobile SDK**: Native mobile app support
- **CDN Integration**: Global content delivery
- **Monetization**: Subscription and donation features
