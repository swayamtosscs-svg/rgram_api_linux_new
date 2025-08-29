# 🎥 Comprehensive Live Streaming API Documentation

A complete API system for managing live streaming functionality in the Instagram-like social media platform, built with Next.js, TypeScript, and MongoDB.

## 🚀 **Features Overview**

### **Core Live Streaming Capabilities**
- **Stream Management**: Create, start, stop, and manage live streams
- **Real-time Viewing**: Join, leave, and track viewer engagement
- **Interactive Features**: Comments, likes, and reactions during streams
- **Privacy Controls**: Public and private stream support
- **Category System**: Religious content categories (darshan, puja, aarti, bhajan, discourse)
- **Multi-language Support**: Hindi, English, and other language streams
- **Location-based Discovery**: Find streams by geographic location
- **Advanced Search**: Full-text search with multiple filters

### **Analytics & Statistics**
- **Real-time Metrics**: Viewer count, likes, comments, engagement
- **Historical Data**: Stream duration, peak viewers, total views
- **User Analytics**: Individual streamer performance metrics
- **Trend Analysis**: Popular content and trending streams
- **Category Insights**: Performance breakdown by content type

## 📁 **API Endpoints Structure**

```
/api/live/
├── route.ts                    # Main live streaming overview & creation
├── streams/                    # List and filter live streams
│   └── route.ts
├── stream/[id]/               # Individual stream details
│   └── route.ts
├── featured/                  # Featured & trending streams
│   └── route.ts
├── search/                    # Advanced search functionality
│   └── route.ts
├── stats/                     # Analytics & statistics
│   └── route.ts
├── user/[userId]/             # User-specific streams
│   └── route.ts
├── start/                     # Start a live stream
├── end/                       # End a live stream
├── go-live/                   # Go live functionality
├── join/                      # Join a stream as viewer
├── leave/                     # Leave a stream
├── like/                      # Like/unlike a stream
├── comment/                   # Add comment to stream
├── comments/                  # Get stream comments
├── viewers/                   # Manage stream viewers
├── update-settings/           # Update stream settings
└── darshan/                   # Special darshan stream features
    ├── start/
    └── streams/
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
  "title": "Stream Title",
  "description": "Stream Description",
  "category": "darshan",
  "tags": ["spiritual", "meditation"],
  "location": "Varanasi, India",
  "isPrivate": false,
  "allowedViewers": ["user1", "user2"],
  "settings": {
    "quality": "720p",
    "enableChat": true,
    "enableLikes": true,
    "enableComments": true,
    "language": "hindi",
    "deityName": "Lord Shiva"
  }
}
```

### **2. Streams Listing API**
**`GET /api/live/streams`** - Get filtered list of live streams

#### **Query Parameters:**
- `category`: Content category
- `tags`: Comma-separated tags
- `location`: Geographic location
- `search`: Text search query
- `status`: Stream status
- `featured`: Featured streams only
- `trending`: Trending streams only
- `language`: Stream language
- `deityName`: Deity name filter
- `minViewers`/`maxViewers`: Viewer count range
- `minLikes`/`maxLikes`: Like count range
- `sortBy`: Sort field (viewerCount, likes, createdAt)
- `sortOrder`: Sort direction (asc/desc)
- `limit`: Results per page
- `page`: Page number

### **3. Individual Stream API**
**`GET /api/live/stream/[id]`** - Get specific stream details

#### **Query Parameters:**
- `includeComments`: Include recent comments (true/false)
- `commentsLimit`: Number of comments to include

### **4. Featured Streams API**
**`GET /api/live/featured`** - Get featured and trending streams

#### **Query Parameters:**
- `type`: Stream type (featured, trending, popular, newest, most_viewed)
- `category`: Content category filter
- `limit`: Number of results
- `includeStats`: Include statistics (true/false)

### **5. Search API**
**`GET /api/live/search`** - Advanced search functionality

#### **Query Parameters:**
- `q`: Search query text
- `category`: Content category
- `tags`: Comma-separated tags
- `location`: Geographic location
- `language`: Stream language
- `deityName`: Deity name
- `status`: Stream status
- `minViewers`/`maxViewers`: Viewer count range
- `minLikes`/`maxLikes`: Like count range
- `sortBy`: Sort field (relevance, viewers, likes, newest, oldest)
- `sortOrder`: Sort direction
- `limit`: Results per page
- `page`: Page number

### **6. Statistics API**
**`GET /api/live/stats`** - Get live streaming analytics

#### **Query Parameters:**
- `period`: Time period (today, week, month, all)
- `category`: Content category filter
- `includeTrends`: Include trend data (true/false)

### **7. User Streams API**
**`GET /api/live/user/[userId]`** - Get streams by specific user

#### **Query Parameters:**
- `status`: Stream status filter
- `category`: Content category filter
- `includePrivate`: Include private streams (true/false)
- `limit`: Results per page
- `page`: Page number
- `sortBy`: Sort field
- `sortOrder`: Sort direction

