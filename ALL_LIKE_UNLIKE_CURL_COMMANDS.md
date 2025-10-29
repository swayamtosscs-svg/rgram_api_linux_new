# All Like and Unlike API cURL Commands

## Overview
This document provides comprehensive cURL commands for all like and unlike APIs available in the Rgram project.

## Authentication
All API calls require Bearer token authentication:
```bash
-H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## Base URL
```
http://103.14.120.163:8081
```

---

## 1. UNIVERSAL LIKE API (Recommended)
**Endpoint**: `POST /api/likes/like`

**Description**: Universal API that can like posts, videos, reels, stories, and user assets.

### 1.1 Like a Post
```bash
curl -X POST "http://103.14.120.163:8081/api/likes/like" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "post",
    "contentId": "POST_ID_HERE"
  }'
```

### 1.2 Like a Video
```bash
curl -X POST "http://103.14.120.163:8081/api/likes/like" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "video",
    "contentId": "VIDEO_ID_HERE"
  }'
```

### 1.3 Like a Reel
```bash
curl -X POST "http://103.14.120.163:8081/api/likes/like" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "reel",
    "contentId": "REEL_ID_HERE"
  }'
```

### 1.4 Like a Story
```bash
curl -X POST "http://103.14.120.163:8081/api/likes/like" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "story",
    "contentId": "STORY_ID_HERE"
  }'
```

### 1.5 Like User Asset (Media Files)
```bash
curl -X POST "http://103.14.120.163:8081/api/likes/like" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "userAsset",
    "contentId": "6901a295c4b01d383103026d"
  }'
```

**Example Response:**
```json
{
  "success": true,
  "message": "Content liked successfully",
  "data": {
    "likeId": "like_id_here",
    "contentType": "userAsset",
    "contentId": "6901a295c4b01d383103026d",
    "userId": "USER_ID_HERE",
    "likesCount": 1
  }
}
```

---

## 2. UNIVERSAL UNLIKE API (Recommended)
**Endpoint**: `DELETE /api/likes/unlike`

**Description**: Universal API that can unlike posts, videos, reels, stories, and user assets.

### 2.1 Unlike a Post
```bash
curl -X DELETE "http://103.14.120.163:8081/api/likes/unlike" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "post",
    "contentId": "POST_ID_HERE"
  }'
```

### 2.2 Unlike a Video
```bash
curl -X DELETE "http://103.14.120.163:8081/api/likes/unlike" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "video",
    "contentId": "VIDEO_ID_HERE"
  }'
```

### 2.3 Unlike a Reel
```bash
curl -X DELETE "http://103.14.120.163:8081/api/likes/unlike" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "reel",
    "contentId": "REEL_ID_HERE"
  }'
```

### 2.4 Unlike a Story
```bash
curl -X DELETE "http://103.14.120.163:8081/api/likes/unlike" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "story",
    "contentId": "STORY_ID_HERE"
  }'
```

### 2.5 Unlike User Asset (Media Files)
```bash
curl -X DELETE "http://103.14.120.163:8081/api/likes/unlike" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "userAsset",
    "contentId": "6901a295c4b01d383103026d"
  }'
```

**Example Response:**
```json
{
  "success": true,
  "message": "Content unliked successfully",
  "data": {
    "contentType": "userAsset",
    "contentId": "6901a295c4b01d383103026d",
    "userId": "USER_ID_HERE",
    "likesCount": 0
  }
}
```

---

## 3. POSTS MANAGEMENT LIKE API
**Endpoint**: `POST /api/posts-management/like?postId=POST_ID`

**Description**: Like API specifically for posts management.

```bash
curl -X POST "http://103.14.120.163:8081/api/posts-management/like?postId=POST_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Example Response:**
```json
{
  "success": true,
  "message": "Post liked successfully",
  "postId": "POST_ID_HERE",
  "likedBy": "username",
  "likedByUserId": "USER_ID_HERE",
  "likesCount": 5,
  "isLiked": true
}
```

---

## 4. POSTS MANAGEMENT UNLIKE API
**Endpoint**: `DELETE /api/posts-management/unlike?postId=POST_ID`

**Description**: Unlike API specifically for posts management.

