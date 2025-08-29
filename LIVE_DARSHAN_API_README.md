# 🕉️ Live Darshan API - Complete Documentation

A comprehensive API system for live streaming darshan, puja, aarti, and other spiritual ceremonies, allowing devotees to participate virtually in religious activities and receive divine blessings.

## 🚀 **Features Overview**

### **Core Live Streaming Capabilities**
- **Stream Management**: Create, start, stop, and manage live darshan streams
- **Real-time Viewing**: Join, leave, and track viewer engagement
- **Interactive Features**: Comments, likes, and reactions during streams
- **Privacy Controls**: Public and private stream support
- **Category System**: Religious content categories (darshan, puja, aarti, bhajan, discourse)
- **Multi-language Support**: Hindi, English, and other language streams
- **Location-based Discovery**: Find streams by geographic location
- **Advanced Search**: Full-text search with multiple filters

### **Darshan-Specific Features**
- **Temple Information**: Complete temple details and contact information
- **Deity Information**: Specific deity names and spiritual context
- **Stream Archival**: Save past darshan streams for future viewing
- **Content Moderation**: Built-in moderation for spiritual content
- **Quality Settings**: Multiple resolution options (480p, 720p, 1080p)

## 📁 **API Endpoints Structure**

```
/api/live/
├── route.ts                    # Main live streaming overview & creation
├── start/                      # Start new darshan stream
├── go-live/                    # Go live with stream
├── end/                        # End live stream
├── join/                       # Join stream as viewer
├── leave/                      # Leave stream
├── streams/                    # List and filter live streams
├── stream/[id]/                # Individual stream details
├── viewers/                    # Get stream viewer information
├── like/                       # Like/unlike stream
├── comment/                    # Add comment to stream
├── comments/                   # Get stream comments
└── update-settings/            # Update stream settings
```

## 🔌 **API Endpoints Documentation**

### **1. Main Live Streaming API**
**`GET /api/live`** - Get live streaming overview
**`POST /api/live`** - Create new live stream

#### **GET Parameters:**
- `status`: Stream status (live, ended, cancelled, all)
- `category`: Content category filter
- `featured`: Show only featured streams (true/false)
- `trending`: Show trending streams (true/false)
- `limit`: Number of results (default: 20)
- `page`: Page number (default: 1)

#### **POST Body:**
```json
{
  "userId": "user_id_here",
  "username": "Temple Priest",
  "title": "Morning Aarti - Shree Krishna Temple",
  "description": "Join us for the morning aarti ceremony",
  "category": "darshan",
  "tags": ["spiritual", "meditation"],
  "location": "Mathura, Uttar Pradesh",
  "isPrivate": false,
  "allowedViewers": ["user1", "user2"],
  "settings": {
    "quality": "720p",
    "enableChat": true,
    "enableLikes": true,
    "enableComments": true,
    "language": "hindi",
    "deityName": "Lord Krishna"
  }
}
```

### **2. Start Darshan Stream**
**`POST /api/live/start`** - Create and configure new darshan stream

#### **Request Body:**
```json
{
  "userId": "streamer123",
  "username": "Temple Priest",
  "title": "Morning Aarti - Shree Krishna Temple",
  "description": "Join us for the morning aarti ceremony and receive divine blessings",
  "category": "darshan",
  "tags": ["darshan", "aarti", "spiritual", "live"],
  "location": "Mathura, Uttar Pradesh",
  "deityName": "Lord Krishna",
  "templeName": "Shree Krishna Temple",
  "templeLocation": "Mathura, Uttar Pradesh",
  "templeContact": "+91 1234567890",
  "language": "hindi",
  "settings": {
    "quality": "720p",
    "enableChat": true,
    "enableLikes": true,
    "enableComments": true,
    "maxViewers": 1000
  }
}
```

#### **Response:**
```json
{
  "success": true,
  "message": "Darshan stream created successfully",
  "data": {
    "streamId": "stream_id_here",
    "streamKey": "darshan_timestamp_random",
    "status": "pending",
    "streamUrl": "rtmp://your-rtmp-server/live/stream_key",
    "playbackUrl": "https://your-cdn.com/live/stream_key/index.m3u8",
    "title": "Morning Aarti - Shree Krishna Temple",
    "category": "darshan",
    "settings": {
      "quality": "720p",
      "enableChat": true,
      "enableLikes": true,
      "enableComments": true,
      "language": "hindi",
      "deityName": "Lord Krishna",
      "templeInfo": {
        "name": "Shree Krishna Temple",
        "location": "Mathura, Uttar Pradesh",
        "contact": "+91 1234567890"
      }
    }
  }
}
```

