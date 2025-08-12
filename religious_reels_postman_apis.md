
# Religious Reels APIs for Postman Testing

## 🎥 **Religious Reels with Auto Video/Thumbnail Fetching**

### 1. Get Religious Reels (GET)
```
GET /api/videos/religious-reels?religion=christianity&category=worship&page=1&limit=10
```
**Headers:**
```
Authorization: Bearer {auth_token}
```

**Query Parameters:**
- `religion`: christianity, islam, hinduism, buddhism, judaism, all
- `category`: worship, prayer, education, meditation, etc.
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "message": "Religious reels fetched successfully",
  "data": {
    "religiousContent": [
      {
        "_id": "post_id",
        "content": "Religious content",
        "videoUrl": "https://example.com/video.mp4",
        "thumbnailUrl": "https://example.com/thumbnail.jpg",
        "religion": "christianity",
        "category": "worship",
        "type": "reel",
        "author": {
          "username": "user123",
          "fullName": "John Doe",
          "avatar": "avatar_url"
        }
      }
    ],
    "religionStats": [
      {
        "_id": "christianity",
        "count": 25
      }
    ],
    "categoryStats": [
      {
        "_id": "worship",
        "count": 10
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalContent": 25,
      "hasNextPage": true,
      "hasPrevPage": false,
      "limit": 10
    }
  }
}
```

### 2. Create Religious Reel with Auto-Fetch (POST)
```
POST /api/videos/religious-reels
```
**Headers:**
```
Content-Type: application/json
Authorization: Bearer {auth_token}
```
**Body:**
```json
{
  "content": "Amazing religious experience! 🙏",
  "religion": "christianity",
  "category": "worship",
  "autoFetch": true,
  "fetchReligion": "christianity",
  "fetchCategory": "worship"
}
```

**Alternative Body (Manual Video):**
```json
{
  "content": "My religious journey",
  "religion": "islam",
  "category": "prayer",
  "videoUrl": "https://example.com/my-video.mp4",
  "thumbnailUrl": "https://example.com/my-thumbnail.jpg",
  "autoFetch": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Religious reel created successfully",
  "data": {
    "reel": {
      "_id": "reel_id",
      "content": "Amazing religious experience! 🙏",
      "videoUrl": "https://example.com/auto-fetched-video.mp4",
      "thumbnailUrl": "https://example.com/auto-fetched-thumbnail.jpg",
      "religion": "christianity",
      "category": "worship",
      "type": "reel"
    },
    "autoFetched": true,
    "fetchedVideo": "https://example.com/auto-fetched-video.mp4",
    "fetchedThumbnail": "https://example.com/auto-fetched-thumbnail.jpg"
  }
}
```

## 🤖 **Auto-Generated Religious Reels**

### 3. Get Available Religious Video Sources (GET)
```
GET /api/videos/auto-religious-reels?religion=christianity&category=worship
```
**Headers:**
```
Authorization: Bearer {auth_token}
```

**Query Parameters:**
- `religion`: christianity, islam, hinduism, buddhism, judaism, all
- `category`: worship, prayer, education, meditation, etc.

**Response:**
```json
{
  "success": true,
  "message": "Available religious video sources fetched successfully",
  "data": {
    "availableVideos": [
      {
        "url": "https://example.com/christian-worship-1.mp4",
        "thumbnail": "https://example.com/christian-thumb-1.jpg",
        "title": "Christian Worship Service",
        "category": "worship"
      },
      {
        "url": "https://example.com/bible-study-1.mp4",
        "thumbnail": "https://example.com/bible-thumb-1.jpg",
        "title": "Bible Study Session",
        "category": "education"
      }
    ],
    "religion": "christianity",
    "category": "worship",
    "totalVideos": 2
  }
}
```

### 4. Auto-Generate Religious Reel (POST)
```
POST /api/videos/auto-religious-reels
```
**Headers:**
```
Content-Type: application/json
Authorization: Bearer {auth_token}
```

**Body (Random Video):**
```json
{
  "content": "Blessed to share this spiritual moment 🙏✨",
  "religion": "christianity",
  "category": "worship",
  "autoGenerate": true,
  "useRandom": true
}
```

**Body (Specific Video):**
```json
{
  "content": "Today's prayer session was amazing",
  "religion": "islam",
  "category": "prayer",
  "autoGenerate": true,
  "useRandom": false,
  "specificVideoIndex": 0
}
```

**Body (All Religions):**
```json
{
  "content": "Spiritual journey across faiths",
  "religion": "christianity",
  "category": "all",
  "autoGenerate": true,
  "useRandom": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Religious reel auto-generated successfully",
  "data": {
    "reel": {
      "_id": "reel_id",
      "content": "Blessed to share this spiritual moment 🙏✨",
      "videoUrl": "https://example.com/christian-worship-1.mp4",
      "thumbnailUrl": "https://example.com/christian-thumb-1.jpg",
      "religion": "christianity",
      "category": "worship",
      "type": "reel",
      "autoGenerated": true
    },
    "autoGeneratedVideo": {
      "url": "https://example.com/christian-worship-1.mp4",
      "thumbnail": "https://example.com/christian-thumb-1.jpg",
      "title": "Christian Worship Service",
      "category": "worship"
    },
    "generationMethod": "random",
    "religion": "christianity",
    "category": "worship"
  }
}
```

## 📋 **Available Religions and Categories**

### Religions:
- `christianity`
- `islam`
- `hinduism`
- `buddhism`
- `judaism`

### Categories:
- `worship` - Worship services and ceremonies
- `prayer` - Prayer sessions and rituals
- `education` - Religious teachings and studies
- `meditation` - Meditation and mindfulness
- `devotional` - Devotional songs and chants
- `ceremony` - Religious ceremonies
- `recitation` - Sacred text recitations
- `chanting` - Mantra and chant sessions
- `teaching` - Religious teachings
- `study` - Religious study sessions
- `celebration` - Religious celebrations

## 🔧 **Testing Workflow**

1. **Get Available Sources**: First call the GET endpoint to see available videos
2. **Auto-Generate Reel**: Use POST to create a reel with auto-fetched video
3. **Browse Religious Content**: Use the religious-reels endpoint to browse existing content
4. **Create Custom Reel**: Use manual video URLs if needed

## 🎯 **Example Test Cases**

### Test Case 1: Auto-Generate Christian Worship Reel
```json
POST /api/videos/auto-religious-reels
{
  "content": "Sunday worship was incredible! 🙏",
  "religion": "christianity",
  "category": "worship",
  "autoGenerate": true,
  "useRandom": true
}
```

### Test Case 2: Auto-Generate Islamic Prayer Reel
```json
POST /api/videos/auto-religious-reels
{
  "content": "Prayer time - connecting with Allah",
  "religion": "islam",
  "category": "prayer",
  "autoGenerate": true,
  "useRandom": true
}
```

### Test Case 3: Browse Hindu Religious Content
```
GET /api/videos/religious-reels?religion=hinduism&category=devotional&page=1&limit=5
```

### Test Case 4: Create Reel with Auto-Fetch from Database
```json
POST /api/videos/religious-reels
{
  "content": "Spiritual journey continues",
  "religion": "buddhism",
  "category": "meditation",
  "autoFetch": true,
  "fetchReligion": "buddhism",
  "fetchCategory": "meditation"
}
```

## 🚀 **Environment Variables**

Set these in Postman:
```json
{
  "base_url": "http://localhost:3000/api",
  "auth_token": "your_jwt_token",
  "religion": "christianity",
  "category": "worship"
}
```

## 📝 **Notes**

- The auto-generation APIs automatically fetch appropriate videos and thumbnails
- Videos are categorized by religion and content type
- You can specify exact video index or use random selection
- All endpoints require authentication
- The system supports both auto-generated and manual video uploads
- Religious content is properly categorized and tagged
