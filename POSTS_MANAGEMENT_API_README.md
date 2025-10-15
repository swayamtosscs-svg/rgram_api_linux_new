# Posts Management API Documentation

## Overview
This API provides comprehensive post management functionality with local storage in the `public/assets/posts` folder. Users can upload, retrieve, delete posts, and interact with them through likes and comments.

## Base URL
```
http://localhost:3000/api/posts-management
```

## Authentication
All endpoints require JWT authentication via the `Authorization` header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Upload Post
**POST** `/upload`

Upload a new post with optional media file.

#### Request Body (multipart/form-data)
- `caption` (string, optional): Post caption/text
- `media` (file, optional): Image or video file (max 50MB)
- `isPublic` (boolean, optional): Whether post is public (default: true)

#### Supported Media Types
- **Images**: .jpg, .jpeg, .png, .gif, .webp
- **Videos**: .mp4, .avi, .mov, .wmv, .flv, .webm

#### Response
```json
{
  "success": true,
  "message": "Post uploaded successfully",
  "post": {
    "id": "uuid",
    "userId": "user-id",
    "username": "username",
    "caption": "post caption",
    "mediaType": "image|video|text",
    "mediaPath": "/assets/posts/filename.ext",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "likesCount": 0,
    "commentsCount": 0,
    "isPublic": true
  }
}
```

### 2. Retrieve Posts
**GET** `/retrieve`

Retrieve posts with optional filtering and pagination.

#### Query Parameters
- `postId` (string, optional): Get specific post by ID
- `userId` (string, optional): Get posts by specific user
- `limit` (number, optional): Number of posts per page (default: 10)
- `offset` (number, optional): Number of posts to skip (default: 0)

#### Response
```json
{
  "success": true,
  "posts": [
    {
      "id": "uuid",
      "userId": "user-id",
      "username": "username",
      "caption": "post caption",
      "mediaType": "image|video|text",
      "mediaPath": "/assets/posts/filename.ext",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "likesCount": 5,
      "commentsCount": 3,
      "isPublic": true,
      "isLikedByUser": false
    }
  ],
  "total": 25,
  "limit": 10,
  "offset": 0
}
```

### 3. Delete Post
**DELETE** `/delete?postId=<post-id>`

Delete a post (only by post owner).

#### Response
```json
{
  "success": true,
  "message": "Post deleted successfully",
  "deletedPostId": "uuid"
}
```

### 4. Like Post
**POST** `/like?postId=<post-id>`

Like a post.

#### Response
```json
{
  "success": true,
  "message": "Post liked successfully",
  "postId": "uuid",
  "likesCount": 6,
  "isLiked": true
}
```

### 5. Unlike Post
**DELETE** `/unlike?postId=<post-id>`

Unlike a post.

#### Response
```json
{
  "success": true,
  "message": "Post unliked successfully",
  "postId": "uuid",
  "likesCount": 5,
  "isLiked": false
}
```

### 6. Add Comment
**POST** `/comment?postId=<post-id>`

Add a comment to a post.

#### Request Body (JSON)
```json
{
  "comment": "This is my comment"
}
```

#### Response
```json
{
  "success": true,
  "message": "Comment added successfully",
  "comment": {
    "id": "timestamp",
    "userId": "user-id",
    "username": "username",
    "text": "This is my comment",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "commentsCount": 4
}
```

## File Storage Structure

```
public/assets/posts/
├── metadata/           # Post metadata JSON files
│   ├── post-id-1.json
│   ├── post-id-2.json
│   └── ...
├── index.json         # Index of all post IDs
├── post-id-1_timestamp.jpg
├── post-id-2_timestamp.mp4
└── ...
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

### Common HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `405`: Method Not Allowed
- `500`: Internal Server Error

## Usage Examples

### Upload a Text Post
```bash
curl -X POST http://localhost:3000/api/posts-management/upload \
  -H "Authorization: Bearer your-jwt-token" \
  -F "caption=Hello World!" \
  -F "isPublic=true"
```

### Upload Post with Image
```bash
curl -X POST http://localhost:3000/api/posts-management/upload \
  -H "Authorization: Bearer your-jwt-token" \
  -F "caption=Check out this image!" \
  -F "media=@/path/to/image.jpg" \
  -F "isPublic=true"
```

### Get All Posts
```bash
curl -X GET "http://localhost:3000/api/posts-management/retrieve?limit=20&offset=0" \
  -H "Authorization: Bearer your-jwt-token"
```

### Get User's Posts
```bash
curl -X GET "http://localhost:3000/api/posts-management/retrieve?userId=user-id&limit=10" \
  -H "Authorization: Bearer your-jwt-token"
```

### Like a Post
```bash
curl -X POST "http://localhost:3000/api/posts-management/like?postId=post-id" \
  -H "Authorization: Bearer your-jwt-token"
```

### Add Comment
```bash
curl -X POST "http://localhost:3000/api/posts-management/comment?postId=post-id" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{"comment": "Great post!"}'
```

### Delete Post
```bash
curl -X DELETE "http://localhost:3000/api/posts-management/delete?postId=post-id" \
  -H "Authorization: Bearer your-jwt-token"
```

## Notes

1. **File Size Limit**: Maximum file size is 50MB
2. **Privacy**: Users can only delete their own posts
3. **Storage**: All files are stored locally in the `public/assets/posts` directory
4. **Metadata**: Post metadata is stored as JSON files for easy management
5. **Indexing**: A central index file tracks all post IDs for efficient retrieval
6. **Authentication**: All operations require valid JWT tokens
7. **Media Types**: Supports images and videos with automatic type detection
