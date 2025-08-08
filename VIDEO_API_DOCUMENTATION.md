# Video API Documentation

This document describes the video functionality added to the Apirgram API.

## Overview

The video API provides comprehensive video upload, management, and playback capabilities with the following features:

- Video upload with thumbnail support
- Video categorization and search
- Video feed with pagination
- Video details with related videos
- Like, comment, and save functionality
- User video count tracking

## API Endpoints

### 1. Upload Video

**POST** `/api/upload/video`

Upload a new video with metadata.

#### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Request Body
```json
{
  "content": "Video description text",
  "video": "data:video/mp4;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT...",
  "thumbnail": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
  "title": "Video Title",
  "description": "Video description",
  "duration": 120,
  "category": "entertainment"
}
```

#### Parameters
- `content` (string, optional): Video description
- `video` (string, optional): Base64 encoded video file
- `externalUrl` (string, optional): External video URL (YouTube, Vimeo, etc.)
- `thumbnail` (string, optional): Base64 encoded thumbnail image
- `title` (string, optional): Video title (max 100 chars)
- `description` (string, optional): Video description (max 500 chars)
- `duration` (number, optional): Video duration in seconds
- `category` (string, optional): Video category (default: "general")
- `religion` (string, optional): Religion tag (max 50 chars)

#### Supported Video Formats
- MP4, AVI, MOV, WMV, FLV, WebM, MKV

#### Response
```json
{
  "success": true,
  "message": "Video uploaded successfully",
  "data": {
    "post": {
      "_id": "video_id",
      "author": {
        "_id": "user_id",
        "username": "username",
        "fullName": "Full Name",
        "avatar": "avatar_url"
      },
      "content": "Video description",
      "videos": ["/uploads/videos/video_filename.mp4"],
      "images": ["/uploads/thumbnails/thumbnail_filename.jpg"],
      "type": "video",
      "title": "Video Title",
      "description": "Video description",
      "duration": 120,
      "category": "entertainment",
      "likesCount": 0,
      "commentsCount": 0,
      "sharesCount": 0,
      "savesCount": 0,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "videoUrl": "/uploads/videos/video_filename.mp4",
    "thumbnailUrl": "/uploads/thumbnails/thumbnail_filename.jpg"
  }
}
```

### 2. Get Video Feed

**GET** `/api/feed/videos`

Get paginated video feed with filtering options.

#### Query Parameters
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)
- `category` (string, optional): Filter by category
- `author` (string, optional): Filter by author ID
- `religion` (string, optional): Filter by religion
- `search` (string, optional): Search in title, description, content

#### Response
```json
{
  "success": true,
  "message": "Videos fetched successfully",
  "data": {
    "videos": [
      {
        "_id": "video_id",
        "author": {
          "_id": "user_id",
          "username": "username",
          "fullName": "Full Name",
          "avatar": "avatar_url"
        },
        "content": "Video description",
        "videos": ["/uploads/videos/video_filename.mp4"],
        "images": ["/uploads/thumbnails/thumbnail_filename.jpg"],
        "type": "video",
        "title": "Video Title",
        "description": "Video description",
        "duration": 120,
        "category": "entertainment",
        "likesCount": 5,
        "commentsCount": 2,
        "sharesCount": 1,
        "savesCount": 3,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalVideos": 50,
      "hasNextPage": true,
      "hasPrevPage": false,
      "limit": 10
    }
  }
}
```

### 3. Get Video Categories

**GET** `/api/videos/categories`

Get video categories with counts and percentages.

#### Response
```json
{
  "success": true,
  "message": "Video categories fetched successfully",
  "data": {
    "categories": [
      {
        "name": "entertainment",
        "count": 25,
        "percentage": 50
      },
      {
        "name": "education",
        "count": 10,
        "percentage": 20
      }
    ],
    "totalVideos": 50,
    "availableCategories": [
      "general",
      "entertainment",
      "education",
      "news",
      "sports",
      "music",
      "gaming",
      "lifestyle",
      "technology"
    ]
  }
}
```

### 4. Get Video Details

**GET** `/api/videos/{id}`

Get detailed information about a specific video.

### 5. Get Religion Videos

**GET** `/api/videos/religion`

Get videos filtered by religion with statistics.

#### Query Parameters
- `religion` (string, optional): Filter by religion
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)

#### Response
```json
{
  "success": true,
  "message": "Religion videos fetched successfully",
  "data": {
    "videos": [
      {
        "_id": "video_id",
        "author": {
          "_id": "user_id",
          "username": "username",
          "fullName": "Full Name",
          "avatar": "avatar_url"
        },
        "content": "Islamic video content",
        "videos": ["/uploads/videos/video_filename.mp4"],
        "images": ["/uploads/thumbnails/thumbnail_filename.jpg"],
        "type": "video",
        "title": "Islamic Video Title",
        "description": "Islamic video description",
        "duration": 120,
        "category": "education",
        "religion": "Islam",
        "likesCount": 5,
        "commentsCount": 2,
        "sharesCount": 1,
        "savesCount": 3,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "religion": "Islam",
    "religionStats": [
      {
        "_id": "Islam",
        "count": 25
      },
      {
        "_id": "Christianity",
        "count": 15
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalVideos": 50,
      "hasNextPage": true,
      "hasPrevPage": false,
      "limit": 10
    }
  }
}
```

### 6. Add Video Links

**POST** `/api/videos/add-links`

Bulk add external video links (e.g., YouTube Shorts) as video posts.

#### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

