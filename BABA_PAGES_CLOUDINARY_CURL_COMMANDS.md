# Baba Pages Cloudinary API - CURL Commands

This document provides comprehensive CURL commands for testing the Baba Pages Cloudinary API endpoints.

## Base URL
```
http://localhost:3000/api/baba-pages
```

## Environment Setup
Make sure your `.env` file contains:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 1. BABA PAGES MANAGEMENT

### Create a New Baba Page
```bash
curl -X POST "http://localhost:3000/api/baba-pages" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Baba Ramdev Ji",
    "description": "Spiritual leader and yoga guru",
    "location": "Haridwar, India",
    "religion": "Hindu",
    "website": "https://baba-ramdev.com"
  }'
```

### Get All Baba Pages
```bash
curl -X GET "http://localhost:3000/api/baba-pages?page=1&limit=10"
```

### Get Specific Baba Page
```bash
curl -X GET "http://localhost:3000/api/baba-pages/64a1b2c3d4e5f6789012345"
```

### Update Baba Page
```bash
curl -X PUT "http://localhost:3000/api/baba-pages/64a1b2c3d4e5f6789012345" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Baba Ramdev Ji - Updated",
    "description": "Updated description",
    "location": "Haridwar, Uttarakhand, India"
  }'
```

### Delete Baba Page
```bash
curl -X DELETE "http://localhost:3000/api/baba-pages/64a1b2c3d4e5f6789012345"
```

---

## 2. POSTS API

### Create Post with Text Only
```bash
curl -X POST "http://localhost:3000/api/baba-pages/64a1b2c3d4e5f6789012345/posts" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Today is a blessed day. May everyone find peace and happiness in their lives. 🙏"
  }'
```

### Create Post with Single Image
```bash
curl -X POST "http://localhost:3000/api/baba-pages/64a1b2c3d4e5f6789012345/posts" \
  -F "content=Sharing a beautiful moment from today's meditation session" \
  -F "media=@/path/to/image.jpg"
```

### Create Post with Multiple Images
```bash
curl -X POST "http://localhost:3000/api/baba-pages/64a1b2c3d4e5f6789012345/posts" \
  -F "content=Multiple images from the spiritual gathering" \
  -F "media=@/path/to/image1.jpg" \
  -F "media=@/path/to/image2.jpg" \
  -F "media=@/path/to/image3.jpg"
```

### Create Post with Video
```bash
curl -X POST "http://localhost:3000/api/baba-pages/64a1b2c3d4e5f6789012345/posts" \
  -F "content=Video message for all devotees" \
  -F "media=@/path/to/video.mp4"
```

### Get All Posts for a Page
```bash
curl -X GET "http://localhost:3000/api/baba-pages/64a1b2c3d4e5f6789012345/posts?page=1&limit=10"
```

### Get Specific Post
```bash
curl -X GET "http://localhost:3000/api/baba-pages/64a1b2c3d4e5f6789012345/posts/64a1b2c3d4e5f6789012346"
```

### Update Post
```bash
curl -X PUT "http://localhost:3000/api/baba-pages/64a1b2c3d4e5f6789012345/posts/64a1b2c3d4e5f6789012346" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Updated post content with new message"
  }'
```

### Delete Post
```bash
curl -X DELETE "http://localhost:3000/api/baba-pages/64a1b2c3d4e5f6789012345/posts/64a1b2c3d4e5f6789012346"
```

---

## 3. VIDEOS API

### Create Video with Title Only
```bash
curl -X POST "http://localhost:3000/api/baba-pages/64a1b2c3d4e5f6789012345/videos" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Daily Meditation Session",
    "description": "Join us for daily meditation",
    "category": "video"
  }'
```

### Create Video with File
```bash
curl -X POST "http://localhost:3000/api/baba-pages/64a1b2c3d4e5f6789012345/videos" \
  -F "title=Spiritual Teachings - Part 1" \
  -F "description=Deep insights into spiritual practices" \
  -F "category=video" \
  -F "video=@/path/to/video.mp4"
```

