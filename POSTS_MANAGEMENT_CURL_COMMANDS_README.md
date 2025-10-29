# Posts Management API - CURL Commands Documentation

## Server Information
- **Base URL**: `http://103.14.120.163:8081`
- **API Endpoint**: `/api/posts-management`

## Authentication
All endpoints require JWT authentication via Bearer token in the Authorization header.

---

## 1. Upload Post

### Endpoint: `POST /api/posts-management/upload`

Upload a new post with optional media file (image/video) and caption.

#### CURL Command:
```bash
curl -X POST "http://103.14.120.163:8081/api/posts-management/upload" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "caption=This is my amazing post!" \
  -F "isPublic=true" \
  -F "media=@/path/to/your/image.jpg"
```

#### Parameters:
- `caption` (string, optional): Post caption/description
- `isPublic` (boolean, optional): Whether the post is public (default: true)
- `media` (file, optional): Image or video file to upload

#### Supported Media Types:
- **Images**: .jpg, .jpeg, .png, .gif, .webp
- **Videos**: .mp4, .avi, .mov, .wmv, .flv, .webm
- **Max File Size**: 50MB

#### Example Response:
```json
{
  "success": true,
  "message": "Post uploaded successfully",
  "post": {
    "id": "uuid-post-id",
    "userId": "user-id",
    "username": "username",
    "caption": "This is my amazing post!",
    "mediaType": "image",
    "mediaPath": "/assets/posts/uuid-post-id_timestamp.jpg",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "likesCount": 0,
    "commentsCount": 0,
    "isPublic": true
  }
}
```

---

## 2. Retrieve Posts

### Endpoint: `GET /api/posts-management/retrieve`

Retrieve posts with optional filtering and pagination.

#### CURL Commands:

##### Get All Posts (Paginated):
```bash
curl -X GET "http://103.14.120.163:8081/api/posts-management/retrieve?limit=10&offset=0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

##### Get Specific Post by ID:
```bash
curl -X GET "http://103.14.120.163:8081/api/posts-management/retrieve?postId=POST_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

