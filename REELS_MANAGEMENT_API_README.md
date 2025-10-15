# Reels Management API Documentation

## Overview
This API provides comprehensive reel management functionality with local storage in the `public/assets/reels` folder. Users can upload, retrieve, delete reels, and interact with them through likes and comments.

## Base URL
```
http://localhost:3000/api/reels-management
```

## Authentication
All endpoints require JWT authentication via the `Authorization` header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Upload Reel
**POST** `/upload`

Upload a new reel with video file.

#### Request Body (multipart/form-data)
- `caption` (string, optional): Reel caption/text
- `video` (file, required): Video file (max 100MB)
- `isPublic` (boolean, optional): Whether reel is public (default: true)

#### Supported Video Types
- **Videos**: .mp4, .avi, .mov, .wmv, .flv, .webm, .mkv, .3gp

#### Response
```json
{
  "success": true,
  "message": "Reel uploaded successfully",
  "reel": {
    "id": "uuid",
    "userId": "user-id",
    "username": "username",
    "caption": "reel caption",
    "mediaType": "video",
    "mediaPath": "/assets/reels/filename.mp4",
    "thumbnailPath": "/assets/reels/filename_thumb.jpg",
    "duration": 0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "likesCount": 0,
    "commentsCount": 0,
    "viewsCount": 0,
    "isPublic": true
  }
}
```

### 2. Retrieve Reels
**GET** `/retrieve`

Retrieve reels with optional filtering and pagination.

#### Query Parameters
- `reelId` (string, optional): Get specific reel by ID
- `userId` (string, optional): Get reels by specific user
- `limit` (number, optional): Number of reels per page (default: 10)
- `offset` (number, optional): Number of reels to skip (default: 0)

#### Response
```json
{
  "success": true,
  "reels": [
    {
      "id": "uuid",
      "userId": "user-id",
      "username": "username",
      "caption": "reel caption",
      "mediaType": "video",
      "mediaPath": "/assets/reels/filename.mp4",
      "thumbnailPath": "/assets/reels/filename_thumb.jpg",
      "duration": 30,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "likesCount": 5,
      "commentsCount": 3,
      "viewsCount": 100,
      "isPublic": true,
      "isLikedByUser": false
    }
  ],
  "total": 25,
  "limit": 10,
  "offset": 0
}
```

### 3. Delete Reel
**DELETE** `/delete?reelId=<reel-id>`

Delete a reel (only by reel owner).

#### Response
```json
{
  "success": true,
  "message": "Reel deleted successfully",
  "deletedReelId": "uuid",
  "deletedBy": "username",
  "deletedByUserId": "user-id"
}
```

### 4. Like Reel
**POST** `/like?reelId=<reel-id>`

Like a reel.

#### Response
```json
{
  "success": true,
  "message": "Reel liked successfully",
  "reelId": "uuid",
  "likedBy": "username",
  "likedByUserId": "user-id",
  "likesCount": 6,
  "isLiked": true
}
```

### 5. Unlike Reel
**DELETE** `/unlike?reelId=<reel-id>`

Unlike a reel.

#### Response
```json
{
  "success": true,
  "message": "Reel unliked successfully",
  "reelId": "uuid",
  "unlikedBy": "username",
  "unlikedByUserId": "user-id",
  "likesCount": 5,
  "isLiked": false
}
```

### 6. Add Comment to Reel
**POST** `/comment?reelId=<reel-id>`

Add a comment to a reel.

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
  "commentedBy": "username",
  "commentedByUserId": "user-id",
  "commentsCount": 4
}
```

## File Storage Structure

```
public/assets/reels/
├── metadata/           # Reel metadata JSON files
│   ├── reel-id-1.json
│   ├── reel-id-2.json
│   └── ...
├── index.json         # Index of all reel IDs
├── reel-id-1_timestamp.mp4
├── reel-id-1_timestamp_thumb.jpg
├── reel-id-2_timestamp.mp4
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

### Upload a Reel
```bash
curl -X POST http://localhost:3000/api/reels-management/upload \
  -H "Authorization: Bearer your-jwt-token" \
  -F "caption=Check out this amazing reel!" \
  -F "video=@/path/to/video.mp4" \
  -F "isPublic=true"
```

### Get All Reels
```bash
curl -X GET "http://localhost:3000/api/reels-management/retrieve?limit=20&offset=0" \
  -H "Authorization: Bearer your-jwt-token"
```

### Get User's Reels
```bash
curl -X GET "http://localhost:3000/api/reels-management/retrieve?userId=user-id&limit=10" \
  -H "Authorization: Bearer your-jwt-token"
```

### Like a Reel
```bash
curl -X POST "http://localhost:3000/api/reels-management/like?reelId=reel-id" \
  -H "Authorization: Bearer your-jwt-token"
```

### Add Comment to Reel
```bash
curl -X POST "http://localhost:3000/api/reels-management/comment?reelId=reel-id" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{"comment": "Great reel!"}'
```

### Delete Reel
```bash
curl -X DELETE "http://localhost:3000/api/reels-management/delete?reelId=reel-id" \
  -H "Authorization: Bearer your-jwt-token"
```

## Notes

1. **File Size Limit**: Maximum file size is 100MB for videos
2. **Privacy**: Users can only delete their own reels
3. **Storage**: All files are stored locally in the `public/assets/reels` directory
4. **Metadata**: Reel metadata is stored as JSON files for easy management
5. **Indexing**: A central index file tracks all reel IDs for efficient retrieval
6. **Authentication**: All operations require valid JWT tokens
7. **Video Types**: Supports various video formats with automatic type detection
8. **Views**: View count is automatically incremented when retrieving specific reels
9. **Thumbnails**: Thumbnail paths are generated for each reel (implementation needed)
10. **Duration**: Video duration tracking (implementation needed)