### Create Video with Thumbnail
```bash
curl -X POST "http://localhost:3000/api/baba-pages/64a1b2c3d4e5f6789012345/videos" \
  -F "title=Yoga Session - Morning Routine" \
  -F "description=Complete morning yoga routine" \
  -F "category=reel" \
  -F "video=@/path/to/video.mp4" \
  -F "thumbnail=@/path/to/thumbnail.jpg"
```

### Create Reel
```bash
curl -X POST "http://localhost:3000/api/baba-pages/64a1b2c3d4e5f6789012345/videos" \
  -F "title=Quick Meditation Tip" \
  -F "description=60-second meditation technique" \
  -F "category=reel" \
  -F "video=@/path/to/short_video.mp4"
```

### Get All Videos
```bash
curl -X GET "http://localhost:3000/api/baba-pages/64a1b2c3d4e5f6789012345/videos?page=1&limit=10"
```

### Get Videos by Category
```bash
# Get only reels
curl -X GET "http://localhost:3000/api/baba-pages/64a1b2c3d4e5f6789012345/videos?category=reel&page=1&limit=10"

# Get only videos
curl -X GET "http://localhost:3000/api/baba-pages/64a1b2c3d4e5f6789012345/videos?category=video&page=1&limit=10"
```

### Get Specific Video
```bash
curl -X GET "http://localhost:3000/api/baba-pages/64a1b2c3d4e5f6789012345/videos/64a1b2c3d4e5f6789012347"
```

### Update Video
```bash
curl -X PUT "http://localhost:3000/api/baba-pages/64a1b2c3d4e5f6789012345/videos/64a1b2c3d4e5f6789012347" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Video Title",
    "description": "Updated video description"
  }'
```

### Delete Video
```bash
curl -X DELETE "http://localhost:3000/api/baba-pages/64a1b2c3d4e5f6789012345/videos/64a1b2c3d4e5f6789012347"
```

---

## 4. STORIES API

### Create Story with Text Only
```bash
curl -X POST "http://localhost:3000/api/baba-pages/64a1b2c3d4e5f6789012345/stories" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Good morning everyone! Have a blessed day ahead. 🙏"
  }'
```

### Create Story with Image
```bash
curl -X POST "http://localhost:3000/api/baba-pages/64a1b2c3d4e5f6789012345/stories" \
  -F "content=Beautiful sunrise from the ashram" \
  -F "media=@/path/to/sunrise.jpg"
```

### Create Story with Video
```bash
curl -X POST "http://localhost:3000/api/baba-pages/64a1b2c3d4e5f6789012345/stories" \
  -F "content=Quick meditation moment" \
  -F "media=@/path/to/short_video.mp4"
```

### Create Story without Text (Media Only)
```bash
curl -X POST "http://localhost:3000/api/baba-pages/64a1b2c3d4e5f6789012345/stories" \
  -F "media=@/path/to/image.jpg"
```

### Get All Active Stories
```bash
curl -X GET "http://localhost:3000/api/baba-pages/64a1b2c3d4e5f6789012345/stories"
```

### Get Specific Story
```bash
curl -X GET "http://localhost:3000/api/baba-pages/64a1b2c3d4e5f6789012345/stories/64a1b2c3d4e5f6789012348"
```

### Delete Story
```bash
curl -X DELETE "http://localhost:3000/api/baba-pages/64a1b2c3d4e5f6789012345/stories/64a1b2c3d4e5f6789012348"
```

---

## 5. TESTING SCENARIOS

