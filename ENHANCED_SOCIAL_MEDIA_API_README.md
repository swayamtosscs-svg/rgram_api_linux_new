# Enhanced Social Media API - Complete Curl Commands

This document provides comprehensive curl commands for the enhanced social media API that includes follow relationships, privacy controls, and advanced post management.

## Server Information
- **Server URL**: `http://103.14.120.163:8081` (Production)
- **Local URL**: `http://localhost:8081` (Development)
- **Port**: 8081

## Authentication
All API calls require Bearer token authentication:
```bash
Authorization: Bearer <your_jwt_token>
```

---

## 1. Assets Management API

### Upload Assets
```bash
curl -X POST "http://103.14.120.163:8081/api/assets/upload?userId=YOUR_USER_ID" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/your/file.jpg"
```

### List Assets
```bash
curl -X GET "http://103.14.120.163:8081/api/assets/list?userId=YOUR_USER_ID&folder=images&type=image&page=1&limit=10"
```

### Delete Asset
```bash
curl -X DELETE "http://103.14.120.163:8081/api/assets/delete?userId=YOUR_USER_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "68b2a1949d2e7ff00c90feb_1756897129608_fx1zq8mht.avif",
    "folder": "images"
  }'
```

### Replace Asset
```bash
curl -X PUT "http://103.14.120.163:8081/api/assets/replace?userId=YOUR_USER_ID&targetFileName=68b2a1949d2e7ff00c90feb_1756897129608_fx1zq8mht.avif&targetFolder=images" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/new/file.jpg"
```

---

## 2. Follow Request System

### Send Follow Request
```bash
curl -X POST "http://103.14.120.163:8081/api/follow-request/send" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "targetUserId": "target_user_id_here"
  }'
```

### Accept Follow Request
```bash
curl -X POST "http://103.14.120.163:8081/api/follow-request/accept" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "followRequestId": "follow_request_id_here"
  }'
```

### Reject Follow Request
```bash
curl -X POST "http://103.14.120.163:8081/api/follow-request/reject" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "followRequestId": "follow_request_id_here"
  }'
```

### List Received Follow Requests
```bash
curl -X GET "http://103.14.120.163:8081/api/follow-request/list?type=received&status=pending&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### List Sent Follow Requests
```bash
curl -X GET "http://103.14.120.163:8081/api/follow-request/list?type=sent&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Cancel Follow Request
```bash
curl -X DELETE "http://103.14.120.163:8081/api/follow-request/cancel?followRequestId=follow_request_id_here" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 3. Enhanced Posts Management

### Create Post (Enhanced)
```bash
curl -X POST "http://103.14.120.163:8081/api/posts/create-enhanced" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is my post content",
    "type": "post",
    "title": "Optional title",
    "description": "Optional description",
    "category": "general",
    "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
    "videos": ["https://example.com/video1.mp4"],
    "audio": ["https://example.com/audio1.mp3"],
    "documents": ["https://example.com/doc1.pdf"],
    "isPrivate": false,
    "allowComments": true,
    "allowLikes": true,
    "tags": ["tag1", "tag2"],
    "location": "Mumbai, India",
    "mood": "happy",
    "religion": "Hindu"
  }'
```

### Create Video Post
```bash
curl -X POST "http://103.14.120.163:8081/api/posts/create-enhanced" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Check out my new video!",
    "type": "video",
    "title": "My Video Title",
    "description": "Video description",
    "category": "entertainment",
    "videos": ["https://example.com/video.mp4"],
    "isPrivate": false,
    "allowComments": true,
    "allowLikes": true,
    "tags": ["video", "entertainment"]
  }'
```

### Create Message Post
```bash
curl -X POST "http://103.14.120.163:8081/api/posts/create-enhanced" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello everyone!",
    "type": "message",
    "audio": ["https://example.com/voice-message.mp3"],
    "isPrivate": true,
    "allowComments": false,
    "allowLikes": true
  }'
```

### Create Story
```bash
curl -X POST "http://103.14.120.163:8081/api/posts/create-enhanced" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Story content",
    "type": "story",
    "images": ["https://example.com/story-image.jpg"],
    "isPrivate": false,
    "allowComments": true,
    "allowLikes": true
  }'
```

### Create Reel
```bash
curl -X POST "http://103.14.120.163:8081/api/posts/create-enhanced" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Check out my reel!",
    "type": "reel",
    "title": "My Reel",
    "videos": ["https://example.com/reel-video.mp4"],
    "reelDuration": 30,
    "isPrivate": false,
    "allowComments": true,
    "allowLikes": true,
    "tags": ["reel", "fun"]
  }'
```

---

## 4. Posts Management (CRUD Operations)

### Get Your Own Posts
```bash
curl -X GET "http://103.14.120.163:8081/api/posts/manage?page=1&limit=10&type=post" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Specific Post
```bash
curl -X GET "http://103.14.120.163:8081/api/posts/manage?postId=POST_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get User's Posts (if you have permission)
```bash
curl -X GET "http://103.14.120.163:8081/api/posts/manage?userId=TARGET_USER_ID&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Post
```bash
curl -X PUT "http://103.14.120.163:8081/api/posts/manage?postId=POST_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Updated content",
    "title": "Updated title",
    "isPrivate": false,
    "allowComments": true,
    "allowLikes": true,
    "tags": ["updated", "tags"]
  }'
```

