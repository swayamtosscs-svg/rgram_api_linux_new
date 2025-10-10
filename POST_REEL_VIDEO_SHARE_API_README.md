# Post Share API Documentation

## Overview
This API provides functionality to share all types of posts including text posts, image posts, and video/reel posts. The API includes four main endpoints for different sharing operations.

## Endpoints

### 1. Share/Unshare Any Post
**Endpoint:** `POST /api/posts/share`

**Description:** Share or unshare any post (text, image, video, or reel). This endpoint toggles the share status for a user.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "postId": "string (required)",
  "shareType": "string (optional, default: 'general')"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Post shared successfully",
  "data": {
    "post": {
      "_id": "post_id",
      "content": "post content",
      "title": "post title",
      "description": "post description",
      "type": "reel",
      "category": "entertainment",
      "religion": "hindu",
      "author": {
        "username": "author_username",
        "fullName": "Author Name",
        "avatar": "avatar_url",
        "religion": "hindu",
        "isPrivate": false
      },
      "videos": ["video_url_1", "video_url_2"],
      "images": ["image_url_1"],
      "duration": 60,
      "shares": ["user_id_1", "user_id_2"],
      "shareCount": 2,
      "likes": ["user_id_3"],
      "likeCount": 1,
      "comments": [],
      "commentCount": 0,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "isActive": true
    },
    "action": "shared",
    "isShared": true,
    "shareCount": 2,
    "shareType": "general",
    "videoId": "video_url_1",
    "videoIds": ["video_url_1", "video_url_2"]
  }
}
```

**Error Responses:**
- `400`: Invalid request (missing postId, no shareable content)
- `401`: Authentication required or invalid token
- `404`: Post or user not found
- `405`: Method not allowed
- `500`: Internal server error

---

### 2. Get Shareable Posts
**Endpoint:** `GET /api/posts/shareable`

**Description:** Retrieve a paginated list of all shareable posts (text, image, video, reel) with full post details.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `type` (optional): Post type filter - 'reel', 'video', or 'all' (default: 'all')
- `category` (optional): Category filter - 'general', 'entertainment', etc. or 'all' (default: 'all')
- `religion` (optional): Religion filter or 'all' (default: 'all')
- `userId` (optional): Filter by specific user or 'all' (default: 'all')
- `sortBy` (optional): Sort field (default: 'createdAt')
- `sortOrder` (optional): Sort order - 'asc' or 'desc' (default: 'desc')

**Example Request:**
```
GET /api/posts/shareable?page=1&limit=10&type=reel&category=entertainment&religion=hindu
```

**Response:**
```json
{
  "success": true,
  "message": "Shareable reel video posts retrieved successfully",
  "data": {
    "posts": [
      {
        "_id": "post_id",
        "content": "post content",
        "title": "post title",
        "description": "post description",
        "type": "reel",
        "category": "entertainment",
        "religion": "hindu",
        "author": {
          "username": "author_username",
          "fullName": "Author Name",
          "avatar": "avatar_url",
          "religion": "hindu",
          "isPrivate": false
        },
        "videos": ["video_url_1", "video_url_2"],
        "images": ["image_url_1"],
        "duration": 60,
        "videoIds": ["video_url_1", "video_url_2"],
        "primaryVideoId": "video_url_1",
        "shareCount": 5,
        "likeCount": 10,
        "commentCount": 3,
        "isSharedByUser": false,
        "isLikedByUser": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "shareable": true
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCount": 100,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "filters": {
      "type": "reel",
      "category": "entertainment",
      "religion": "hindu",
      "userId": "all",
      "sortBy": "createdAt",
      "sortOrder": "desc"
    },
    "userSharedPostIds": ["post_id_1", "post_id_2"],
    "totalShareablePosts": 100
  }
}
```

---

### 3. Get Shareable Content
**Endpoint:** `GET /api/posts/shareable-content`

**Description:** Retrieve a lightweight list of all shareable content (text, image, video) with content type filtering.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Query Parameters:**
- `limit` (optional): Maximum items to return (default: 50, max: 100)
- `type` (optional): Post type - 'post', 'reel', 'video' or 'all' (default: 'all')
- `category` (optional): Category filter or 'all' (default: 'all')
- `religion` (optional): Religion filter or 'all' (default: 'all')
- `contentType` (optional): Content type filter - 'text', 'image', 'video', or 'all' (default: 'all')

**Example Request:**
```
GET /api/posts/shareable-content?limit=20&contentType=image&category=entertainment&religion=hindu
```

**Response:**
```json
{
  "success": true,
  "message": "Shareable content retrieved successfully",
  "data": {
    "shareableContent": [
      {
        "postId": "post_id",
        "content": "Amazing post content!",
        "title": "post title",
        "description": "post description",
        "type": "post",
        "category": "entertainment",
        "religion": "hindu",
        "author": {
          "username": "author_username",
          "fullName": "Author Name",
          "avatar": "avatar_url"
        },
        "imageIds": ["image_url_1", "image_url_2"],
        "primaryImageId": "image_url_1",
        "videoIds": [],
        "primaryVideoId": null,
        "hasContent": true,
        "hasImages": true,
        "hasVideos": false,
        "contentType": "image",
        "shareCount": 5,
        "likeCount": 10,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "shareable": true
      }
    ],
    "totalCount": 100,
    "returnedCount": 20,
    "filters": {
      "type": "all",
      "category": "entertainment",
      "religion": "hindu",
      "contentType": "image",
      "limit": 20
    }
  }
}
```

---

### 4. Get Reel Video IDs
**Endpoint:** `GET /api/posts/reel-video-ids`

**Description:** Retrieve a lightweight list of reel video IDs and basic metadata for sharing purposes.

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Query Parameters:**
- `limit` (optional): Maximum items to return (default: 50, max: 100)
- `type` (optional): Post type - 'reel', 'video' (default: 'reel')
- `category` (optional): Category filter or 'all' (default: 'all')
- `religion` (optional): Religion filter or 'all' (default: 'all')

**Example Request:**
```
GET /api/posts/reel-video-ids?limit=20&type=reel&category=entertainment&religion=hindu
```

**Response:**
```json
{
  "success": true,
  "message": "Reel video IDs retrieved successfully",
  "data": {
    "videoData": [
      {
        "postId": "post_id",
        "videoIds": ["video_url_1", "video_url_2"],
        "primaryVideoId": "video_url_1",
        "title": "post title",
        "description": "post description",
        "type": "reel",
        "category": "entertainment",
        "religion": "hindu",
        "author": {
          "username": "author_username",
          "fullName": "Author Name",
          "avatar": "avatar_url"
        },
        "shareCount": 5,
        "likeCount": 10,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "shareable": true
      }
    ],
    "totalCount": 100,
    "returnedCount": 20,
    "filters": {
      "type": "reel",
      "category": "entertainment",
      "religion": "hindu",
      "limit": 20
    }
  }
}
```

## Authentication
All endpoints require JWT authentication via the `Authorization` header with Bearer token format.

## Error Handling
All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication required/invalid)
- `404`: Not Found (post/user not found)
- `405`: Method Not Allowed
- `500`: Internal Server Error

## Usage Examples

### Share a Reel Video
```javascript
const sharePost = async (postId) => {
  const response = await fetch('/api/posts/share', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      postId: postId,
      shareType: 'general'
    })
  });
  
  const data = await response.json();
  return data;
};
```

### Get Shareable Posts
```javascript
const getShareablePosts = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/posts/shareable?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  return data;
};
```

### Get Reel Video IDs
```javascript
const getReelVideoIds = async (limit = 20) => {
  const response = await fetch(`/api/posts/reel-video-ids?limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  return data;
};
```

## Notes
- Only posts with `type: 'reel'` or `type: 'video'` can be shared
- Posts must have video content to be shareable
- Share count is automatically updated when posts are shared/unshared
- All endpoints support CORS for cross-origin requests
- Pagination is available for the shareable posts endpoint
- User's share status is included in responses where applicable
