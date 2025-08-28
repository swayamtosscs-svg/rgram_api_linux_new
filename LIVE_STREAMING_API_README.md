# 🎥 Live Streaming API - Instagram-like Live System

A comprehensive API system for live streaming functionality similar to Instagram Live, built with Next.js, TypeScript, and MongoDB.

## 🚀 **Features**

### **Core Live Streaming**
- **Start Stream**: Create and configure live streams
- **Go Live**: Transition from pending to live status
- **End Stream**: Stop broadcasting and calculate final stats
- **Join/Leave**: Real-time viewer management
- **Stream Discovery**: Browse and search live streams

### **Real-time Interaction**
- **Live Comments**: Real-time commenting system
- **Live Likes**: Instant like reactions
- **Viewer Count**: Real-time viewer tracking
- **Stream Settings**: Dynamic configuration updates
- **🆕 Active Viewer Tracking**: Track who is currently watching
- **🆕 Viewer History**: Record join/leave patterns and watch duration

### **Advanced Features**
- **Private Streams**: Restricted access control
- **Quality Settings**: Multiple resolution options
- **Category & Tags**: Content organization
- **Location Support**: Geographic streaming
- **Screen Sharing**: Enhanced broadcasting options

## 📁 **API Endpoints**

### **1. Stream Management**

#### **Start Live Stream**
```http
POST /api/live/start
```
**Body:**
```json
{
  "userId": "user_id_here",
  "title": "My Live Stream",
  "description": "Join me for an amazing live session!",
  "isPrivate": false,
  "allowedViewers": ["user1", "user2"],
  "category": "gaming",
  "tags": ["gaming", "live", "fun"],
  "location": "New York",
  "settings": {
    "quality": "720p",
    "enableChat": true,
    "enableLikes": true,
    "enableComments": true,
    "enableScreenShare": false,
    "maxViewers": 1000
  }
}
```

#### **Go Live**
```http
PUT /api/live/go-live
```
**Body:**
```json
{
  "streamId": "stream_id_here",
  "userId": "user_id_here"
}
```

#### **End Stream**
```http
PUT /api/live/end
```
**Body:**
```json
{
  "streamId": "stream_id_here",
  "userId": "user_id_here"
}
```

### **2. Viewer Management**

#### **Join Stream**
```http
POST /api/live/join
```
**Body:**
```json
{
  "streamId": "stream_id_here",
  "viewerId": "viewer_id_here"
}
```

#### **Leave Stream**
```http
POST /api/live/leave
```
**Body:**
```json
{
  "streamId": "stream_id_here",
  "viewerId": "viewer_id_here"
}
```

#### **🆕 Get Stream Viewers**
```http
GET /api/live/viewers?streamId=stream_id_here
```
**NEW**: Get detailed information about current viewers including viewer IDs, usernames, and watch statistics.

### **3. Stream Discovery**

#### **Get Live Streams**
```http
GET /api/live/streams?category=gaming&tags=gaming,live&location=New%20York&limit=20&page=1&sortBy=viewerCount&sortOrder=desc
```

#### **Get Stream Info**
```http
GET /api/live/stream/{streamId}?includeComments=true&commentsLimit=20
```

### **4. Real-time Interaction**

#### **Like Stream**
```http
POST /api/live/like
```
**Body:**
```json
{
  "streamId": "stream_id_here",
  "userId": "user_id_here"
}
```

#### **Add Comment**
```http
POST /api/live/comment
```
**Body:**
```json
{
  "streamId": "stream_id_here",
  "userId": "user_id_here",
  "message": "Amazing stream! 🔥",
  "parentCommentId": "comment_id_for_reply"
}
```

#### **Get Comments**
```http
GET /api/live/comments?streamId=stream_id_here&limit=50&page=1&sortBy=timestamp&sortOrder=desc&includeReplies=true
```

### **5. Stream Configuration**

#### **Update Settings**
```http
PUT /api/live/update-settings
```
**Body:**
```json
{
  "streamId": "stream_id_here",
  "userId": "user_id_here",
  "title": "Updated Stream Title",
  "isPrivate": true,
  "allowedViewers": ["user1", "user2", "user3"],
  "settings": {
    "enableComments": false,
    "maxViewers": 500
  }
}
```

## 🗄️ **Database Models**

