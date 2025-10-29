# Posts & Reels Management API - Complete Documentation

## Base URL
```
http://103.14.120.163:8081
```

## Authentication
All endpoints require JWT Bearer token authentication:
```bash
-H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

# 📝 POSTS MANAGEMENT APIs

## 1. Upload Post
**Endpoint**: `POST /api/posts-management/upload`

**Description**: Upload a new post with image, video, or text content.

### cURL Command
```bash
curl -X POST "http://103.14.120.163:8081/api/posts-management/upload" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "caption=Your post caption here" \
  -F "isPublic=true" \
  -F "media=@/path/to/your/file.jpg"
```

### Request Form Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| caption | string | No | Post caption/description |
| isPublic | boolean | No | Privacy setting (default: true) |
| media | file | No | Image or video file (max 50MB) |

### Supported File Types
- **Images**: .jpg, .jpeg, .png, .gif, .webp
- **Videos**: .mp4, .avi, .mov, .wmv, .flv, .webm

### Success Response (201)
```json
{
  "success": true,
  "message": "Post uploaded successfully",
  "post": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "USER_ID_HERE",
    "username": "johndoe",
    "caption": "Your post caption here",
    "mediaType": "image",
    "mediaPath": "/assets/posts/550e8400-e29b-41d4-a716-446655440000_1234567890.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "likesCount": 0,
    "commentsCount": 0,
    "isPublic": true
  }
}
```

### Error Responses
```json
{
  "error": "Authorization token required"
}
```

```json
{
  "error": "Failed to upload post",
  "details": "Error message here"
}
```

---

## 2. Retrieve Posts
**Endpoint**: `GET /api/posts-management/retrieve`

**Description**: Retrieve posts with pagination and filtering options.

### Get All Posts (with pagination)
```bash
curl -X GET "http://103.14.120.163:8081/api/posts-management/retrieve?limit=10&offset=0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Specific Post
```bash
curl -X GET "http://103.14.120.163:8081/api/posts-management/retrieve?postId=POST_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get User's Posts
```bash
curl -X GET "http://103.14.120.163:8081/api/posts-management/retrieve?userId=USER_ID_HERE&limit=10&offset=0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| postId | string | Get specific post by ID |
| userId | string | Filter by user ID |
| limit | number | Number of posts to return (default: 10) |
| offset | number | Pagination offset (default: 0) |

### Success Response (200)
```json
{
  "success": true,
  "posts": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "userId": "USER_ID_HERE",
      "username": "johndoe",
      "caption": "My amazing post",
      "mediaType": "image",
      "mediaPath": "/assets/posts/550e8400-e29b-41d4-a716-446655440000_1234567890.jpg",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "likesCount": 15,
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

### Single Post Response
```json
{
  "success": true,
  "post": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "USER_ID_HERE",
    "username": "johndoe",
    "caption": "My amazing post",
    "mediaType": "image",
    "mediaPath": "/assets/posts/550e8400-e29b-41d4-a716-446655440000_1234567890.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "likesCount": 15,
    "commentsCount": 3,
    "isPublic": true,
    "isLikedByUser": false
  }
}
```

### Error Response (404)
```json
{
  "error": "Post not found"
}
```

---

## 3. Like Post
**Endpoint**: `POST /api/posts-management/like?postId=POST_ID`

**Description**: Like a specific post.

### cURL Command
```bash
curl -X POST "http://103.14.120.163:8081/api/posts-management/like?postId=POST_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| postId | string | Yes | Post ID to like |

### Success Response (200)
```json
{
  "success": true,
  "message": "Post liked successfully",
  "postId": "550e8400-e29b-41d4-a716-446655440000",
  "likedBy": "johndoe",
  "likedByUserId": "USER_ID_HERE",
  "likesCount": 16,
  "isLiked": true
}
```

### Error Responses
```json
{
  "error": "Post not found"
}
```

```json
{
  "error": "Post already liked by user"
}
```

---

## 4. Unlike Post
**Endpoint**: `DELETE /api/posts-management/unlike?postId=POST_ID`

**Description**: Unlike a specific post.

### cURL Command
```bash
curl -X DELETE "http://103.14.120.163:8081/api/posts-management/unlike?postId=POST_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Post unliked successfully",
  "postId": "550e8400-e29b-41d4-a716-446655440000",
  "unlikedBy": "johndoe",
  "unlikedByUserId": "USER_ID_HERE",
  "likesCount": 15,
  "isLiked": false
}
```

### Error Response
```json
{
  "error": "Reel not liked by user"
}
```

---

## 5. Comment on Post
**Endpoint**: `POST /api/posts-management/comment?postId=POST_ID`

**Description**: Add a comment to a post.

### cURL Command
```bash
curl -X POST "http://103.14.120.163:8081/api/posts-management/comment?postId=POST_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "comment": "This is an amazing post!"
  }'
```

### Request Body
```json
{
  "comment": "This is an amazing post!"
}
```

### Success Response (201)
```json
{
  "success": true,
  "message": "Comment added successfully",
  "comment": {
    "id": "1234567890",
    "userId": "USER_ID_HERE",
    "username": "johndoe",
    "text": "This is an amazing post!",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "commentedBy": "johndoe",
  "commentedByUserId": "USER_ID_HERE",
  "commentsCount": 4
}
```