```bash
curl -X DELETE "http://103.14.120.163:8081/api/posts-management/unlike?postId=POST_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Example Response:**
```json
{
  "success": true,
  "message": "Post unliked successfully",
  "postId": "POST_ID_HERE",
  "unlikedBy": "username",
  "unlikedByUserId": "USER_ID_HERE",
  "likesCount": 4,
  "isLiked": false
}
```

---

## 5. REELS MANAGEMENT LIKE API
**Endpoint**: `POST /api/reels-management/like?reelId=REEL_ID`

**Description**: Like API specifically for reels management.

```bash
curl -X POST "http://103.14.120.163:8081/api/reels-management/like?reelId=REEL_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Example Response:**
```json
{
  "success": true,
  "message": "Reel liked successfully",
  "reelId": "REEL_ID_HERE",
  "likedBy": "username",
  "likedByUserId": "USER_ID_HERE",
  "likesCount": 10,
  "isLiked": true
}
```

---

## 6. REELS MANAGEMENT UNLIKE API
**Endpoint**: `DELETE /api/reels-management/unlike?reelId=REEL_ID`

**Description**: Unlike API specifically for reels management.

```bash
curl -X DELETE "http://103.14.120.163:8081/api/reels-management/unlike?reelId=REEL_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Example Response:**
```json
{
  "success": true,
  "message": "Reel unliked successfully",
  "reelId": "REEL_ID_HERE",
  "unlikedBy": "username",
  "unlikedByUserId": "USER_ID_HERE",
  "likesCount": 9,
  "isLiked": false
}
```

---

## 7. COMMENT LIKE API
**Endpoint**: `POST /api/comments/like`

**Description**: Like/Unlike API for comments. This API toggles the like status (likes if not liked, unlikes if liked).

### 7.1 Like a Comment
```bash
curl -X POST "http://103.14.120.163:8081/api/comments/like?userId=USER_ID_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "commentId": "COMMENT_ID_HERE"
  }'
```

**Note**: This API requires `userId` as a query parameter or in the header `x-user-id`.

### Alternative with Header
```bash
curl -X POST "http://103.14.120.163:8081/api/comments/like" \
  -H "Content-Type: application/json" \
  -H "x-user-id: USER_ID_HERE" \
  -d '{
    "commentId": "COMMENT_ID_HERE"
  }'
```

**Example Response:**
```json
{
  "success": true,
  "message": "Comment liked successfully",
  "data": {
    "commentId": "COMMENT_ID_HERE",
    "isLiked": true,
    "likesCount": 3
  }
}
```

**Note**: The same endpoint is used for unliking. If already liked, it will unlike and return "Comment unliked successfully".

---

## Summary of All Like/Unlike Endpoints

| API | Method | Endpoint | ContentType Support |
|-----|--------|----------|---------------------|
| Universal Like | POST | `/api/likes/like` | post, video, reel, story, userAsset |
| Universal Unlike | DELETE | `/api/likes/unlike` | post, video, reel, story, userAsset |
| Posts Management Like | POST | `/api/posts-management/like?postId=ID` | post only |
| Posts Management Unlike | DELETE | `/api/posts-management/unlike?postId=ID` | post only |
| Reels Management Like | POST | `/api/reels-management/like?reelId=ID` | reel only |
| Reels Management Unlike | DELETE | `/api/reels-management/unlike?reelId=ID` | reel only |
| Comment Like/Unlike | POST | `/api/comments/like` | comment only (toggle) |

---

## Complete Example with All APIs

### Universal Like API Examples
```bash
# Like a post
curl -X POST "http://103.14.120.163:8081/api/likes/like" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"contentType": "post", "contentId": "POST_ID"}'

# Like a video
curl -X POST "http://103.14.120.163:8081/api/likes/like" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"contentType": "video", "contentId": "VIDEO_ID"}'

# Like a reel
curl -X POST "http://103.14.120.163:8081/api/likes/like" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"contentType": "reel", "contentId": "REEL_ID"}'

# Like a story
curl -X POST "http://103.14.120.163:8081/api/likes/like" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"contentType": "story", "contentId": "STORY_ID"}'

# Like user asset
curl -X POST "http://103.14.120.163:8081/api/likes/like" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"contentType": "userAsset", "contentId": "ASSET_ID"}'
```

### Universal Unlike API Examples
```bash
# Unlike a post
curl -X DELETE "http://103.14.120.163:8081/api/likes/unlike" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"contentType": "post", "contentId": "POST_ID"}'

# Unlike a video
curl -X DELETE "http://103.14.120.163:8081/api/likes/unlike" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"contentType": "video", "contentId": "VIDEO_ID"}'

# Unlike a reel
curl -X DELETE "http://103.14.120.163:8081/api/likes/unlike" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"contentType": "reel", "contentId": "REEL_ID"}'

# Unlike a story
curl -X DELETE "http://103.14.120.163:8081/api/likes/unlike" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"contentType": "story", "contentId": "STORY_ID"}'