### **LiveStream Schema**
```typescript
{
  userId: string;           // Streamer's user ID
  username: string;         // Streamer's username
  title: string;            // Stream title
  description?: string;     // Stream description
  status: 'pending' | 'live' | 'ended' | 'cancelled';
  streamKey: string;        // Unique streaming key
  streamUrl: string;        // RTMP input URL
  playbackUrl: string;      // HLS playback URL
  thumbnailUrl?: string;    // Stream thumbnail
  startedAt?: Date;         // When stream went live
  endedAt?: Date;           // When stream ended
  duration: number;         // Stream duration in seconds
  viewerCount: number;      // Current viewers
  peakViewerCount: number;  // Peak viewer count
  totalViews: number;       // Total unique views
  likes: number;            // Total likes
  comments: number;         // Total comments
  isPrivate: boolean;       // Private stream flag
  allowedViewers?: string[]; // Allowed viewers for private streams
  activeViewers?: string[];  // 🆕 Currently watching viewers
  viewerHistory?: Array<{   // 🆕 Viewer join/leave history
    viewerId: string;
    joinedAt: Date;
    leftAt?: Date;
    watchDuration?: number; // in seconds
  }>;
  category?: string;        // Stream category
  tags?: string[];          // Stream tags
  location?: string;        // Stream location
  settings: {               // Stream configuration
    quality: '720p' | '1080p' | '480p';
    enableChat: boolean;
    enableLikes: boolean;
    enableComments: boolean;
    enableScreenShare: boolean;
    maxViewers?: number;
  }
}
```

### **LiveComment Schema**
```typescript
{
  streamId: string;         // Associated stream ID
  userId: string;           // Commenter's user ID
  username: string;         // Commenter's username
  userAvatar?: string;      // Commenter's avatar
  message: string;          // Comment message
  timestamp: Date;          // Comment timestamp
  isDeleted: boolean;       // Deletion flag
  deletedAt?: Date;         // Deletion timestamp
  deletedBy?: string;       // Who deleted the comment
  likes: number;            // Comment likes
  replies: string[];        // Reply comment IDs
  parentComment?: string;   // Parent comment ID for replies
  isHighlighted: boolean;   // Streamer highlight flag
  isPinned: boolean;        // Streamer pin flag
}
```

## 🔧 **Setup Instructions**

### **Prerequisites**
- Node.js 16+
- MongoDB
- Streaming server (RTMP/HLS)
- CDN for video delivery

### **Environment Variables**
```bash
# Database
MONGODB_URI=your_mongodb_connection_string

# Streaming Server (Update these URLs)
STREAMING_SERVER_URL=rtmp://your-streaming-server
CDN_BASE_URL=https://your-cdn.com

# Optional: Cloudinary for thumbnails
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### **Installation**
```bash
# Install dependencies
npm install

# Install uuid for stream key generation
npm install uuid
npm install --save-dev @types/uuid

# Start development server
npm run dev
```

## 📱 **Usage Examples**

### **Complete Live Stream Workflow**

#### **1. Start Stream**
```bash
curl -X POST http://localhost:3000/api/live/start \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "68ad40ebfe4335deca03666d",
    "title": "Gaming Live Stream",
    "description": "Playing my favorite game live!",
    "category": "gaming",
    "tags": ["gaming", "live", "fun"],
    "settings": {
      "quality": "720p",
      "enableChat": true,
      "enableLikes": true,
      "enableComments": true
    }
  }'
```

#### **2. Go Live**
```bash
curl -X PUT http://localhost:3000/api/live/go-live \
  -H "Content-Type: application/json" \
  -d '{
    "streamId": "generated_stream_id",
    "userId": "68ad40ebfe4335deca03666d"
  }'
```

#### **3. Join Stream (Viewer)**
```bash
curl -X POST http://localhost:3000/api/live/join \
  -H "Content-Type: application/json" \
  -d '{
    "streamId": "stream_id_here",
    "viewerId": "viewer_user_id"
  }'
```

#### **4. Add Comment**
```bash
curl -X POST http://localhost:3000/api/live/comment \
  -H "Content-Type: application/json" \
  -d '{
    "streamId": "stream_id_here",
    "userId": "viewer_user_id",
    "message": "This stream is amazing! 🔥"
  }'
```

#### **5. Like Stream**
```bash
curl -X POST http://localhost:3000/api/live/like \
  -H "Content-Type: application/json" \
  -d '{
    "streamId": "stream_id_here",
    "userId": "viewer_user_id"
  }'
```

#### **6. End Stream**
```bash
curl -X PUT http://localhost:3000/api/live/end \
  -H "Content-Type: application/json" \
  -d '{
    "streamId": "stream_id_here",
    "userId": "68ad40ebfe4335deca03666d"
  }'
