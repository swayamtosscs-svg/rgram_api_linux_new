# 🕉️ Darshan Live Streaming API Documentation

This API provides functionality for live streaming darshan, puja, aarti, and other temple activities, allowing devotees to participate virtually in religious ceremonies and receive blessings.

## 🚀 Features

### Core Features
- Start live darshan streams
- Browse active darshan streams
- Join live darshan sessions
- Real-time interaction with comments and likes
- Multi-language support
- Stream archival for future viewing

### Advanced Features
- Temple and deity information
- Location-based stream discovery
- Content moderation
- Private streams for special ceremonies
- Stream quality settings

## 📁 API Endpoints

### 1. Darshan Stream Management

#### Start Darshan Stream
```http
POST /api/live/darshan/start
```

**Body:**
```json
{
  "userId": "user_id_here",
  "title": "Morning Aarti - Shree Krishna Temple",
  "description": "Join us for the morning aarti ceremony",
  "deityName": "Lord Krishna",
  "templeName": "Shree Krishna Temple",
  "templeLocation": "Mathura, Uttar Pradesh",
  "templeContact": "+91 1234567890",
  "isPrivate": false,
  "language": "hindi",
  "settings": {
    "quality": "720p",
    "enableChat": true,
    "enableLikes": true,
    "enableComments": true,
    "isArchived": true,
    "moderationEnabled": true,
    "maxViewers": 1000
  }
}
```

#### Get Active Darshan Streams
```http
GET /api/live/darshan/streams
```

**Query Parameters:**
- `deityName`: Filter by deity name
- `templeName`: Filter by temple name
- `location`: Filter by location
- `language`: Filter by language
- `limit`: Number of streams per page (default: 20)
- `page`: Page number for pagination
- `sortBy`: Sort by field (viewerCount, startedAt)
- `sortOrder`: Sort order (asc, desc)

### 2. Stream Management

#### End Stream
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

### 3. Viewer Interaction

All existing viewer interaction endpoints (join, leave, like, comment) work with darshan streams.

## 🔒 Security & Guidelines

1. **Content Guidelines**
   - Streams must respect religious sentiments
   - No commercial or promotional content
   - Maintain decorum during ceremonies

2. **Moderation**
   - Automated content filtering
   - Manual moderation for reported content
   - Comment filtering system

3. **Privacy**
   - Option for private ceremonies
   - Temple-specific access control
   - Viewer identity protection

## 🌐 Integration Guide

### Environment Setup
1. Configure RTMP server for live streaming
2. Set up CDN for global content delivery
3. Configure MongoDB for data storage
4. Set up content moderation systems

### Testing
```bash
# Test darshan stream creation
curl -X POST http://localhost:3000/api/live/darshan/start \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_id_here",
    "title": "Morning Aarti",
    "deityName": "Lord Krishna",
    "templeName": "Krishna Temple"
  }'

# Get active darshan streams
curl -X GET "http://localhost:3000/api/live/darshan/streams?deityName=Krishna&language=hindi"
```

## 🔮 Future Enhancements

1. **Enhanced Features**
   - Multiple camera angles
   - Virtual queue system
   - Donation integration
   - Schedule management for regular ceremonies

2. **Technical Improvements**
   - WebRTC integration for lower latency
   - AI-powered content moderation
   - Automated ceremony recognition
   - Mobile SDK for temple staff

3. **User Experience**
   - Virtual prasad booking
   - Ceremony notifications
   - Interactive temple tours
   - Community features

## 🆘 Support

For technical support or queries:
- Check system status: `/api/live/health`
- Debug stream issues: `/api/live/debug/stream/{streamId}`
- Contact support team for temple onboarding

---

Built with ❤️ to connect devotees globally  
*For detailed technical documentation, refer to the API specification files.*