### Error Responses
```json
{
  "error": "Comment text is required"
}
```

```json
{
  "error": "Post not found"
}
```

---

## 6. Delete Post
**Endpoint**: `DELETE /api/posts-management/delete?postId=POST_ID`

**Description**: Delete a post (only by the owner).

### cURL Command
```bash
curl -X DELETE "http://103.14.120.163:8081/api/posts-management/delete?postId=POST_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Post deleted successfully",
  "deletedPostId": "550e8400-e29b-41d4-a716-446655440000",
  "deletedBy": "johndoe",
  "deletedByUserId": "USER_ID_HERE"
}
```

### Error Responses
```json
{
  "error": "Post not found"
}
```

```json
{
  "error": "You can only delete your own posts"
}
```

---

# 🎬 REELS MANAGEMENT APIs

## 1. Upload Reel
**Endpoint**: `POST /api/reels-management/upload`

**Description**: Upload a new video reel.

### cURL Command
```bash
curl -X POST "http://103.14.120.163:8081/api/reels-management/upload" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "caption=My amazing reel" \
  -F "isPublic=true" \
  -F "video=@/path/to/your/video.mp4"
```

### Request Form Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| caption | string | No | Reel caption/description |
| isPublic | boolean | No | Privacy setting (default: true) |
| video | file | Yes | Video file (max 100MB) |

### Supported Video Formats
.mp4, .avi, .mov, .wmv, .flv, .webm

### Success Response (201)
```json
{
  "success": true,
  "message": "Reel uploaded successfully",
  "reel": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "userId": "USER_ID_HERE",
    "username": "johndoe",
    "caption": "My amazing reel",
    "mediaType": "video",
    "mediaPath": "/assets/reels/660e8400-e29b-41d4-a716-446655440000_1234567890.mp4",
    "thumbnailPath": "/assets/reels/660e8400-e29b-41d4-a716-446655440000_1234567890_thumb.jpg",
    "duration": 30,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "likesCount": 0,
    "commentsCount": 0,
    "viewsCount": 0,
    "isPublic": true
  }
}
```

### Error Response
```json
{
  "error": "Video file is required for reels"
}
```

---

## 2. Retrieve Reels
**Endpoint**: `GET /api/reels-management/retrieve`

**Description**: Retrieve reels with pagination and filtering options.

### Get All Reels (with pagination)
```bash
curl -X GET "http://103.14.120.163:8081/api/reels-management/retrieve?limit=10&offset=0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Specific Reel
```bash
curl -X GET "http://103.14.120.163:8081/api/reels-management/retrieve?reelId=REEL_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get User's Reels
```bash
curl -X GET "http://103.14.120.163:8081/api/reels-management/retrieve?userId=USER_ID_HERE&limit=10&offset=0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| reelId | string | Get specific reel by ID |
| userId | string | Filter by user ID |
| limit | number | Number of reels to return (default: 10) |
| offset | number | Pagination offset (default: 0) |

### Success Response (200)
```json
{
  "success": true,
  "reels": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "userId": "USER_ID_HERE",
      "username": "johndoe",
      "caption": "My amazing reel",
      "mediaType": "video",
      "mediaPath": "/assets/reels/660e8400-e29b-41d4-a716-446655440000_1234567890.mp4",
      "thumbnailPath": "/assets/reels/660e8400-e29b-41d4-a716-446655440000_1234567890_thumb.jpg",
      "duration": 30,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "likesCount": 50,
      "commentsCount": 10,
      "viewsCount": 500,
      "isPublic": true,
      "isLikedByUser": false
    }
  ],
  "total": 100,
  "limit": 10,
  "offset": 0
}
```

### Single Reel Response (with view increment)
```json
{
  "success": true,
  "reel": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "userId": "USER_ID_HERE",
    "username": "johndoe",
    "caption": "My amazing reel",
    "mediaType": "video",
    "mediaPath": "/assets/reels/660e8400-e29b-41d4-a716-446655440000_1234567890.mp4",
    "thumbnailPath": "/assets/reels/660e8400-e29b-41d4-a716-446655440000_1234567890_thumb.jpg",
    "duration": 30,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "likesCount": 50,
    "commentsCount": 10,
    "viewsCount": 501,
    "isPublic": true,
    "isLikedByUser": false
  }
}
```

**Note**: When retrieving a specific reel by ID, the view count is automatically incremented.

### Error Response (404)
```json
{
  "error": "Reel not found"
}
```

---

## 3. Like Reel
**Endpoint**: `POST /api/reels-management/like?reelId=REEL_ID`

**Description**: Like a specific reel.

### cURL Command
```bash
curl -X POST "http://103.14.120.163:8081/api/reels-management/like?reelId=REEL_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| reelId | string | Yes | Reel ID to like |

### Success Response (200)
```json
{
  "success": true,
  "message": "Reel liked successfully",
  "reelId": "660e8400-e29b-41d4-a716-446655440000",
  "likedBy": "johndoe",
  "likedByUserId": "USER_ID_HERE",
  "likesCount": 51,
  "isLiked": true
}
```

