# Post Creation API - cURL Commands

This document contains comprehensive cURL commands for creating posts using the server's POST endpoints.

## Base URLs
```bash
# Production Server
PROD_URL="http://103.14.120.163:8081"

# Local Development
LOCAL_URL="http://localhost:3000"
```

## Authentication
All API calls require Bearer token authentication:
```bash
Authorization: Bearer <your_jwt_token>
```

---

## 1. Basic Post Creation

### Create Simple Text Post
```bash
curl -X POST "${PROD_URL}/api/posts" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is my first post! Hello world!",
    "type": "post"
  }'
```

### Create Post with Images
```bash
curl -X POST "${PROD_URL}/api/posts" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Check out these amazing photos!",
    "images": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg"
    ],
    "type": "post"
  }'
```

### Create Post with Videos
```bash
curl -X POST "${PROD_URL}/api/posts" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Watch my latest video!",
    "videos": [
      "https://example.com/video1.mp4"
    ],
    "type": "video"
  }'
```

---

## 2. Enhanced Post Creation

### Create Enhanced Post with All Features
```bash
curl -X POST "${PROD_URL}/api/posts/create-enhanced" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is an enhanced post with all features!",
    "type": "post",
    "title": "My Amazing Post",
    "description": "This post demonstrates all the enhanced features",
    "category": "general",
    "images": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg"
    ],
    "videos": [
      "https://example.com/video1.mp4"
    ],
    "audio": [
      "https://example.com/audio1.mp3"
    ],
    "documents": [
      "https://example.com/document1.pdf"
    ],
    "isPrivate": false,
    "allowComments": true,
    "allowLikes": true,
    "tags": ["amazing", "enhanced", "features"],
    "location": "Mumbai, India",
    "mood": "happy",
    "religion": "Hindu"
  }'
```

### Create Video Post
```bash
curl -X POST "${PROD_URL}/api/posts/create-enhanced" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Check out my new video!",
    "type": "video",
    "title": "My Video Title",
    "description": "Video description",
    "category": "entertainment",
    "videos": [
      "https://example.com/video.mp4"
    ],
    "isPrivate": false,
    "allowComments": true,
    "allowLikes": true,
    "tags": ["video", "entertainment"]
  }'
```

### Create Message Post
```bash
curl -X POST "${PROD_URL}/api/posts/create-enhanced" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello everyone!",
    "type": "message",
    "audio": [
      "https://example.com/voice-message.mp3"
    ],
    "isPrivate": true,
    "allowComments": false,
    "allowLikes": true
  }'
```

### Create Story
```bash
curl -X POST "${PROD_URL}/api/posts/create-enhanced" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Story content",
    "type": "story",
    "images": [
      "https://example.com/story-image.jpg"
    ],
    "isPrivate": false,
    "allowComments": true,
    "allowLikes": true
  }'
```

### Create Reel
```bash
curl -X POST "${PROD_URL}/api/posts/create-enhanced" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Check out my reel!",
    "type": "reel",
    "title": "My Reel",
    "videos": [
      "https://example.com/reel-video.mp4"
    ],
    "reelDuration": 30,
    "isPrivate": false,
    "allowComments": true,
    "allowLikes": true,
    "tags": ["reel", "fun"]
  }'
```

---

## 3. Baba Pages Post Creation

### Create Post for Baba Page
```bash
curl -X POST "${PROD_URL}/api/baba-pages/PAGE_ID_HERE/posts" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "content=This is a spiritual post about yoga and meditation"
```

### Create Post with Media for Baba Page
```bash
curl -X POST "${PROD_URL}/api/baba-pages/PAGE_ID_HERE/posts" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "content=This is a spiritual post with an image" \
  -F "media=@/path/to/image.jpg"
```

### Create Post with Multiple Media Files for Baba Page
```bash
curl -X POST "${PROD_URL}/api/baba-pages/PAGE_ID_HERE/posts" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "content=This is a post with multiple media files" \
  -F "media=@/path/to/image1.jpg" \
  -F "media=@/path/to/video1.mp4" \
  -F "media=@/path/to/image2.jpg"
```

---

## 4. Local Development Examples