# Unlike user asset
curl -X DELETE "http://103.14.120.163:8081/api/likes/unlike" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"contentType": "userAsset", "contentId": "ASSET_ID"}'
```

### Posts Management API Examples
```bash
# Like a post
curl -X POST "http://103.14.120.163:8081/api/posts-management/like?postId=POST_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# Unlike a post
curl -X DELETE "http://103.14.120.163:8081/api/posts-management/unlike?postId=POST_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Reels Management API Examples
```bash
# Like a reel
curl -X POST "http://103.14.120.163:8081/api/reels-management/like?reelId=REEL_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# Unlike a reel
curl -X DELETE "http://103.14.120.163:8081/api/reels-management/unlike?reelId=REEL_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Comment Like/Unlike API Example
```bash
# Like/Unlike a comment (toggles)
curl -X POST "http://103.14.120.163:8081/api/comments/like?userId=USER_ID" \
  -H "Content-Type: application/json" \
  -d '{"commentId": "COMMENT_ID"}'
```

---

## How to Get Valid Post IDs for Testing

Before testing like/unlike APIs, you need to retrieve actual post IDs from your database. Here are the APIs to get posts:

### 1. Get All Posts with IDs
**Endpoint**: `GET /api/posts/ids`

```bash
curl -X GET "http://103.14.120.163:8081/api/posts/ids?page=1&limit=10" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "message": "Post IDs retrieved successfully",
  "data": {
    "posts": [
      {
        "postId": "ACTUAL_POST_ID_HERE",
        "content": "Post content...",
        "author": {
          "username": "username",
          "fullName": "Full Name"
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalPosts": 10
    }
  }
}
```

### 2. Get Posts Management Posts
**Endpoint**: `GET /api/posts-management/retrieve`

```bash
curl -X GET "http://103.14.120.163:8081/api/posts-management/retrieve?offset=0&limit=10" \
  -H "Content-Type: application/json"
```

### 3. Get Comprehensive Posts
**Endpoint**: `GET /api/posts/comprehensive`

```bash
curl -X GET "http://103.14.120.163:8081/api/posts/comprehensive?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### 4. Get User Assets (Media Files)
**Endpoint**: `GET /api/user-assets/retrieve`

```bash
curl -X GET "http://103.14.120.163:8081/api/user-assets/retrieve?offset=0&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Complete Testing Workflow

### Step 1: Get a Valid Post ID

```bash
# Get posts with IDs
curl -X GET "http://103.14.120.163:8081/api/posts/ids?page=1&limit=5" \
  -H "Content-Type: application/json"
```

### Step 2: Use the Post ID to Like

```bash
# Replace ACTUAL_POST_ID with the ID from Step 1
curl -X POST "http://103.14.120.163:8081/api/likes/like" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "post",
    "contentId": "ACTUAL_POST_ID"
  }'
```

### Step 3: Verify Like Status (Optional)

```bash
curl -X GET "http://103.14.120.163:8081/api/likes/status?contentType=post&contentId=ACTUAL_POST_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Step 4: Unlike the Post

```bash
curl -X DELETE "http://103.14.120.163:8081/api/likes/unlike" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "post",
    "contentId": "ACTUAL_POST_ID"
  }'
```

---

## Troubleshooting: Post Not Found Errors

If you get `404 Post not found` or `Content not found` errors, it means:

1. **The post ID doesn't exist** - Use the APIs above to get valid post IDs
2. **The post belongs to a different content type** - Make sure you're using the correct contentType
3. **The post was deleted** - Try retrieving posts again to get current IDs

**Solution:**
```bash
# First, retrieve valid post IDs
curl -X GET "http://103.14.120.163:8081/api/posts/ids?page=1&limit=10" \
  -H "Content-Type: application/json"

# Then use one of the post IDs from the response
curl -X POST "http://103.14.120.163:8081/api/likes/like" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "post",
    "contentId": "COPY_POST_ID_FROM_RESPONSE_ABOVE"
  }'
```

---

## Notes

1. **Universal APIs** (`/api/likes/like` and `/api/likes/unlike`) are the most flexible and support multiple content types.

2. **Management APIs** (`/api/posts-management/*` and `/api/reels-management/*`) are specific to their content types and use query parameters.

3. **Comment API** (`/api/comments/like`) is a toggle API that switches between like and unlike on each call.

4. All APIs except the comment API require JWT authentication.

5. Replace `YOUR_JWT_TOKEN`, `POST_ID_HERE`, `REEL_ID_HERE`, etc. with actual values.

6. **Always retrieve valid post IDs before testing like/unlike APIs** to avoid 404 errors.