## 📊 **Response Data Structure**

### **Standard Response Format:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data varies by endpoint
  }
}
```

### **Stream Object Structure:**
```json
{
  "_id": "stream_id",
  "userId": "user_id",
  "username": "streamer_username",
  "title": "Stream Title",
  "description": "Stream Description",
  "status": "live",
  "category": "darshan",
  "playbackUrl": "https://cdn.com/stream.m3u8",
  "thumbnailUrl": "https://cdn.com/thumbnail.jpg",
  "startedAt": "2024-01-01T10:00:00Z",
  "duration": 3600,
  "viewerCount": 150,
  "peakViewerCount": 200,
  "totalViews": 500,
  "likes": 25,
  "comments": 10,
  "isPrivate": false,
  "tags": ["spiritual", "meditation"],
  "location": "Varanasi, India",
  "settings": {
    "quality": "720p",
    "enableChat": true,
    "enableLikes": true,
    "enableComments": true,
    "language": "hindi",
    "deityName": "Lord Shiva",
    "templeInfo": {
      "name": "Kashi Vishwanath Temple",
      "location": "Varanasi, UP",
      "contact": "+91-1234567890"
    }
  },
  "createdAt": "2024-01-01T09:00:00Z",
  "updatedAt": "2024-01-01T10:00:00Z"
}
```

## 🔍 **Search & Filtering Examples**

### **Basic Stream Discovery:**
```bash
# Get all live streams
GET /api/live/streams?status=live

# Get streams by category
GET /api/live/streams?category=darshan&status=live

# Get trending streams
GET /api/live/featured?type=trending&limit=10
```

### **Advanced Search:**
```bash
# Search for spiritual content
GET /api/live/search?q=meditation&category=darshan&language=hindi

# Find streams by location
GET /api/live/search?location=Varanasi&status=live

# Filter by engagement metrics
GET /api/live/streams?minViewers=50&minLikes=10&sortBy=viewerCount
```

### **User-specific Queries:**
```bash
# Get user's live streams
GET /api/live/user/user123?status=live&includePrivate=false

# Get user's streaming statistics
GET /api/live/user/user123?includeStats=true
```

## 📈 **Analytics & Statistics**

### **Platform Overview:**
```bash
# Get overall statistics
GET /api/live/stats?period=month&includeTrends=true

# Get category breakdown
GET /api/live/stats?period=week&category=darshan
```

### **Stream Performance Metrics:**
- **Viewer Engagement**: Real-time viewer count, peak viewers
- **Content Performance**: Likes, comments, total views
- **Temporal Analysis**: Stream duration, time-based trends
- **Geographic Insights**: Location-based performance data
- **Category Analytics**: Performance by content type

## 🔐 **Authentication & Security**

### **Required Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### **Security Features:**
- JWT-based authentication for protected endpoints
- User isolation (users can only access their own streams)
- Private stream protection
- Rate limiting support
- Input validation and sanitization

## 🚀 **Usage Examples**

### **Create a New Stream:**
```bash
curl -X POST "https://your-api.com/api/live" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Morning Aarti Live",
    "description": "Daily morning aarti from Kashi",
    "category": "aarti",
    "tags": ["morning", "aarti", "kashi"],
    "location": "Varanasi, India",
    "settings": {
      "language": "hindi",
      "deityName": "Lord Shiva"
    }
  }'
```

### **Discover Live Streams:**
```bash
# Get trending darshan streams
curl "https://your-api.com/api/live/featured?type=trending&category=darshan&limit=5"

# Search for meditation content
curl "https://your-api.com/api/live/search?q=meditation&category=darshan&language=hindi"
```

### **Get Stream Analytics:**
```bash
# Get monthly statistics
curl "https://your-api.com/api/live/stats?period=month&includeTrends=true"

# Get user's streaming performance
curl "https://your-api.com/api/live/user/user123?includeStats=true"
```

## 🛠️ **Development & Testing**

### **Environment Setup:**
```bash
# Install dependencies
npm install

# Set up environment variables
cp env-template.txt .env

# Start development server
npm run dev
```

### **Testing APIs:**
- Use the provided Postman collections
- Test with different user accounts
- Verify authentication and authorization
- Test edge cases and error handling

## 📚 **Additional Resources**

- **Postman Collections**: `live-streaming-postman-collection.json`
- **Database Models**: `lib/models/LiveStream.ts`
- **Authentication**: `lib/utils/auth.ts`
- **Database Connection**: `lib/database.ts`

## 🔄 **Changelog**

### **Latest Updates:**
- ✅ Added comprehensive live streaming API system
- ✅ Enhanced search and filtering capabilities
- ✅ Added analytics and statistics endpoints
- ✅ Improved user management and privacy controls
- ✅ Added featured and trending stream support
- ✅ Enhanced documentation and examples

---

**Built with ❤️ using Next.js, TypeScript, and MongoDB**

For support and questions, create an issue in the repository or check the documentation files.