### Create Post on Local Server
```bash
curl -X POST "${LOCAL_URL}/api/posts" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Testing post creation on local server",
    "type": "post"
  }'
```

### Create Enhanced Post on Local Server
```bash
curl -X POST "${LOCAL_URL}/api/posts/create-enhanced" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Local development test post",
    "type": "post",
    "title": "Local Test",
    "category": "testing",
    "isPrivate": false,
    "allowComments": true,
    "allowLikes": true
  }'
```

---

## 5. Complete Workflow Examples

### Example 1: Upload Assets and Create Post
```bash
# Step 1: Upload image asset
curl -X POST "${PROD_URL}/api/assets/upload?userId=YOUR_USER_ID" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/your/image.jpg"

# Step 2: Create post with uploaded asset
curl -X POST "${PROD_URL}/api/posts/create-enhanced" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Post with uploaded image",
    "type": "post",
    "images": ["/assets/YOUR_USER_ID/images/filename.jpg"],
    "isPrivate": false,
    "allowComments": true,
    "allowLikes": true
  }'
```

### Example 2: Create Multiple Types of Posts
```bash
# Create a regular post
curl -X POST "${PROD_URL}/api/posts/create-enhanced" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Regular post content",
    "type": "post",
    "isPrivate": false
  }'

# Create a private post
curl -X POST "${PROD_URL}/api/posts/create-enhanced" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is a private post",
    "type": "post",
    "isPrivate": true,
    "allowComments": false
  }'

# Create a video post
curl -X POST "${PROD_URL}/api/posts/create-enhanced" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Check out my video!",
    "type": "video",
    "videos": ["https://example.com/video.mp4"],
    "isPrivate": false
  }'
```

---

## 6. Response Examples

### Successful Post Creation Response
```json
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "post": {
      "_id": "post_id_here",
      "content": "This is my post content",
      "type": "post",
      "author": {
        "_id": "user_id",
        "username": "username",
        "fullName": "Full Name",
        "avatar": "avatar_url",
        "isPrivate": false,
        "religion": "Hindu"
      },
      "images": ["image_url_1", "image_url_2"],
      "videos": ["video_url"],
      "isPrivate": false,
      "allowComments": true,
      "allowLikes": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Post must have content or images",
  "error": "Validation failed"
}
```

---

## 7. Testing Commands

### Test with Invalid Token
```bash
curl -X POST "${PROD_URL}/api/posts" \
  -H "Authorization: Bearer invalid_token" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This should fail"
  }'
```

### Test with Missing Content
```bash
curl -X POST "${PROD_URL}/api/posts" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "post"
  }'
```

### Test with Long Content
```bash
curl -X POST "${PROD_URL}/api/posts" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is a very long content that exceeds the 2000 character limit...",
    "type": "post"
  }'
```

---

## 8. Environment Variables for Testing

Create a `.env` file for testing:
```env
# Server Configuration
PROD_SERVER_URL=http://103.14.120.163:8081
LOCAL_SERVER_URL=http://localhost:3000

# Authentication
JWT_TOKEN=your_jwt_token_here

# Test Data
TEST_USER_ID=your_user_id_here
TEST_PAGE_ID=your_page_id_here
```

---

## Important Notes

1. **Authentication**: All endpoints require a valid JWT token
2. **Content Validation**: Posts must have content or media
3. **Content Length**: Text content must be less than 2000 characters
4. **Media Types**: Supported formats include JPEG, PNG, GIF, WebP, MP4, MOV, AVI, WebM
5. **Privacy Settings**: Private posts are only visible to followers
6. **File Uploads**: Use the assets API for file uploads before creating posts
7. **Rate Limiting**: Be mindful of API rate limits in production

## Quick Start

1. Get your JWT token from the login endpoint
2. Test with a simple text post first
3. Upload media files using the assets API
4. Create posts with media using the uploaded file URLs
5. Test different post types and privacy settings

## Troubleshooting

- **401 Unauthorized**: Check your JWT token
- **400 Bad Request**: Validate your request body
- **413 Payload Too Large**: Reduce file sizes or content length
- **500 Internal Server Error**: Check server logs and database connection