### Delete Post
```bash
curl -X DELETE "http://103.14.120.163:8081/api/posts/manage?postId=POST_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 5. Social Feed API

### Get Social Feed (Posts from followed users + public posts)
```bash
curl -X GET "http://103.14.120.163:8081/api/feed/social?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Home Feed (Legacy)
```bash
curl -X GET "http://103.14.120.163:8081/api/feed/home?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Personal Feed
```bash
curl -X GET "http://103.14.120.163:8081/api/feed/personal?userId=YOUR_USER_ID&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Explore Feed
```bash
curl -X GET "http://103.14.120.163:8081/api/feed/explore?page=1&limit=10&type=post&q=search_term" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Videos Feed
```bash
curl -X GET "http://103.14.120.163:8081/api/feed/videos?page=1&limit=10&category=entertainment&religion=Hindu" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 6. Follow/Unfollow System

### Follow User
```bash
curl -X POST "http://103.14.120.163:8081/api/follow/USER_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Unfollow User
```bash
curl -X DELETE "http://103.14.120.163:8081/api/follow/USER_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 7. Friend Request System

### Send Friend Request
```bash
curl -X POST "http://103.14.120.163:8081/api/friend-request/send" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientId": "recipient_user_id",
    "message": "Hi! Let\'s be friends!"
  }'
```

### Accept Friend Request
```bash
curl -X POST "http://103.14.120.163:8081/api/friend-request/accept" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "friendRequestId": "friend_request_id_here"
  }'
```

### Reject Friend Request
```bash
curl -X POST "http://103.14.120.163:8081/api/friend-request/reject" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "friendRequestId": "friend_request_id_here"
  }'
```

### List Friend Requests
```bash
curl -X GET "http://103.14.120.163:8081/api/friend-request/list?type=received&status=pending&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 8. Complete Workflow Examples

### Example 1: Complete Post Creation and Sharing Workflow

```bash
# 1. Upload assets first
curl -X POST "http://103.14.120.163:8081/api/assets/upload?userId=YOUR_USER_ID" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/video.mp4"

# 2. Create a video post
curl -X POST "http://103.14.120.163:8081/api/posts/create-enhanced" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Check out my new video!",
    "type": "video",
    "title": "My Amazing Video",
    "videos": ["/assets/YOUR_USER_ID/videos/filename.mp4"],
    "isPrivate": false,
    "allowComments": true,
    "allowLikes": true,
    "tags": ["video", "amazing"]
  }'

# 3. View your social feed
curl -X GET "http://103.14.120.163:8081/api/feed/social?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Example 2: Follow User and View Their Posts

```bash
# 1. Send follow request
curl -X POST "http://103.14.120.163:8081/api/follow-request/send" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "targetUserId": "target_user_id"
  }'

# 2. Target user accepts the request (they would do this)
# (This is just for reference - the target user would execute this)

# 3. View posts from followed user
curl -X GET "http://103.14.120.163:8081/api/posts/manage?userId=target_user_id&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 4. View updated social feed (now includes followed user's posts)
curl -X GET "http://103.14.120.163:8081/api/feed/social?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Example 3: Private Account Management

```bash
# 1. Create a private post
curl -X POST "http://103.14.120.163:8081/api/posts/create-enhanced" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is a private post",
    "type": "post",
    "isPrivate": true,
    "allowComments": false,
    "allowLikes": true
  }'

# 2. Another user tries to view your posts (will be denied if not following)
curl -X GET "http://103.14.120.163:8081/api/posts/manage?userId=YOUR_USER_ID&page=1&limit=10" \
  -H "Authorization: Bearer OTHER_USER_TOKEN"

# 3. After they follow you and you accept, they can view your posts
curl -X GET "http://103.14.120.163:8081/api/posts/manage?userId=YOUR_USER_ID&page=1&limit=10" \
  -H "Authorization: Bearer OTHER_USER_TOKEN"
```

---

## Response Examples

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
    },
    "privacy": {
      "isPrivate": false,
      "visibility": "public",
      "allowComments": true,
      "allowLikes": true
    },
    "media": {
      "images": 2,
      "videos": 1,
      "audio": 0,
      "documents": 0
    }
  }
}
```

### Social Feed Response
```json
{
  "success": true,
  "message": "Social feed retrieved successfully",
  "data": {
    "posts": [
      {
        "_id": "post_id",
        "content": "Post content",
        "type": "post",
        "author": {
          "_id": "author_id",
          "username": "username",
          "fullName": "Full Name",
          "avatar": "avatar_url",
          "isPrivate": false,
          "religion": "Hindu"
        },
        "visibilityReason": "following_user",
        "canInteract": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalPosts": 100,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "statistics": {
      "totalFollowing": 50,
      "totalPublicUsers": 1000,
      "totalPrivateUsers": 200,
      "postsFromFollowing": 8,
      "postsFromPublic": 2
    },
    "userInfo": {
      "userId": "current_user_id",
      "username": "current_username",
      "religion": "Hindu",
      "isPrivate": false
    }
  }
}
```

---

## Important Notes

1. **Authentication**: All API calls require a valid JWT token in the Authorization header
2. **Privacy Controls**: 
   - Private posts are only visible to followers
   - Public posts are visible to everyone
   - Follow requests must be accepted before viewing private content
3. **File Uploads**: Use the assets API for file uploads, then reference the returned URLs in posts
4. **Rate Limiting**: Be mindful of API rate limits in production
5. **Error Handling**: Always check the response status and error messages
6. **Pagination**: Use page and limit parameters for large datasets

## Testing Tips

1. Start with authentication to get a valid token
2. Test file uploads before creating posts with media
3. Test follow requests with two different user accounts
4. Verify privacy settings work correctly
5. Test pagination with large datasets
6. Monitor server logs for debugging
