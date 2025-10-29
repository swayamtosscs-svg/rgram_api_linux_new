# Posts & Reels Management API - Complete cURL Commands

यह document Posts Management और Reels Management APIs के लिए सभी cURL commands प्रदान करता है।

## Base URLs

```bash
# Production Server
PROD_URL="http://103.14.120.163:8081"

# Local Development
LOCAL_URL="http://localhost:3000"

# Vercel Production (if applicable)
VERCEL_URL="https://api-rgram1.vercel.app"
```

## Authentication

सभी API calls के लिए Bearer token authentication आवश्यक है:
```bash
Authorization: Bearer <your_jwt_token>
```

---

## 📝 POSTS MANAGEMENT APIs

### 1. Upload Post

#### Upload Post with Image
```bash
curl -X POST "${PROD_URL}/api/posts-management/upload" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "media=@/path/to/image.jpg" \
  -F "caption=This is my amazing post with an image!" \
  -F "isPublic=true"
```

#### Upload Post with Video
```bash
curl -X POST "${PROD_URL}/api/posts-management/upload" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "media=@/path/to/video.mp4" \
  -F "caption=Check out this awesome video!" \
  -F "isPublic=true"
```

#### Upload Text Only Post (No Media)
```bash
curl -X POST "${PROD_URL}/api/posts-management/upload" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "caption=This is a text-only post!" \
  -F "isPublic=true"
```

#### Upload Private Post
```bash
curl -X POST "${PROD_URL}/api/posts-management/upload" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "media=@/path/to/image.jpg" \
  -F "caption=This is a private post" \
  -F "isPublic=false"
```

**Response:**
```json
{
  "success": true,
  "message": "Post uploaded successfully",
  "post": {
    "id": "post-uuid-here",
    "userId": "user-id-here",
    "username": "username",
    "caption": "This is my amazing post!",
    "mediaType": "image",
    "mediaPath": "/assets/posts/post-id_timestamp.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "likesCount": 0,
    "commentsCount": 0,
    "isPublic": true
  }
}
```

---

### 2. Retrieve Posts

#### Get All Posts (with Pagination)
```bash
curl -X GET "${PROD_URL}/api/posts-management/retrieve?limit=10&offset=0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Get Specific Post by ID
```bash
curl -X GET "${PROD_URL}/api/posts-management/retrieve?postId=POST_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Get Posts by User ID
```bash
curl -X GET "${PROD_URL}/api/posts-management/retrieve?userId=USER_ID_HERE&limit=20&offset=0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Get Posts with Custom Pagination
```bash
curl -X GET "${PROD_URL}/api/posts-management/retrieve?limit=25&offset=50" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (for list):**
```json
{
  "success": true,
  "posts": [
    {
      "id": "post-id-1",
      "userId": "user-id-1",
      "username": "username1",
      "caption": "Post caption",
      "mediaType": "image",
      "mediaPath": "/assets/posts/image.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "likesCount": 10,
      "commentsCount": 3,
      "isPublic": true,
      "isLikedByUser": false
    }
  ],
  "total": 100,
  "limit": 10,
  "offset": 0
}
```

---

### 3. Delete Post

```bash
curl -X DELETE "${PROD_URL}/api/posts-management/delete?postId=POST_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Post deleted successfully",
  "deletedPostId": "post-id-here",
  "deletedBy": "username",
  "deletedByUserId": "user-id-here"
}
```

**Note:** केवल post owner ही अपना post delete कर सकता है।

---

### 4. Like Post

```bash
curl -X POST "${PROD_URL}/api/posts-management/like?postId=POST_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Post liked successfully",
  "postId": "post-id-here",
  "likedBy": "username",
  "likedByUserId": "user-id-here",
  "likesCount": 15,
  "isLiked": true
}
```

---

### 5. Unlike Post

```bash
curl -X DELETE "${PROD_URL}/api/posts-management/unlike?postId=POST_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Post unliked successfully",
  "postId": "post-id-here",
  "unlikedBy": "username",
  "unlikedByUserId": "user-id-here",
  "likesCount": 14,
  "isLiked": false
}
```

---

## 🎬 REELS MANAGEMENT APIs

### 1. Upload Reel

#### Upload Reel with Video
```bash
curl -X POST "${PROD_URL}/api/reels-management/upload" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "video=@/path/to/video.mp4" \
  -F "caption=Check out my amazing reel! #reels #fun" \
  -F "isPublic=true"
```