### **3. Go Live**
**`PUT /api/live/go-live`** - Transition stream from pending to live status

#### **Request Body:**
```json
{
  "streamId": "stream_id_here",
  "userId": "streamer123"
}
```

#### **Response:**
```json
{
  "success": true,
  "message": "Stream is now live!",
  "data": {
    "streamId": "stream_id_here",
    "status": "live",
    "startedAt": "2024-01-01T10:00:00.000Z",
    "playbackUrl": "https://your-cdn.com/live/stream_key/index.m3u8",
    "title": "Morning Aarti - Shree Krishna Temple",
    "category": "darshan",
    "viewerInfo": {
      "currentViewers": [],
      "viewerCount": 0,
      "maxViewers": 1000,
      "isPrivate": false,
      "allowedViewers": []
    },
    "streamSettings": {
      "quality": "720p",
      "enableChat": true,
      "enableLikes": true,
      "enableComments": true,
      "language": "hindi",
      "deityName": "Lord Krishna",
      "templeInfo": {
        "name": "Shree Krishna Temple",
        "location": "Mathura, Uttar Pradesh",
        "contact": "+91 1234567890"
      }
    }
  }
}
```

### **4. Join Stream**
**`POST /api/live/join`** - Join live stream as viewer

#### **Request Body:**
```json
{
  "streamId": "stream_id_here",
  "viewerId": "viewer123",
  "viewerUsername": "Devotee"
}
```

#### **Response:**
```json
{
  "success": true,
  "message": "Successfully joined stream",
  "data": {
    "streamId": "stream_id_here",
    "viewerId": "viewer123",
    "status": "joined",
    "viewerCount": 1,
    "streamInfo": {
      "title": "Morning Aarti - Shree Krishna Temple",
      "category": "darshan",
      "deityName": "Lord Krishna",
      "templeInfo": {
        "name": "Shree Krishna Temple",
        "location": "Mathura, Uttar Pradesh",
        "contact": "+91 1234567890"
      },
      "playbackUrl": "https://your-cdn.com/live/stream_key/index.m3u8",
      "quality": "720p",
      "enableChat": true,
      "enableLikes": true,
      "enableComments": true
    }
  }
}
```

### **5. Leave Stream**
**`POST /api/live/leave`** - Leave live stream

#### **Request Body:**
```json
{
  "streamId": "stream_id_here",
  "viewerId": "viewer123"
}
```

#### **Response:**
```json
{
  "success": true,
  "message": "Successfully left stream",
  "data": {
    "streamId": "stream_id_here",
    "viewerId": "viewer123",
    "status": "left",
    "viewerCount": 0,
    "watchDuration": 300
  }
}
```

### **6. End Stream**
**`PUT /api/live/end`** - End live stream

#### **Request Body:**
```json
{
  "streamId": "stream_id_here",
  "userId": "streamer123"
}
```

#### **Response:**
```json
{
  "success": true,
  "message": "Stream ended successfully",
  "data": {
    "streamId": "stream_id_here",
    "status": "ended",
    "endedAt": "2024-01-01T11:00:00.000Z",
    "duration": 3600,
    "finalStats": {
      "totalViews": 150,
      "peakViewerCount": 45,
      "totalLikes": 23,
      "totalComments": 67,
      "averageWatchTime": 1200
    }
  }
}
```

### **7. Get Stream Viewers**
**`GET /api/live/viewers?streamId=stream_id_here`** - Get detailed viewer information

#### **Response:**
```json
{
  "success": true,
  "data": {
    "streamId": "stream_id_here",
    "viewerStats": {
      "currentViewers": 15,
      "peakViewers": 45,
      "totalViews": 150,
      "averageWatchTime": 1200
    },
    "activeViewers": ["viewer1", "viewer2", "viewer3"],
    "viewerDetails": [
      {
        "viewerId": "viewer1",
        "joinedAt": "2024-01-01T10:05:00.000Z",
        "watchDuration": 1800
      }
    ],
    "totalViewers": 150
  }
}
```

### **8. Like Stream**
**`POST /api/live/like`** - Like/unlike live stream