### Error Responses
```json
{
  "error": "Reel not found"
}
```

```json
{
  "error": "Reel already liked by user"
}
```

---

## 4. Unlike Reel
**Endpoint**: `DELETE /api/reels-management/unlike?reelId=REEL_ID`

**Description**: Unlike a specific reel.

### cURL Command
```bash
curl -X DELETE "http://103.14.120.163:8081/api/reels-management/unlike?reelId=REEL_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Reel unliked successfully",
  "reelId": "660e8400-e29b-41d4-a716-446655440000",
  "unlikedBy": "johndoe",
  "unlikedByUserId": "USER_ID_HERE",
  "likesCount": 50,
  "isLiked": false
}
```

### Error Response
```json
{
  "error": "Reel not liked by user"
}
```

---

## 5. Comment on Reel
**Endpoint**: `POST /api/reels-management/comment?reelId=REEL_ID`

**Description**: Add a comment to a reel.

### cURL Command
```bash
curl -X POST "http://103.14.120.163:8081/api/reels-management/comment?reelId=REEL_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "comment": "This reel is awesome!"
  }'
```

### Request Body
```json
{
  "comment": "This reel is awesome!"
}
```

### Success Response (201)
```json
{
  "success": true,
  "message": "Comment added successfully",
  "comment": {
    "id": "1234567890",
    "userId": "USER_ID_HERE",
    "username": "johndoe",
    "text": "This reel is awesome!",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "commentedBy": "johndoe",
  "commentedByUserId": "USER_ID_HERE",
  "commentsCount": 11
}
```

### Error Responses
```json
{
  "error": "Comment text is required"
}
```

```json
{
  "error": "Reel not found"
}
```

---

## 6. Delete Reel
**Endpoint**: `DELETE /api/reels-management/delete?reelId=REEL_ID`

**Description**: Delete a reel (only by the owner).

### cURL Command
```bash
curl -X DELETE "http://103.14.120.163:8081/api/reels-management/delete?reelId=REEL_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Reel deleted successfully",
  "deletedReelId": "660e8400-e29b-41d4-a716-446655440000",
  "deletedBy": "johndoe",
  "deletedByUserId": "USER_ID_HERE"
}
```

### Error Responses
```json
{
  "error": "Reel not found"
}
```

```json
{
  "error": "You can only delete your own reels"
}
```

---

# 📊 Complete API Summary

## Posts Management Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/posts-management/upload` | Upload a new post |
| GET | `/api/posts-management/retrieve` | Retrieve posts |
| POST | `/api/posts-management/like` | Like a post |
| DELETE | `/api/posts-management/unlike` | Unlike a post |
| POST | `/api/posts-management/comment` | Comment on a post |
| DELETE | `/api/posts-management/delete` | Delete a post |

## Reels Management Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reels-management/upload` | Upload a new reel |
| GET | `/api/reels-management/retrieve` | Retrieve reels |
| POST | `/api/reels-management/like` | Like a reel |
| DELETE | `/api/reels-management/unlike` | Unlike a reel |
| POST | `/api/reels-management/comment` | Comment on a reel |
| DELETE | `/api/reels-management/delete` | Delete a reel |

---

# 🔧 Common Error Responses

## 401 Unauthorized
```json
{
  "error": "Authorization token required"
}
```

## 401 Invalid Token
```json
{
  "error": "Invalid token"
}
```

## 404 Not Found
```json
{
  "error": "User not found"
}
```

## 405 Method Not Allowed
```json
{
  "error": "Method not allowed"
}
```

## 500 Internal Server Error
```json
{
  "error": "Failed to [operation]",
  "details": "Error message here"
}
```

---

# 📝 Notes

1. **All endpoints require JWT authentication** - Use Bearer token in Authorization header
2. **File uploads use multipart/form-data** - Use `-F` flag in curl for upload endpoints
3. **Max file sizes**: Posts (50MB), Reels (100MB)
4. **Ownership validation**: Users can only delete their own posts/reels
5. **Automatic view tracking**: View count increments when retrieving a specific reel
6. **Pagination**: Use `limit` and `offset` query parameters for paginated results
7. **Privacy**: Set `isPublic` flag during upload to control visibility

---

# 🚀 Quick Integration Examples

## Upload and Like a Post
```bash
# 1. Upload post
curl -X POST "http://103.14.120.163:8081/api/posts-management/upload" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "caption=My first post" \
  -F "media=@image.jpg"

# Response: { "post": { "id": "POST_ID" } }

# 2. Like the post
curl -X POST "http://103.14.120.163:8081/api/posts-management/like?postId=POST_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Upload and Get Reels
```bash
# 1. Upload reel
curl -X POST "http://103.14.120.163:8081/api/reels-management/upload" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "caption=My amazing reel" \
  -F "video=@reel.mp4"

# Response: { "reel": { "id": "REEL_ID" } }

# 2. Get all reels
curl -X GET "http://103.14.120.163:8081/api/reels-management/retrieve?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

**Server**: http://103.14.120.163:8081
**Last Updated**: 2024

