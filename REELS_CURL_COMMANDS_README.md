# Reels Management API - Curl Commands

## Overview
This document contains all the curl commands for testing the Reels Management API. The API provides comprehensive reel management functionality with local storage in the `public/assets/reels` folder.

## Base URL
```
http://localhost:3000/api/reels-management
```

## Authentication
All endpoints require JWT authentication via the `Authorization` header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 1. Upload Reel

### Upload Reel with Video
```bash
curl -X POST http://localhost:3000/api/reels-management/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "caption=Check out this amazing reel!" \
  -F "video=@/path/to/your/video.mp4" \
  -F "isPublic=true"
```

### Upload Private Reel
```bash
curl -X POST http://localhost:3000/api/reels-management/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "caption=This is a private reel" \
  -F "video=@/path/to/your/video.mp4" \
  -F "isPublic=false"
```

### Upload Reel with Long Caption
```bash
curl -X POST http://localhost:3000/api/reels-management/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "caption=This is a longer caption with more details about the reel. It can contain multiple sentences and provide more context about what the reel is about." \
  -F "video=@/path/to/your/video.mp4" \
  -F "isPublic=true"
```

---

## 2. Retrieve Reels

### Get All Reels
```bash
curl -X GET "http://localhost:3000/api/reels-management/retrieve?limit=10&offset=0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Reels with Pagination
```bash
curl -X GET "http://localhost:3000/api/reels-management/retrieve?limit=5&offset=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Specific Reel by ID
```bash
curl -X GET "http://localhost:3000/api/reels-management/retrieve?reelId=REEL_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get User's Own Reels
```bash
curl -X GET "http://localhost:3000/api/reels-management/retrieve?userId=USER_ID_HERE&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Reels - Second Page
```bash
curl -X GET "http://localhost:3000/api/reels-management/retrieve?limit=10&offset=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Reels with Different Limits
```bash
curl -X GET "http://localhost:3000/api/reels-management/retrieve?limit=20&offset=0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 3. Like Reels

### Like a Reel
```bash
curl -X POST "http://localhost:3000/api/reels-management/like?reelId=REEL_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Like Another Reel
```bash
curl -X POST "http://localhost:3000/api/reels-management/like?reelId=ANOTHER_REEL_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 4. Unlike Reels

### Unlike a Reel
```bash
curl -X DELETE "http://localhost:3000/api/reels-management/unlike?reelId=REEL_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Unlike Another Reel
```bash
curl -X DELETE "http://localhost:3000/api/reels-management/unlike?reelId=ANOTHER_REEL_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 5. Add Comments to Reels

### Add Comment to Reel
```bash
curl -X POST "http://localhost:3000/api/reels-management/comment?reelId=REEL_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"comment": "This is an amazing reel! Keep it up!"}'
```

### Add Another Comment
```bash
curl -X POST "http://localhost:3000/api/reels-management/comment?reelId=REEL_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"comment": "Love the creativity in this reel!"}'
```

### Add Comment with Emoji
```bash
curl -X POST "http://localhost:3000/api/reels-management/comment?reelId=REEL_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"comment": "🔥🔥🔥 This is fire!"}'
```

---

## 6. Delete Reels

### Delete a Reel
```bash
curl -X DELETE "http://localhost:3000/api/reels-management/delete?reelId=REEL_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Delete Another Reel
```bash
curl -X DELETE "http://localhost:3000/api/reels-management/delete?reelId=ANOTHER_REEL_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 7. Error Testing Commands

### Test Upload without Token
```bash
curl -X POST http://localhost:3000/api/reels-management/upload \
  -F "caption=This should fail without token" \
  -F "video=@/path/to/video.mp4"
```

### Test Like Non-existent Reel
```bash
curl -X POST "http://localhost:3000/api/reels-management/like?reelId=non-existent-id" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test Delete Non-existent Reel
```bash
curl -X DELETE "http://localhost:3000/api/reels-management/delete?reelId=non-existent-id" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test Comment without Text
```bash
curl -X POST "http://localhost:3000/api/reels-management/comment?reelId=REEL_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"comment": ""}'
```

---

## 8. Complete Test Sequence

### Step-by-Step Testing Workflow

#### Step 1: Upload a Reel
```bash
curl -X POST http://localhost:3000/api/reels-management/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "caption=Test reel for API testing" \
  -F "video=@/path/to/test_video.mp4" \
  -F "isPublic=true"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Reel uploaded successfully",
  "reel": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "userId": "68ef2bda653cc04c3f9e043a",
    "username": "john_doe",
    "caption": "Test reel for API testing",
    "mediaType": "video",
    "mediaPath": "/assets/reels/a1b2c3d4-e5f6-7890-abcd-ef1234567890_1760504926532.mp4",
    "thumbnailPath": "/assets/reels/a1b2c3d4-e5f6-7890-abcd-ef1234567890_1760504926532_thumb.jpg",
    "duration": 0,
    "createdAt": "2024-01-15T05:08:46.532Z",
    "likesCount": 0,
    "commentsCount": 0,
    "viewsCount": 0,
    "isPublic": true
  }
}
```