#### **Request Body:**
```json
{
  "streamId": "stream_id_here",
  "userId": "viewer123",
  "action": "like"
}
```

#### **Response:**
```json
{
  "success": true,
  "message": "Stream liked successfully",
  "data": {
    "streamId": "stream_id_here",
    "action": "liked",
    "likes": 24,
    "userId": "viewer123"
  }
}
```

### **9. Add Comment**
**`POST /api/live/comment`** - Add comment to live stream

#### **Request Body:**
```json
{
  "streamId": "stream_id_here",
  "userId": "viewer123",
  "username": "Devotee",
  "message": "🙏 Jai Shree Krishna! Beautiful aarti",
  "parentCommentId": null
}
```

#### **Response:**
```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "streamId": "stream_id_here",
    "comment": {
      "id": "comment_timestamp_random",
      "userId": "viewer123",
      "username": "Devotee",
      "message": "🙏 Jai Shree Krishna! Beautiful aarti",
      "timestamp": "2024-01-01T10:30:00.000Z",
      "parentCommentId": null,
      "likes": 0
    },
    "totalComments": 68
  }
}
```

### **10. Get Comments**
**`GET /api/live/comments?streamId=stream_id_here&limit=20&page=1&sortBy=timestamp&sortOrder=desc`**

#### **Query Parameters:**
- `streamId`: Stream ID (required)
- `limit`: Comments per page (default: 50)
- `page`: Page number (default: 1)
- `sortBy`: Sort field (timestamp, likes)
- `sortOrder`: Sort direction (asc, desc)
- `includeReplies`: Include reply comments (true/false)

#### **Response:**
```json
{
  "success": true,
  "data": {
    "streamId": "stream_id_here",
    "comments": [
      {
        "id": "comment_timestamp_random",
        "userId": "viewer123",
        "username": "Devotee",
        "message": "🙏 Jai Shree Krishna! Beautiful aarti",
        "timestamp": "2024-01-01T10:30:00.000Z",
        "parentCommentId": null,
        "likes": 0
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 4,
      "totalComments": 68,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "filters": {
      "sortBy": "timestamp",
      "sortOrder": "desc",
      "includeReplies": false,
      "limit": 20
    }
  }
}
```

### **11. List Streams**
**`GET /api/live/streams?category=darshan&status=live&limit=20&page=1&sortBy=viewerCount&sortOrder=desc`**

#### **Query Parameters:**
- `category`: Content category (darshan, puja, aarti, bhajan, discourse, other)
- `status`: Stream status (live, ended, cancelled, all)
- `tags`: Comma-separated tags
- `location`: Geographic location
- `search`: Text search query
- `featured`: Featured streams only (true/false)
- `trending`: Trending streams only (true/false)
- `language`: Stream language
- `deityName`: Deity name filter
- `minViewers`/`maxViewers`: Viewer count range
- `minLikes`/`maxLikes`: Like count range
- `sortBy`: Sort field (viewerCount, likes, createdAt, relevance)
- `sortOrder`: Sort direction (asc, desc)
- `limit`: Results per page (default: 20)
- `page`: Page number (default: 1)

#### **Response:**
```json
{
  "success": true,
  "data": {
    "streams": [
      {
        "_id": "stream_id_here",
        "title": "Morning Aarti - Shree Krishna Temple",
        "description": "Join us for the morning aarti ceremony",
        "status": "live",
        "category": "darshan",
        "viewerCount": 45,
        "likes": 23,
        "comments": 67,
        "location": "Mathura, Uttar Pradesh",
        "settings": {
          "quality": "720p",
          "deityName": "Lord Krishna",
          "templeInfo": {
            "name": "Shree Krishna Temple",
            "location": "Mathura, Uttar Pradesh"
          }
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalStreams": 100,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "filters": {
      "category": "darshan",
      "status": "live",
      "sortBy": "viewerCount",
      "sortOrder": "desc"
    }
  }
}
```

### **12. Get Stream Details**
**`GET /api/live/stream/{streamId}?includeComments=true&commentsLimit=20`**

#### **Query Parameters:**
- `includeComments`: Include recent comments (true/false)
- `commentsLimit`: Number of comments to include