#### Upload Private Reel
```bash
curl -X POST "${PROD_URL}/api/reels-management/upload" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "video=@/path/to/video.mp4" \
  -F "caption=This is a private reel" \
  -F "isPublic=false"
```

#### Upload Reel with Long Caption
```bash
curl -X POST "${PROD_URL}/api/reels-management/upload" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "video=@/path/to/video.mp4" \
  -F "caption=This is a longer caption for my reel with multiple lines and hashtags #reels #viral #trending #fun #entertainment" \
  -F "isPublic=true"
```

**Important Notes:**
- Video file field name must be `video` (not `media`)
- Maximum file size: 100MB
- Supported video formats: .mp4, .avi, .mov, .wmv, .flv, .webm

**Response:**
```json
{
  "success": true,
  "message": "Reel uploaded successfully",
  "reel": {
    "id": "reel-uuid-here",
    "userId": "user-id-here",
    "username": "username",
    "caption": "Check out my amazing reel!",
    "mediaType": "video",
    "mediaPath": "/assets/reels/reel-id_timestamp.mp4",
    "thumbnailPath": "/assets/reels/reel-id_timestamp_thumb.jpg",
    "duration": 0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "likesCount": 0,
    "commentsCount": 0,
    "viewsCount": 0,
    "isPublic": true
  }
}
```

---

### 2. Retrieve Reels

#### Get All Reels (with Pagination)
```bash
curl -X GET "${PROD_URL}/api/reels-management/retrieve?limit=10&offset=0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Get Specific Reel by ID
```bash
curl -X GET "${PROD_URL}/api/reels-management/retrieve?reelId=REEL_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Note:** Reel retrieve करने पर view count automatically increment होता है।

#### Get Reels by User ID
```bash
curl -X GET "${PROD_URL}/api/reels-management/retrieve?userId=USER_ID_HERE&limit=20&offset=0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Get Reels with Custom Pagination
```bash
curl -X GET "${PROD_URL}/api/reels-management/retrieve?limit=25&offset=50" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (for list):**
```json
{
  "success": true,
  "reels": [
    {
      "id": "reel-id-1",
      "userId": "user-id-1",
      "username": "username1",
      "caption": "Reel caption",
      "mediaType": "video",
      "mediaPath": "/assets/reels/video.mp4",
      "thumbnailPath": "/assets/reels/video_thumb.jpg",
      "duration": 30,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "likesCount": 50,
      "commentsCount": 5,
      "viewsCount": 1000,
      "isPublic": true,
      "isLikedByUser": false
    }
  ],
  "total": 50,
  "limit": 10,
  "offset": 0
}
```

**Response (for specific reel):**
```json
{
  "success": true,
  "reel": {
    "id": "reel-id-here",
    "userId": "user-id-here",
    "username": "username",
    "caption": "Reel caption",
    "mediaType": "video",
    "mediaPath": "/assets/reels/video.mp4",
    "thumbnailPath": "/assets/reels/video_thumb.jpg",
    "duration": 30,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "likesCount": 50,
    "commentsCount": 5,
    "viewsCount": 1001,
    "isPublic": true,
    "isLikedByUser": false
  }
}
```

---

### 3. Delete Reel

```bash
curl -X DELETE "${PROD_URL}/api/reels-management/delete?reelId=REEL_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Reel deleted successfully",
  "deletedReelId": "reel-id-here",
  "deletedBy": "username",
  "deletedByUserId": "user-id-here"
}
```

**Note:** केवल reel owner ही अपना reel delete कर सकता है। Delete करने पर video file और thumbnail दोनों delete हो जाते हैं।

---

### 4. Like Reel

```bash
curl -X POST "${PROD_URL}/api/reels-management/like?reelId=REEL_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Reel liked successfully",
  "reelId": "reel-id-here",
  "likedBy": "username",
  "likedByUserId": "user-id-here",
  "likesCount": 51,
  "isLiked": true
}
```

---

### 5. Unlike Reel

```bash
curl -X DELETE "${PROD_URL}/api/reels-management/unlike?reelId=REEL_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Reel unliked successfully",
  "reelId": "reel-id-here",
  "unlikedBy": "username",
  "unlikedByUserId": "user-id-here",
  "likesCount": 50,
  "isLiked": false
}
```

---

## 📋 Quick Reference

### Posts Management Endpoints

| Operation | Method | Endpoint | Query Params | Form Data |
|-----------|--------|----------|--------------|-----------|
| Upload | POST | `/api/posts-management/upload` | - | `media`, `caption`, `isPublic` |
| Retrieve | GET | `/api/posts-management/retrieve` | `postId?`, `userId?`, `limit?`, `offset?` | - |
| Delete | DELETE | `/api/posts-management/delete` | `postId` | - |
| Like | POST | `/api/posts-management/like` | `postId` | - |
| Unlike | DELETE | `/api/posts-management/unlike` | `postId` | - |