#### Step 2: Retrieve the Uploaded Reel
```bash
curl -X GET "http://localhost:3000/api/reels-management/retrieve?reelId=a1b2c3d4-e5f6-7890-abcd-ef1234567890" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Step 3: Like the Reel
```bash
curl -X POST "http://localhost:3000/api/reels-management/like?reelId=a1b2c3d4-e5f6-7890-abcd-ef1234567890" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Step 4: Add a Comment
```bash
curl -X POST "http://localhost:3000/api/reels-management/comment?reelId=a1b2c3d4-e5f6-7890-abcd-ef1234567890" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"comment": "Great test reel!"}'
```

#### Step 5: Unlike the Reel
```bash
curl -X DELETE "http://localhost:3000/api/reels-management/unlike?reelId=a1b2c3d4-e5f6-7890-abcd-ef1234567890" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Step 6: Delete the Reel
```bash
curl -X DELETE "http://localhost:3000/api/reels-management/delete?reelId=a1b2c3d4-e5f6-7890-abcd-ef1234567890" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 9. Multiple File Upload Examples

### Upload Different Video Formats

#### Upload MP4 Video
```bash
curl -X POST http://localhost:3000/api/reels-management/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "caption=MP4 video reel" \
  -F "video=@/path/to/video.mp4" \
  -F "isPublic=true"
```

#### Upload MOV Video
```bash
curl -X POST http://localhost:3000/api/reels-management/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "caption=MOV video reel" \
  -F "video=@/path/to/video.mov" \
  -F "isPublic=true"
```

#### Upload AVI Video
```bash
curl -X POST http://localhost:3000/api/reels-management/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "caption=AVI video reel" \
  -F "video=@/path/to/video.avi" \
  -F "isPublic=true"
```

---

## 10. Batch Operations

### Upload Multiple Reels
```bash
# Reel 1
curl -X POST http://localhost:3000/api/reels-management/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "caption=First reel" \
  -F "video=@/path/to/video1.mp4" \
  -F "isPublic=true"

# Reel 2
curl -X POST http://localhost:3000/api/reels-management/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "caption=Second reel" \
  -F "video=@/path/to/video2.mp4" \
  -F "isPublic=true"

# Reel 3
curl -X POST http://localhost:3000/api/reels-management/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "caption=Third reel" \
  -F "video=@/path/to/video3.mp4" \
  -F "isPublic=true"
```

### Like Multiple Reels
```bash
# Like Reel 1
curl -X POST "http://localhost:3000/api/reels-management/like?reelId=REEL_ID_1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Like Reel 2
curl -X POST "http://localhost:3000/api/reels-management/like?reelId=REEL_ID_2" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Like Reel 3
curl -X POST "http://localhost:3000/api/reels-management/like?reelId=REEL_ID_3" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Important Notes

1. **Replace `YOUR_JWT_TOKEN`** with your actual JWT token
2. **Replace `REEL_ID_HERE`** with actual reel IDs from responses
3. **Replace `USER_ID_HERE`** with actual user IDs
4. **Replace `/path/to/your/video.mp4`** with actual file paths
5. **Make sure your server is running** on `http://localhost:3000`
6. **File paths** should be absolute paths to your video files
7. **Test in order**: Upload → Retrieve → Like → Comment → Unlike → Delete
8. **Video file is required** for reel uploads (unlike posts which can be text-only)
9. **Maximum file size** is 100MB for videos
10. **Supported formats**: .mp4, .avi, .mov, .wmv, .flv, .webm, .mkv, .3gp

---

## Response Examples

### Successful Upload Response
```json
{
  "success": true,
  "message": "Reel uploaded successfully",
  "reel": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "userId": "68ef2bda653cc04c3f9e043a",
    "username": "john_doe",
    "caption": "Check out this amazing reel!",
    "mediaType": "video",
    "mediaPath": "/assets/reels/a1b2c3d4-e5f6-7890-abcd-ef1234567890_1760504926532.mp4",
    "thumbnailPath": "/assets/reels/a1b2c3d4-e5f6-7890-abcd-ef1234567890_1760504926532_thumb.jpg",
    "duration": 0,
    "createdAt": "2024-01-15T05:08:46.532Z",
    "likesCount": 0,
    "commentsCount": 0,
    "viewsCount": 0,
    "isPublic": true
  }
}
```

### Successful Like Response
```json
{
  "success": true,
  "message": "Reel liked successfully",
  "reelId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "likedBy": "john_doe",
  "likedByUserId": "68ef2bda653cc04c3f9e043a",
  "likesCount": 1,
  "isLiked": true
}
```

### Error Response Example
```json
{
  "error": "Authorization token required"
}
```

---

## Quick Start Guide

1. **Get your JWT token** from login API
2. **Upload a test reel** using the upload command
3. **Note the reel ID** from the response
4. **Test all operations** using the reel ID
5. **Clean up** by deleting the test reel

This comprehensive guide covers all possible curl commands for testing the Reels Management API!