##### Get Posts by User ID:
```bash
curl -X GET "http://103.14.120.163:8081/api/posts-management/retrieve?userId=USER_ID_HERE&limit=20&offset=0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Query Parameters:
- `postId` (string, optional): Get specific post by ID
- `userId` (string, optional): Filter posts by user ID
- `limit` (number, optional): Number of posts to return (default: 10)
- `offset` (number, optional): Number of posts to skip (default: 0)

#### Example Response:
```json
{
  "success": true,
  "posts": [
    {
      "id": "uuid-post-id",
      "userId": "user-id",
      "username": "username",
      "caption": "Post caption",
      "mediaType": "image",
      "mediaPath": "/assets/posts/filename.jpg",
      "createdAt": "2024-01-01T12:00:00.000Z",
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

---

## 3. Like Post

### Endpoint: `POST /api/posts-management/like`

Like a specific post.

#### CURL Command:
```bash
curl -X POST "http://103.14.120.163:8081/api/posts-management/like?postId=POST_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### Query Parameters:
- `postId` (string, required): ID of the post to like

#### Example Response:
```json
{
  "success": true,
  "message": "Post liked successfully",
  "postId": "uuid-post-id",
  "likedBy": "username",
  "likedByUserId": "user-id",
  "likesCount": 6,
  "isLiked": true
}
```

---

## 4. Unlike Post

### Endpoint: `DELETE /api/posts-management/unlike`

Remove like from a specific post.

#### CURL Command:
```bash
curl -X DELETE "http://103.14.120.163:8081/api/posts-management/unlike?postId=POST_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### Query Parameters:
- `postId` (string, required): ID of the post to unlike

#### Example Response:
```json
{
  "success": true,
  "message": "Post unliked successfully",
  "postId": "uuid-post-id",
  "unlikedBy": "username",
  "unlikedByUserId": "user-id",
  "likesCount": 5,
  "isLiked": false
}
```

---

## 5. Add Comment

### Endpoint: `POST /api/posts-management/comment`

Add a comment to a specific post.

#### CURL Command:
```bash
curl -X POST "http://103.14.120.163:8081/api/posts-management/comment?postId=POST_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "comment": "This is an amazing post! Great work!"
  }'
```

#### Query Parameters:
- `postId` (string, required): ID of the post to comment on

#### Request Body:
```json
{
  "comment": "Your comment text here"
}
```

#### Example Response:
```json
{
  "success": true,
  "message": "Comment added successfully",
  "comment": {
    "id": "comment-id",
    "userId": "user-id",
    "username": "username",
    "text": "This is an amazing post! Great work!",
    "createdAt": "2024-01-01T12:00:00.000Z"
  },
  "commentedBy": "username",
  "commentedByUserId": "user-id",
  "commentsCount": 4
}
```

---

## 6. Delete Post

### Endpoint: `DELETE /api/posts-management/delete`

Delete a post (only by the post owner).

#### CURL Command:
```bash
curl -X DELETE "http://103.14.120.163:8081/api/posts-management/delete?postId=POST_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### Query Parameters:
- `postId` (string, required): ID of the post to delete

#### Example Response:
```json
{
  "success": true,
  "message": "Post deleted successfully",
  "deletedPostId": "uuid-post-id",
  "deletedBy": "username",
  "deletedByUserId": "user-id"
}
```

---

## Error Responses

### Common Error Responses:

#### 401 Unauthorized:
```json
{
  "error": "Authorization token required"
}
```

#### 401 Invalid Token:
```json
{
  "error": "Invalid token"
}
```

#### 404 Not Found:
```json
{
  "error": "Post not found"
}
```

#### 400 Bad Request:
```json
{
  "error": "Post ID is required"
}
```

#### 403 Forbidden:
```json
{
  "error": "You can only delete your own posts"
}
```

#### 500 Server Error:
```json
{
  "error": "Failed to upload post",
  "details": "Error message details"
}
```

---

## Complete Workflow Examples

### 1. Upload a Post with Image:
```bash
# Upload post with image
curl -X POST "http://103.14.120.163:8081/api/posts-management/upload" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "caption=Beautiful sunset today! 🌅" \
  -F "isPublic=true" \
  -F "media=@sunset.jpg"
```

### 2. Get All Posts:
```bash
# Get first 10 posts
curl -X GET "http://103.14.120.163:8081/api/posts-management/retrieve?limit=10&offset=0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Like a Post:
```bash
# Like a specific post
curl -X POST "http://103.14.120.163:8081/api/posts-management/like?postId=POST_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 4. Add Comment:
```bash
# Add comment to a post
curl -X POST "http://103.14.120.163:8081/api/posts-management/comment?postId=POST_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"comment": "Amazing photo! 📸"}'
```

### 5. Delete Post:
```bash
# Delete your own post
curl -X DELETE "http://103.14.120.163:8081/api/posts-management/delete?postId=POST_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Notes

1. **Authentication**: All endpoints require a valid JWT token in the Authorization header
2. **File Upload**: Use `-F` flag for multipart/form-data when uploading files
3. **JSON Data**: Use `-d` flag with `Content-Type: application/json` for JSON requests
4. **Media Storage**: Files are stored in `/public/assets/posts/` directory
5. **Metadata**: Post metadata is stored in JSON files in `/public/assets/posts/metadata/`
6. **Privacy**: Only public posts or user's own posts are visible in retrieve requests
7. **Pagination**: Use `limit` and `offset` parameters for pagination
8. **File Size**: Maximum file size is 50MB per upload

---

## Testing Your API

Replace `YOUR_JWT_TOKEN` with a valid JWT token from your authentication system and `POST_ID_HERE` with actual post IDs when testing these endpoints.




