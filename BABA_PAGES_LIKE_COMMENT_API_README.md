# Baba Pages Like & Comment API Documentation

This document describes the like and comment functionality for Baba Pages posts, videos (reels), and stories.

## Table of Contents
- [Overview](#overview)
- [Models Updated](#models-updated)
- [Like API](#like-api)
- [Comment API](#comment-api)
- [Usage Examples](#usage-examples)
- [Error Handling](#error-handling)

## Overview

The like and comment system allows users to:
- Like/unlike posts, videos, and stories
- Add comments to posts, videos, and stories
- Update their own comments
- Delete their own comments
- Retrieve comments with pagination
- Check like status

## Models Updated

### BabaPost, BabaVideo, BabaStory
All three models now include:
```typescript
likes: Types.ObjectId[];           // Array of user IDs who liked
likesCount: number;                // Count of likes
comments: IComment[];              // Array of comments
commentsCount: number;             // Count of comments
```

### Comment Interface
```typescript
interface IComment {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Like API

### Like/Unlike Content
**Endpoint:** `POST /api/baba-pages/[id]/like`

**Request Body:**
```json
{
  "contentId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "contentType": "post", // "post", "video", or "story"
  "userId": "64f1a2b3c4d5e6f7g8h9i0j2",
  "action": "like" // "like" or "unlike"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Content liked successfully",
  "data": {
    "contentId": "64f1a2b3c4d5e6f7g8h9i0j1",
    "contentType": "post",
    "isLiked": true,
    "likesCount": 15
  }
}
```

### Get Like Status
**Endpoint:** `GET /api/baba-pages/[id]/like?contentId=...&contentType=...&userId=...`

**Response:**
```json
{
  "success": true,
  "data": {
    "contentId": "64f1a2b3c4d5e6f7g8h9i0j1",
    "contentType": "post",
    "isLiked": true,
    "likesCount": 15
  }
}
```

## Comment API

### Create Comment
**Endpoint:** `POST /api/baba-pages/[id]/comments`

**Request Body:**
```json
{
  "contentId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "contentType": "post", // "post", "video", or "story"
  "userId": "64f1a2b3c4d5e6f7g8h9i0j2",
  "content": "Great post! Very inspiring."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "comment": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j3",
      "userId": "64f1a2b3c4d5e6f7g8h9i0j2",
      "content": "Great post! Very inspiring.",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    "commentsCount": 8
  }
}
```

### Get Comments
**Endpoint:** `GET /api/baba-pages/[id]/comments?contentId=...&contentType=...&page=1&limit=10`

**Response:**
```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j3",
        "userId": {
          "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
          "name": "John Doe",
          "email": "john@example.com",
          "avatar": "https://example.com/avatar.jpg"
        },
        "content": "Great post! Very inspiring.",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalComments": 15,
      "commentsPerPage": 10
    }
  }
}
```

### Update Comment
**Endpoint:** `PUT /api/baba-pages/[id]/comments/[commentId]`

**Request Body:**
```json
{
  "contentId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "contentType": "post",
  "userId": "64f1a2b3c4d5e6f7g8h9i0j2",
  "content": "Updated comment content"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Comment updated successfully",
  "data": {
    "comment": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j3",
      "userId": "64f1a2b3c4d5e6f7g8h9i0j2",
      "content": "Updated comment content",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T11:00:00.000Z"
    }
  }
}
```

### Delete Comment
**Endpoint:** `DELETE /api/baba-pages/[id]/comments/[commentId]?contentId=...&contentType=...&userId=...`

**Response:**
```json
{
  "success": true,
  "message": "Comment deleted successfully",
  "data": {
    "commentsCount": 7
  }
}
```

### Get Specific Comment
**Endpoint:** `GET /api/baba-pages/[id]/comments/[commentId]?contentId=...&contentType=...`

**Response:**
```json
{
  "success": true,
  "data": {
    "comment": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j3",
      "userId": {
        "_id": "64f1a2b3c4d5e6f7g8h9i0j2",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": "https://example.com/avatar.jpg"
      },
      "content": "Great post! Very inspiring.",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

## Usage Examples

### Like a Post
```javascript
const likePost = async (postId, userId) => {
  const response = await fetch('/api/baba-pages/64f1a2b3c4d5e6f7g8h9i0j1/like', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contentId: postId,
      contentType: 'post',
      userId: userId,
      action: 'like'
    })
  });
  
  return await response.json();
};
```

### Add Comment to Video
```javascript
const addComment = async (videoId, userId, content) => {
  const response = await fetch('/api/baba-pages/64f1a2b3c4d5e6f7g8h9i0j1/comments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contentId: videoId,
      contentType: 'video',
      userId: userId,
      content: content
    })
  });
  
  return await response.json();
};
```

### Get Comments with Pagination
```javascript
const getComments = async (contentId, contentType, page = 1, limit = 10) => {
  const response = await fetch(
    `/api/baba-pages/64f1a2b3c4d5e6f7g8h9i0j1/comments?contentId=${contentId}&contentType=${contentType}&page=${page}&limit=${limit}`
  );
  
  return await response.json();
};
```

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "contentId, contentType, userId, and action are required"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Content not found"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "You can only update your own comments"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

### Validation Rules

1. **Content Types:** Must be one of "post", "video", or "story"
2. **Actions:** Must be "like" or "unlike"
3. **Comment Content:** 
   - Cannot be empty
   - Maximum 500 characters
4. **ObjectIds:** Must be valid MongoDB ObjectIds
5. **User Permissions:** Users can only update/delete their own comments

## Database Indexes

The following indexes are automatically created for optimal performance:
- `{ babaPageId: 1, createdAt: -1 }` on all content models
- `{ likes: 1 }` for efficient like queries
- `{ comments.userId: 1 }` for efficient comment queries

## Rate Limiting

Consider implementing rate limiting for:
- Like/unlike actions (to prevent spam)
- Comment creation (to prevent spam)
- Comment updates/deletes (to prevent abuse)

## Security Considerations

1. **Authentication:** Ensure user authentication before allowing like/comment actions
2. **Authorization:** Users can only modify their own comments
3. **Input Validation:** All inputs are validated and sanitized
4. **Content Length:** Comments are limited to 500 characters
5. **ObjectId Validation:** All ObjectIds are validated before database queries