### Reels Management Endpoints

| Operation | Method | Endpoint | Query Params | Form Data |
|-----------|--------|----------|--------------|-----------|
| Upload | POST | `/api/reels-management/upload` | - | `video`, `caption`, `isPublic` |
| Retrieve | GET | `/api/reels-management/retrieve` | `reelId?`, `userId?`, `limit?`, `offset?` | - |
| Delete | DELETE | `/api/reels-management/delete` | `reelId` | - |
| Like | POST | `/api/reels-management/like` | `reelId` | - |
| Unlike | DELETE | `/api/reels-management/unlike` | `reelId` | - |

---

## 🔒 Security Notes

1. **Authentication Required:** सभी endpoints के लिए valid JWT token आवश्यक है।
2. **Ownership Check:** Delete operations केवल owner द्वारा ही perform की जा सकती हैं।
3. **Privacy:** Private posts/reels केवल owner को ही दिखाई देंगे।
4. **File Size Limits:**
   - Posts: Maximum 50MB
   - Reels: Maximum 100MB

---

## 🧪 Testing Examples

### Complete Workflow - Posts

```bash
# 1. Upload a post
POST_ID=$(curl -X POST "${PROD_URL}/api/posts-management/upload" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "media=@image.jpg" \
  -F "caption=My first post!" \
  -F "isPublic=true" | jq -r '.post.id')

# 2. Retrieve the post
curl -X GET "${PROD_URL}/api/posts-management/retrieve?postId=${POST_ID}" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 3. Like the post
curl -X POST "${PROD_URL}/api/posts-management/like?postId=${POST_ID}" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 4. Unlike the post
curl -X DELETE "${PROD_URL}/api/posts-management/unlike?postId=${POST_ID}" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 5. Delete the post
curl -X DELETE "${PROD_URL}/api/posts-management/delete?postId=${POST_ID}" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Complete Workflow - Reels

```bash
# 1. Upload a reel
REEL_ID=$(curl -X POST "${PROD_URL}/api/reels-management/upload" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "video=@video.mp4" \
  -F "caption=My first reel!" \
  -F "isPublic=true" | jq -r '.reel.id')

# 2. Retrieve the reel
curl -X GET "${PROD_URL}/api/reels-management/retrieve?reelId=${REEL_ID}" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 3. Like the reel
curl -X POST "${PROD_URL}/api/reels-management/like?reelId=${REEL_ID}" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 4. Unlike the reel
curl -X DELETE "${PROD_URL}/api/reels-management/unlike?reelId=${REEL_ID}" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 5. Delete the reel
curl -X DELETE "${PROD_URL}/api/reels-management/delete?reelId=${REEL_ID}" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## ⚠️ Error Responses

### Common Error Codes

| Status Code | Error | Description |
|-------------|-------|-------------|
| 400 | Bad Request | Missing required parameters or invalid data |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | User doesn't have permission (e.g., deleting someone else's post) |
| 404 | Not Found | Post/Reel not found |
| 405 | Method Not Allowed | Wrong HTTP method used |
| 500 | Internal Server Error | Server-side error |

### Error Response Format
```json
{
  "error": "Error message here",
  "details": "Detailed error description"
}
```

---

## 📝 Notes

1. **Media Types:**
   - Posts support: `image`, `video`, or `text`
   - Reels only support: `video`

2. **File Formats:**
   - Images: .jpg, .jpeg, .png, .gif, .webp
   - Videos: .mp4, .avi, .mov, .wmv, .flv, .webm

3. **Pagination:**
   - Default `limit`: 10
   - Default `offset`: 0
   - Sort order: Newest first (by `createdAt`)

4. **View Count:**
   - Reels के retrieve होने पर view count automatically increment होता है
   - Posts में view count feature नहीं है

5. **Like/Unlike:**
   - Duplicate likes/unlikes को handle किया जाता है
   - Response में current `likesCount` return होता है

---

## 🔗 Related Documentation

- `POSTS_MANAGEMENT_API_README.md` - Posts Management API detailed documentation
- `REELS_MANAGEMENT_API_README.md` - Reels Management API detailed documentation
- `POSTS_REELS_MANAGEMENT_COMPLETE_API.md` - Complete API documentation

---

**Last Updated:** 2024-01-01
**API Version:** 1.0.0