### Complete Workflow Test
```bash
# 1. Create a baba page
PAGE_ID=$(curl -s -X POST "http://localhost:3000/api/baba-pages" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Baba", "description": "Test page", "location": "Test City", "religion": "Hindu"}' \
  | jq -r '.data._id')

echo "Created page with ID: $PAGE_ID"

# 2. Create a post with image
curl -X POST "http://localhost:3000/api/baba-pages/$PAGE_ID/posts" \
  -F "content=Test post with image" \
  -F "media=@/path/to/test-image.jpg"

# 3. Create a video
curl -X POST "http://localhost:3000/api/baba-pages/$PAGE_ID/videos" \
  -F "title=Test Video" \
  -F "description=Test video description" \
  -F "category=video" \
  -F "video=@/path/to/test-video.mp4"

# 4. Create a story
curl -X POST "http://localhost:3000/api/baba-pages/$PAGE_ID/stories" \
  -F "content=Test story" \
  -F "media=@/path/to/test-story.jpg"

# 5. Get all content
curl -X GET "http://localhost:3000/api/baba-pages/$PAGE_ID/posts"
curl -X GET "http://localhost:3000/api/baba-pages/$PAGE_ID/videos"
curl -X GET "http://localhost:3000/api/baba-pages/$PAGE_ID/stories"
```

### Error Testing
```bash
# Test with invalid page ID
curl -X GET "http://localhost:3000/api/baba-pages/invalid-id/posts"

# Test with missing required fields
curl -X POST "http://localhost:3000/api/baba-pages/64a1b2c3d4e5f6789012345/posts" \
  -H "Content-Type: application/json" \
  -d '{}'

# Test with invalid category
curl -X POST "http://localhost:3000/api/baba-pages/64a1b2c3d4e5f6789012345/videos" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Video",
    "category": "invalid-category"
  }'
```

---

## 6. RESPONSE EXAMPLES

### Successful Post Creation
```json
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "_id": "64a1b2c3d4e5f6789012346",
    "babaPageId": "64a1b2c3d4e5f6789012345",
    "content": "Test post content",
    "media": [
      {
        "type": "image",
        "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/baba-pages/64a1b2c3d4e5f6789012345/posts/posts_1234567890_abc123.jpg",
        "filename": "posts_1234567890_abc123.jpg",
        "size": 1024000,
        "mimeType": "image/jpeg",
        "publicId": "baba-pages/64a1b2c3d4e5f6789012345/posts/posts_1234567890_abc123"
      }
    ],
    "likesCount": 0,
    "commentsCount": 0,
    "sharesCount": 0,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Content is required"
}
```

---

## 7. NOTES

### File Upload Requirements
- **Images**: JPG, PNG, GIF, WebP
- **Videos**: MP4, MOV, AVI, WebM
- **Max File Size**: 100MB (configurable)
- **Multiple Files**: Supported for posts (array of files)

### Cloudinary Integration
- All media files are automatically uploaded to Cloudinary
- Files are organized in folder structure: `baba-pages/{pageId}/{mediaType}/`
- Thumbnails for videos are stored in: `baba-pages/{pageId}/videos/thumbnails/`
- Deleted content is automatically removed from Cloudinary

### Pagination
- Default page size: 10 items
- Maximum page size: 100 items
- Use `page` and `limit` query parameters

### Stories Expiration
- Stories automatically expire after 24 hours
- Only active, non-expired stories are returned in GET requests

### Error Codes
- `400`: Bad Request (invalid data, missing required fields)
- `404`: Not Found (page/post/video/story not found)
- `500`: Internal Server Error (server/Cloudinary errors)

---

## 8. QUICK TEST COMMANDS

### Test All Endpoints (Replace IDs with actual values)
```bash
# Test page creation
curl -X POST "http://localhost:3000/api/baba-pages" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Baba", "description": "Test", "location": "Test", "religion": "Hindu"}'

# Test post creation
curl -X POST "http://localhost:3000/api/baba-pages/YOUR_PAGE_ID/posts" \
  -F "content=Test post" \
  -F "media=@/path/to/image.jpg"

# Test video creation
curl -X POST "http://localhost:3000/api/baba-pages/YOUR_PAGE_ID/videos" \
  -F "title=Test Video" \
  -F "category=video" \
  -F "video=@/path/to/video.mp4"

# Test story creation
curl -X POST "http://localhost:3000/api/baba-pages/YOUR_PAGE_ID/stories" \
  -F "content=Test story" \
  -F "media=@/path/to/image.jpg"
```

Replace `YOUR_PAGE_ID` with the actual page ID returned from the page creation response.