#### **Response:**
```json
{
  "success": true,
  "data": {
    "_id": "stream_id_here",
    "userId": "streamer123",
    "username": "Temple Priest",
    "title": "Morning Aarti - Shree Krishna Temple",
    "description": "Join us for the morning aarti ceremony",
    "status": "live",
    "category": "darshan",
    "tags": ["darshan", "aarti", "spiritual", "live"],
    "location": "Mathura, Uttar Pradesh",
    "isPrivate": false,
    "playbackUrl": "https://your-cdn.com/live/stream_key/index.m3u8",
    "startedAt": "2024-01-01T10:00:00.000Z",
    "viewerCount": 45,
    "peakViewerCount": 45,
    "totalViews": 150,
    "likes": 23,
    "comments": 67,
    "settings": {
      "quality": "720p",
      "enableChat": true,
      "enableLikes": true,
      "enableComments": true,
      "language": "hindi",
      "deityName": "Lord Krishna",
      "templeInfo": {
        "name": "Shree Krishna Temple",
        "location": "Mathura, Uttar Pradesh",
        "contact": "+91 1234567890"
      }
    }
  }
}
```

### **13. Update Stream Settings**
**`PUT /api/live/update-settings`** - Update stream configuration

#### **Request Body:**
```json
{
  "streamId": "stream_id_here",
  "userId": "streamer123",
  "updates": {
    "title": "Updated Stream Title",
    "description": "Updated description",
    "isPrivate": true,
    "allowedViewers": ["user1", "user2", "user3"],
    "settings": {
      "quality": "1080p",
      "enableComments": false,
      "maxViewers": 500,
      "deityName": "Lord Rama",
      "templeInfo": {
        "name": "Updated Temple Name",
        "location": "Updated Location",
        "contact": "+91 9876543210"
      }
    }
  }
}
```

#### **Response:**
```json
{
  "success": true,
  "message": "Stream settings updated successfully",
  "data": {
    "streamId": "stream_id_here",
    "updatedFields": {
      "stream": ["title", "description", "isPrivate", "allowedViewers"],
      "settings": ["quality", "enableComments", "maxViewers", "deityName", "templeInfo"]
    },
    "stream": {
      "title": "Updated Stream Title",
      "description": "Updated description",
      "isPrivate": true,
      "allowedViewers": ["user1", "user2", "user3"]
    },
    "settings": {
      "quality": "1080p",
      "enableComments": false,
      "maxViewers": 500,
      "deityName": "Lord Rama",
      "templeInfo": {
        "name": "Updated Temple Name",
        "location": "Updated Location",
        "contact": "+91 9876543210"
      }
    }
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
  category: 'darshan' | 'puja' | 'aarti' | 'bhajan' | 'discourse' | 'other';
  streamKey: string;        // Unique stream key
  streamUrl: string;        // RTMP streaming URL
  playbackUrl: string;      // HLS playback URL
  thumbnailUrl?: string;    // Stream thumbnail
  startedAt?: Date;         // Stream start time
  endedAt?: Date;           // Stream end time
  duration: number;         // Stream duration in seconds
  viewerCount: number;      // Current viewer count
  peakViewerCount: number;  // Peak viewer count
  totalViews: number;       // Total unique views
  likes: number;            // Total likes
  comments: number;         // Total comments
  isPrivate: boolean;       // Private stream flag
  allowedViewers?: string[]; // Allowed viewers for private streams
  activeViewers?: string[];  // Currently active viewers
  viewerHistory?: Array<{    // Viewer join/leave history
    viewerId: string;
    joinedAt: Date;
    leftAt?: Date;
    watchDuration?: number;
  }>;
  tags?: string[];          // Stream tags
  location?: string;        // Geographic location
  settings: {               // Stream settings
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
  createdAt: Date;
  updatedAt: Date;
}
```

## 🎯 **Usage Examples**

### **Complete Stream Lifecycle**

#### **1. Start a Darshan Stream**
```javascript
const startStream = async () => {
  const response = await fetch('/api/live/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 'temple_priest_123',
      username: 'Temple Priest',
      title: 'Evening Aarti - Shree Ram Temple',
      description: 'Join us for the evening aarti ceremony',
      category: 'darshan',
      deityName: 'Lord Rama',
      templeName: 'Shree Ram Temple',
      templeLocation: 'Ayodhya, Uttar Pradesh',
      settings: {
        quality: '1080p',
        enableChat: true,
        enableLikes: true,
        enableComments: true,
        maxViewers: 2000
      }
    })
  });
  
  const result = await response.json();
  console.log('Stream created:', result.data);
};
```