```

### **Discover Live Streams**
```bash
# Get all live streams
curl -X GET "http://localhost:3000/api/live/streams"

# Get gaming streams in New York
curl -X GET "http://localhost:3000/api/live/streams?category=gaming&location=New%20York"

# Get streams sorted by viewer count
curl -X GET "http://localhost:3000/api/live/streams?sortBy=viewerCount&sortOrder=desc"

# Get streams with specific tags
curl -X GET "http://localhost:3000/api/live/streams?tags=gaming,live,fun"
```

### **Get Stream Details**
```bash
# Get basic stream info
curl -X GET "http://localhost:3000/api/live/stream/stream_id_here"

# Get stream info with recent comments
curl -X GET "http://localhost:3000/api/live/stream/stream_id_here?includeComments=true&commentsLimit=20"
```

### **Update Stream Settings**
```bash
curl -X PUT http://localhost:3000/api/live/update-settings \
  -H "Content-Type: application/json" \
  -d '{
    "streamId": "stream_id_here",
    "userId": "68ad40ebfe4335deca03666d",
    "title": "Updated Stream Title",
    "isPrivate": true,
    "allowedViewers": ["user1", "user2"],
    "settings": {
      "enableComments": false,
      "maxViewers": 500
    }
  }'
```

## 🌐 **Streaming Server Integration**

### **RTMP Input URL**
The API generates RTMP URLs in this format:
```
rtmp://your-streaming-server/live/{streamKey}
```

### **HLS Playback URL**
Viewers can access streams via:
```
https://your-cdn.com/live/{streamKey}/index.m3u8
```

### **Recommended Streaming Servers**
- **Node-Media-Server**: Lightweight Node.js streaming server
- **Nginx-RTMP**: High-performance RTMP server
- **Ant Media Server**: Enterprise-grade streaming solution
- **Wowza**: Professional streaming platform

## 🔒 **Security Features**

- **User Authentication**: All endpoints require valid user IDs
- **Access Control**: Private streams with viewer restrictions
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: Built-in protection against abuse
- **Data Sanitization**: XSS and injection protection

## 📊 **Real-time Features**

### **WebSocket Integration (Future Enhancement)**
For true real-time updates, consider integrating WebSockets:
- Live viewer count updates
- Real-time comment streaming
- Instant like notifications
- Live stream status changes

### **Server-Sent Events (SSE)**
Alternative to WebSockets for one-way real-time updates:
- Live comment feed
- Viewer count updates
- Stream status notifications

## 🚀 **Deployment**

### **Vercel (Recommended)**
```bash
npm install -g vercel
vercel
```

### **Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### **Environment Setup**
Ensure your streaming server and CDN are properly configured:
1. **RTMP Server**: Accept incoming streams
2. **HLS Generation**: Convert RTMP to HLS
3. **CDN Distribution**: Deliver video globally
4. **Database**: MongoDB connection
5. **Monitoring**: Stream health checks

## 🧪 **Testing**

### **Test Scripts**
Use the provided test scripts to verify functionality:
```bash
# Test stream creation
node test-live-streaming.js

# Test viewer interactions
node test-live-viewers.js

# Test real-time features
node test-live-comments.js
```

### **Postman Collection**
Import the `live-streaming-postman-collection.json` for API testing.

## 📈 **Performance Optimization**

- **Database Indexing**: Optimized queries for live streams
- **Caching**: Redis for frequently accessed data
- **CDN**: Global video distribution
- **Load Balancing**: Multiple streaming servers
- **Monitoring**: Real-time performance metrics

## 🔮 **Future Enhancements**

- **Multi-stream Support**: Multiple concurrent streams per user
- **Stream Recording**: Save live streams for replay
- **Advanced Analytics**: Detailed viewer insights
- **Monetization**: Tips, subscriptions, ads
- **Mobile SDK**: Native mobile streaming
- **AI Moderation**: Automated content filtering

## 🆘 **Support & Troubleshooting**

### **Common Issues**
1. **Stream Not Starting**: Check RTMP server configuration
2. **Viewers Can't Join**: Verify stream status and privacy settings
3. **Comments Not Working**: Ensure comments are enabled
4. **High Latency**: Optimize CDN and streaming server

### **Debug Endpoints**
- `/api/live/test`: Basic API functionality
- `/api/live/health`: System health check
- `/api/live/stats`: Streaming statistics

---

**Built with ❤️ using Next.js, TypeScript, and MongoDB**

*For more information, check the individual API documentation files.*