#### Request Body
```json
{
  "links": [
    "https://youtube.com/shorts/wRBtJzi2n6I?si=Qfgi-eFWu01fdiz5",
    "https://youtube.com/shorts/xmGz85ST7Qk?si=0DwCnvwLtdN7J6VY"
  ],
  "title": "Islamic Videos Collection",
  "description": "A collection of Islamic videos",
  "category": "education",
  "religion": "Islam"
}
```

#### Parameters
- `links` (array, required): Array of video URLs
- `title` (string, optional): Video title
- `description` (string, optional): Video description
- `category` (string, optional): Video category (default: "general")
- `religion` (string, optional): Religion tag

#### Response
```json
{
  "success": true,
  "message": "Video links added",
  "data": [
    {
      "_id": "video_id_1",
      "author": "user_id",
      "content": "A collection of Islamic videos",
      "externalUrls": ["https://youtube.com/shorts/wRBtJzi2n6I?si=Qfgi-eFWu01fdiz5"],
      "type": "video",
      "provider": "youtube",
      "title": "Islamic Videos Collection",
      "description": "A collection of Islamic videos",
      "category": "education",
      "religion": "Islam",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Headers (optional)
```
Authorization: Bearer <token>
```

#### Response
```json
{
  "success": true,
  "message": "Video details fetched successfully",
  "data": {
    "video": {
      "_id": "video_id",
      "author": {
        "_id": "user_id",
        "username": "username",
        "fullName": "Full Name",
        "avatar": "avatar_url",
        "bio": "User bio",
        "followersCount": 100,
        "followingCount": 50
      },
      "content": "Video description",
      "videos": ["/uploads/videos/video_filename.mp4"],
      "images": ["/uploads/thumbnails/thumbnail_filename.jpg"],
      "type": "video",
      "title": "Video Title",
      "description": "Video description",
      "duration": 120,
      "category": "entertainment",
      "likesCount": 5,
      "commentsCount": 2,
      "sharesCount": 1,
      "savesCount": 3,
      "isLiked": false,
      "isSaved": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "relatedVideos": [
      {
        "_id": "related_video_id",
        "author": {
          "_id": "user_id",
          "username": "username",
          "fullName": "Full Name",
          "avatar": "avatar_url"
        },
        "title": "Related Video Title",
        "thumbnail": "/uploads/thumbnails/related_thumbnail.jpg",
        "duration": 90,
        "likesCount": 3
      }
    ]
  }
}
```

## Video Categories

The following categories are supported:

- `general` - General videos
- `entertainment` - Entertainment content
- `education` - Educational videos
- `news` - News and current events
- `sports` - Sports content
- `music` - Music videos
- `gaming` - Gaming content
- `lifestyle` - Lifestyle videos
- `technology` - Technology content

## File Storage

Videos are stored in the following structure:
```
public/
├── uploads/
│   ├── videos/          # Video files
│   └── thumbnails/      # Video thumbnails
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Video file is required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Video not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details (development only)"
}
```

## Usage Examples

### JavaScript/Node.js
```javascript
// Upload video
const uploadVideo = async (videoData, token) => {
  const response = await fetch('/api/upload/video', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(videoData)
  });
  return response.json();
};

// Get video feed
const getVideoFeed = async (page = 1, limit = 10) => {
  const response = await fetch(`/api/feed/videos?page=${page}&limit=${limit}`);
  return response.json();
};

// Get video details
const getVideoDetails = async (videoId, token) => {
  const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
  const response = await fetch(`/api/videos/${videoId}`, { headers });
  return response.json();
};
```

### cURL Examples
```bash
# Upload video
curl -X POST http://localhost:3000/api/upload/video \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "My video description",
    "video": "base64_video_data",
    "title": "My Video Title",
    "category": "entertainment",
    "religion": "Islam"
  }'

# Upload external video
curl -X POST http://localhost:3000/api/upload/video \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Islamic video content",
    "externalUrl": "https://youtube.com/shorts/wRBtJzi2n6I?si=Qfgi-eFWu01fdiz5",
    "title": "Islamic Video",
    "category": "education",
    "religion": "Islam"
  }'

# Get video feed
curl http://localhost:3000/api/feed/videos?page=1&limit=10

# Get religion videos
curl http://localhost:3000/api/videos/religion?religion=Islam&page=1&limit=10

# Get video categories
curl http://localhost:3000/api/videos/categories

# Get video details
curl http://localhost:3000/api/videos/VIDEO_ID

# Add video links
curl -X POST http://localhost:3000/api/videos/add-links \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "links": [
      "https://youtube.com/shorts/wRBtJzi2n6I?si=Qfgi-eFWu01fdiz5",
      "https://youtube.com/shorts/xmGz85ST7Qk?si=0DwCnvwLtdN7J6VY"
    ],
    "title": "Islamic Videos",
    "category": "education",
    "religion": "Islam"
  }'
```

## Testing

Use the provided test file to test the video API:

```bash
node test-video-api.js
```

## Notes

- Video files are limited to 100MB
- Supported video formats: MP4, AVI, MOV, WMV, FLV, WebM, MKV
- External video URLs are supported (YouTube, Vimeo, etc.)
- Thumbnails are automatically generated if not provided
- Videos are stored in the `public/uploads/videos/` directory
- Thumbnails are stored in the `public/uploads/thumbnails/` directory
- User video counts are automatically updated when videos are uploaded
- Related videos are based on the same category
- Religion filtering is available for all video endpoints
- Authentication is required for upload, optional for viewing