#### **2. Go Live**
```javascript
const goLive = async (streamId) => {
  const response = await fetch('/api/live/go-live', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      streamId: streamId,
      userId: 'temple_priest_123'
    })
  });
  
  const result = await response.json();
  if (result.success) {
    console.log('Stream is now live!');
    // Start broadcasting with RTMP
  }
};
```

#### **3. Join as Viewer**
```javascript
const joinStream = async (streamId, viewerId, username) => {
  const response = await fetch('/api/live/join', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      streamId: streamId,
      viewerId: viewerId,
      viewerUsername: username
    })
  });
  
  const result = await response.json();
  if (result.success) {
    console.log('Joined stream successfully');
    // Start playing HLS stream
  }
};
```

#### **4. Add Comment**
```javascript
const addComment = async (streamId, userId, username, message) => {
  const response = await fetch('/api/live/comment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      streamId: streamId,
      userId: userId,
      username: username,
      message: message
    })
  });
  
  const result = await response.json();
  if (result.success) {
    console.log('Comment added successfully');
  }
};
```

#### **5. End Stream**
```javascript
const endStream = async (streamId) => {
  const response = await fetch('/api/live/end', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      streamId: streamId,
      userId: 'temple_priest_123'
    })
  });
  
  const result = await response.json();
  if (result.success) {
    console.log('Stream ended. Final stats:', result.data.finalStats);
  }
};
```

## 🌐 **HTML Demo**

A comprehensive HTML demo is available at `/public/live-darshan-demo.html` that demonstrates:

- **Stream Management**: Create, go live, and end streams
- **Camera Integration**: Access device camera for broadcasting
- **Viewer Management**: Join/leave streams as viewers
- **Live Interaction**: Add comments and like streams
- **Real-time Updates**: View stream information and statistics
- **Responsive Design**: Works on desktop and mobile devices

### **Demo Features**
- 🎥 **Live Camera**: Access device camera and microphone
- 📱 **Mobile Responsive**: Optimized for all screen sizes
- 🎨 **Modern UI**: Beautiful gradient design with smooth animations
- 📊 **Real-time Stats**: Live viewer count and stream statistics
- 💬 **Live Chat**: Real-time commenting system
- ❤️ **Live Reactions**: Like and interact with streams

## 🔧 **Setup Instructions**

### **1. Install Dependencies**
```bash
npm install
```

### **2. Environment Configuration**
Create a `.env` file with your database and streaming configuration:
```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### **3. Database Setup**
Ensure MongoDB is running and the LiveStream model is properly configured.

### **4. Start Development Server**
```bash
npm run dev
```

### **5. Access Demo**
Open `http://localhost:3000/live-darshan-demo.html` in your browser.

## 🚀 **Deployment**

### **Vercel Deployment**
1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy automatically

### **Custom Server Deployment**
1. Build the application: `npm run build`
2. Start production server: `npm start`

## 🔒 **Security Considerations**

- **Authentication**: Implement proper user authentication
- **Rate Limiting**: Add rate limiting for API endpoints
- **Input Validation**: Validate all user inputs
- **Content Moderation**: Implement content filtering for comments
- **Private Streams**: Secure access to private streams
- **Stream Keys**: Protect stream keys from unauthorized access

## 📱 **Mobile Support**

The API and demo are fully optimized for mobile devices:
- **Responsive Design**: Adapts to all screen sizes
- **Touch Controls**: Optimized for touch interactions
- **Mobile Camera**: Access device camera on mobile
- **Progressive Web App**: Can be installed as mobile app

## 🌟 **Future Enhancements**

- **WebRTC Integration**: Real-time peer-to-peer streaming
- **AI Content Moderation**: Automated content filtering
- **Multi-language Support**: Internationalization
- **Advanced Analytics**: Detailed viewer insights
- **Social Features**: Share streams on social media
- **Monetization**: Donation and subscription systems
- **VR Support**: Virtual reality darshan experience

## 📞 **Support**

For technical support or questions about the Live Darshan API:
- Check the demo page for interactive examples
- Review the API responses in the demo console
- Ensure all required fields are provided in requests
- Verify stream status before performing actions

---

**🕉️ May the divine blessings be with you as you build and use this Live Darshan API!**
