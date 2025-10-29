# Posts & Media Like/Unlike & Deletion API cURL Commands

## Overview
This document provides comprehensive cURL commands for liking, unliking, and deleting posts and media content in the Rgram API.

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

## 1. LIKE/UNLIKE APIs

### 1.1 Universal Like API (Recommended)
**Endpoint**: `POST /api/likes/like`

**Description**: Universal API that can like posts, videos, reels, stories, and user assets.

#### Request Body Format:
```json
{
  "contentType": "post|video|reel|story|userAsset",
  "contentId": "CONTENT_ID_HERE"
}
```

#### cURL Examples:

**Like a Post:**
```bash
curl -X POST "http://103.14.120.163:8081/api/likes/like" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGU4ZWNmZTgxOWUzNDVhZGRkZTJkZWIiLCJpYXQiOjE3NjEzODg1MTgsImV4cCI6MTc2Mzk4MDUxOH0.JBmqGX7y_YBFdNAdCUhiyZ2kuh3_JXx5HqHQz44-J5g" \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "post",
    "contentId": "68ef790cc8cdffc39fc7114a"
  }'
```

**Like a Video/Reel:**
```bash
curl -X POST "http://103.14.120.163:8081/api/likes/like" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "video",
    "contentId": "VIDEO_ID_HERE"
  }'
```

**Like a Story:**
```bash
curl -X POST "http://103.14.120.163:8081/api/likes/like" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "story",
    "contentId": "STORY_ID_HERE"
  }'
```

**Like User Asset:**
```bash
curl -X POST "http://103.14.120.163:8081/api/likes/like" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "userAsset",
    "contentId": "USER_ASSET_ID_HERE"
  }'
```

### 1.2 Universal Unlike API
**Endpoint**: `DELETE /api/likes/unlike`

#### cURL Examples:

**Unlike a Post:**
```bash
curl -X DELETE "http://103.14.120.163:8081/api/likes/unlike" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "post",
    "contentId": "68ef790cc8cdffc39fc7114a"
  }'
```

**Unlike a Video/Reel:**
```bash
curl -X DELETE "http://103.14.120.163:8081/api/likes/unlike" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "video",
    "contentId": "VIDEO_ID_HERE"
  }'
```

### 1.3 Posts Management Like API
**Endpoint**: `POST /api/posts-management/like?postId=POST_ID`

#### cURL Example:
```bash
curl -X POST "http://103.14.120.163:8081/api/posts-management/like?postId=68ef790cc8cdffc39fc7114a" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### 1.4 Posts Management Unlike API
**Endpoint**: `DELETE /api/posts-management/unlike?postId=POST_ID`

#### cURL Example:
```bash
curl -X DELETE "http://103.14.120.163:8081/api/posts-management/unlike?postId=68ef790cc8cdffc39fc7114a" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### 1.5 Reels Management Like API
**Endpoint**: `POST /api/reels-management/like?reelId=REEL_ID`

#### cURL Example:
```bash
curl -X POST "http://103.14.120.163:8081/api/reels-management/like?reelId=REEL_ID_HERE" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### 1.6 Reels Management Unlike API
**Endpoint**: `DELETE /api/reels-management/unlike?reelId=REEL_ID`

#### cURL Example:
```bash
curl -X DELETE "http://103.14.120.163:8081/api/reels-management/unlike?reelId=REEL_ID_HERE" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

---

## 2. DELETION APIs

### 2.1 Posts Management Delete API
**Endpoint**: `DELETE /api/posts-management/delete?postId=POST_ID`

#### cURL Example:
```bash
curl -X DELETE "http://103.14.120.163:8081/api/posts-management/delete?postId=68ef790cc8cdffc39fc7114a" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### 2.2 Comprehensive Posts Delete API
**Endpoint**: `DELETE /api/posts/comprehensive?postId=POST_ID`

#### cURL Example:
```bash
curl -X DELETE "http://103.14.120.163:8081/api/posts/comprehensive?postId=68ef790cc8cdffc39fc7114a" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### 2.3 Posts Manage Delete API
**Endpoint**: `DELETE /api/posts/manage?postId=POST_ID`

#### cURL Example:
```bash
curl -X DELETE "http://103.14.120.163:8081/api/posts/manage?postId=68ef790cc8cdffc39fc7114a" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### 2.4 Reels Management Delete API
**Endpoint**: `DELETE /api/reels-management/delete?reelId=REEL_ID`

#### cURL Example:
```bash
curl -X DELETE "http://103.14.120.163:8081/api/reels-management/delete?reelId=REEL_ID_HERE" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### 2.5 Comprehensive Reels Delete API
**Endpoint**: `DELETE /api/reels/comprehensive?reelId=REEL_ID`

#### cURL Example:
```bash
curl -X DELETE "http://103.14.120.163:8081/api/reels/comprehensive?reelId=REEL_ID_HERE" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### 2.6 Stories Delete API
**Endpoint**: `DELETE /api/stories/enhanced?storyId=STORY_ID`

#### cURL Example:
```bash
curl -X DELETE "http://103.14.120.163:8081/api/stories/enhanced?storyId=STORY_ID_HERE" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### 2.7 Media Files Delete API
**Endpoint**: `DELETE /api/chat/media-management?mediaId=MEDIA_ID`

#### cURL Example:
```bash
curl -X DELETE "http://103.14.120.163:8081/api/chat/media-management?mediaId=MEDIA_ID_HERE" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

---

## 3. PowerShell Examples (Windows)

### 3.1 Like a Post (PowerShell)
```powershell
$response = Invoke-RestMethod -Uri "http://103.14.120.163:8081/api/likes/like" -Method POST -Headers @{"Authorization"="Bearer YOUR_TOKEN_HERE"; "Content-Type"="application/json"} -Body '{"contentType": "post", "contentId": "68ef790cc8cdffc39fc7114a"}'
$response | ConvertTo-Json -Depth 10
```

### 3.2 Unlike a Post (PowerShell)
```powershell
$response = Invoke-RestMethod -Uri "http://103.14.120.163:8081/api/likes/unlike" -Method DELETE -Headers @{"Authorization"="Bearer YOUR_TOKEN_HERE"; "Content-Type"="application/json"} -Body '{"contentType": "post", "contentId": "68ef790cc8cdffc39fc7114a"}'
$response | ConvertTo-Json -Depth 10
```

### 3.3 Delete a Post (PowerShell)
```powershell
$response = Invoke-RestMethod -Uri "http://103.14.120.163:8081/api/posts-management/delete?postId=68ef790cc8cdffc39fc7114a" -Method DELETE -Headers @{"Authorization"="Bearer YOUR_TOKEN_HERE"; "Content-Type"="application/json"}
$response | ConvertTo-Json -Depth 10
```

---

## 4. Complete JSON Examples

### 4.1 Request JSON Examples

#### Like Post Request:
```json
{
  "contentType": "post",
  "contentId": "68ef790cc8cdffc39fc7114a"
}
```

#### Like Video Request:
```json
{
  "contentType": "video",
  "contentId": "VIDEO_ID_HERE"
}
```

#### Like Reel Request:
```json
{
  "contentType": "reel",
  "contentId": "REEL_ID_HERE"
}
```

#### Like Story Request:
```json
{
  "contentType": "story",
  "contentId": "STORY_ID_HERE"
}
```

#### Like User Asset Request:
```json
{
  "contentType": "userAsset",
  "contentId": "USER_ASSET_ID_HERE"
}
```

#### Unlike Request (Same format as Like):
```json
{
  "contentType": "post",
  "contentId": "68ef790cc8cdffc39fc7114a"
}
```

### 4.2 Response JSON Examples

#### Successful Like Response:
```json
{
  "success": true,
  "message": "Content liked successfully",
  "data": {
    "likeId": "LIKE_ID_HERE",
    "userId": "68e8ecfe819e345addde2deb",
    "contentType": "post",
    "contentId": "68ef790cc8cdffc39fc7114a",
    "likedAt": "2025-10-25T11:10:30.123Z",
    "likesCount": 1,
    "user": {
      "userId": "68e8ecfe819e345addde2deb",
      "username": "swayam",
      "fullName": "swayam"
    }
  }
}
```

#### Successful Unlike Response:
```json
{
  "success": true,
  "message": "Content unliked successfully",
  "data": {
    "userId": "68e8ecfe819e345addde2deb",
    "contentType": "post",
    "contentId": "68ef790cc8cdffc39fc7114a",
    "unlikedAt": "2025-10-25T11:10:30.123Z",
    "likesCount": 0,
    "user": {
      "userId": "68e8ecfe819e345addde2deb",
      "username": "swayam",
      "fullName": "swayam"
    }
  }
}
```

#### Posts Management Like Response:
```json
{
  "success": true,
  "message": "Post liked successfully",
  "postId": "68ef790cc8cdffc39fc7114a",
  "likedBy": "swayam",
  "likedByUserId": "68e8ecfe819e345addde2deb",
  "likesCount": 1,
  "isLiked": true
}
```

#### Posts Management Unlike Response:
```json
{
  "success": true,
  "message": "Post unliked successfully",
  "postId": "68ef790cc8cdffc39fc7114a",
  "unlikedBy": "swayam",
  "unlikedByUserId": "68e8ecfe819e345addde2deb",
  "likesCount": 0,
  "isLiked": false
}
```

#### Successful Post Delete Response:
```json
{
  "success": true,
  "message": "Post deleted successfully",
  "data": {
    "deletedPostId": "68ef790cc8cdffc39fc7114a",
    "deletedAt": "2025-10-25T11:10:30.123Z",
    "deletedBy": "68e8ecfe819e345addde2deb",
    "deletedByUsername": "swayam"
  }
}
```

#### Comprehensive Post Delete Response:
```json
{
  "success": true,
  "message": "Post deleted successfully",
  "data": {
    "deletedPost": {
      "_id": "68ef790cc8cdffc39fc7114a",
      "content": "Post content here",
      "author": {
        "_id": "68e8ecfe819e345addde2deb",
        "username": "swayam",
        "fullName": "swayam",
        "avatar": "avatar_url_here"
      },
      "likes": [],
      "likeCount": 0,
      "comments": [],
      "commentCount": 0,
      "createdAt": "2025-10-25T10:00:00.000Z",
      "updatedAt": "2025-10-25T11:10:30.123Z",
      "isActive": false
    },
    "deletedAt": "2025-10-25T11:10:30.123Z",
    "deletedBy": "68e8ecfe819e345addde2deb"
  }
}
```

#### Reel Delete Response:
```json
{
  "success": true,
  "message": "Reel deleted successfully",
  "data": {
    "deletedReelId": "REEL_ID_HERE",
    "deletedAt": "2025-10-25T11:10:30.123Z",
    "deletedBy": "68e8ecfe819e345addde2deb"
  }
}
```

#### Story Delete Response:
```json
{
  "success": true,
  "message": "Story deleted successfully",
  "data": {
    "deletedStoryId": "STORY_ID_HERE",
    "deletedAt": "2025-10-25T11:10:30.123Z",
    "deletedBy": "68e8ecfe819e345addde2deb"
  }
}
```

#### Media File Delete Response:
```json
{
  "success": true,
  "message": "Media file deleted successfully",
  "data": {
    "deletedMediaId": "68fcaf1a1bfb5ca3a9d9e584",
    "fileName": "68e8ecfe819e345addde2deb_1761390362900_8lant8ga1_media.jpg",
    "filePath": "/var/www/html/rgram_api_linux_new/public/uploads/users/68e8ecfe819e345addde2deb/images/68e8ecfe819e345addde2deb_1761390362900_8lant8ga1_media.jpg",
    "publicUrl": "/uploads/users/68e8ecfe819e345addde2deb/images/68e8ecfe819e345addde2deb_1761390362900_8lant8ga1_media.jpg",
    "fileSize": 2432476,
    "fileType": "image",
    "mimeType": "image/jpeg",
    "deletedAt": "2025-10-25T11:10:30.123Z",
    "deletedBy": "68e8ecfe819e345addde2deb"
  }
}
```

---

## 5. Complete Error Response JSON Examples

### 5.1 Authentication Errors (401)

#### Missing Token:
```json
{
  "success": false,
  "message": "Authentication required"
}
```

#### Invalid Token:
```json
{
  "success": false,
  "message": "Invalid token"
}
```

#### Token Expired:
```json
{
  "success": false,
  "message": "Token expired",
  "error": "jwt expired"
}
```

### 5.2 Content Not Found Errors (404)

#### Post Not Found:
```json
{
  "success": false,
  "message": "Post not found"
}
```

#### Content Not Found:
```json
{
  "success": false,
  "message": "Content not found"
}
```

#### User Not Found:
```json
{
  "success": false,
  "message": "User not found"
}
```

#### Media File Not Found:
```json
{
  "success": false,
  "message": "Media file not found"
}
```

### 5.3 Validation Errors (400)

#### Missing Required Fields:
```json
{
  "success": false,
  "message": "Content type and content ID are required"
}
```

#### Invalid Content Type:
```json
{
  "success": false,
  "message": "Invalid content type. Must be: post, video, reel, story, or userAsset"
}
```

#### Already Liked:
```json
{
  "success": false,
  "message": "You have already liked this content"
}
```

#### Post Already Liked:
```json
{
  "error": "Post already liked by user"
}
```

#### Missing Post ID:
```json
{
  "error": "Post ID is required"
}
```

#### Invalid Request Body:
```json
{
  "success": false,
  "message": "Invalid request body"
}
```

### 5.4 Permission Errors (403)

#### Cannot Delete Others' Posts:
```json
{
  "success": false,
  "message": "You can only delete your own posts"
}
```

#### Not Authorized to Delete:
```json
{
  "success": false,
  "message": "You are not authorized to delete this post"
}
```

#### Permission Denied:
```json
{
  "error": "You can only delete your own posts"
}
```

#### Access Denied:
```json
{
  "success": false,
  "message": "Access denied: File does not belong to user"
}
```

### 5.5 Method Not Allowed (405)

#### Wrong HTTP Method:
```json
{
  "success": false,
  "message": "Method not allowed"
}
```

#### Posts Management Method Error:
```json
{
  "error": "Method not allowed"
}
```

### 5.6 Server Errors (500)

#### Internal Server Error:
```json
{
  "success": false,
  "message": "Internal server error"
}
```

#### Database Connection Error:
```json
{
  "success": false,
  "message": "Database connection failed"
}
```

#### File System Error:
```json
{
  "success": false,
  "message": "Failed to delete file",
  "error": "ENOENT: no such file or directory"
}
```

#### Update Failed:
```json
{
  "success": false,
  "message": "Failed to update post"
}
```

### 5.7 Specific API Error Examples

#### Likes API Errors:
```json
{
  "success": false,
  "message": "You have already liked this content",
  "error": "DUPLICATE_LIKE"
}
```

#### Posts Management Errors:
```json
{
  "error": "Post not found",
  "code": "POST_NOT_FOUND"
}
```

#### Media Management Errors:
```json
{
  "success": false,
  "message": "Media file not found",
  "error": "MEDIA_NOT_FOUND",
  "mediaId": "68fcaf1a1bfb5ca3a9d9e584"
}
```

#### Local Storage Errors:
```json
{
  "success": false,
  "message": "File not found",
  "error": "FILE_NOT_FOUND",
  "filePath": "/uploads/users/userId/images/filename.jpg"
}
```

---

## 6. Content Types Reference

| Content Type | Description | Example ID Format |
|--------------|-------------|-------------------|
| `post` | Regular posts | `68ef790cc8cdffc39fc7114a` |
| `video` | Video content | `VIDEO_ID_HERE` |
| `reel` | Short video reels | `REEL_ID_HERE` |
| `story` | Temporary stories | `STORY_ID_HERE` |
| `userAsset` | User uploaded assets | `USER_ASSET_ID_HERE` |

---

## 7. Complete JSON Testing Examples

### 7.1 Testing with Your Actual Data

#### Like Post JSON Request:
```json
{
  "contentType": "post",
  "contentId": "68ef790cc8cdffc39fc7114a"
}
```

#### Like Post cURL Command:
```bash
curl -X POST "http://103.14.120.163:8081/api/likes/like" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGU4ZWNmZTgxOWUzNDVhZGRkZTJkZWIiLCJpYXQiOjE3NjEzODg1MTgsImV4cCI6MTc2Mzk4MDUxOH0.JBmqGX7y_YBFdNAdCUhiyZ2kuh3_JXx5HqHQz44-J5g" \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "post",
    "contentId": "68ef790cc8cdffc39fc7114a"
  }'
```

#### Unlike Post JSON Request:
```json
{
  "contentType": "post",
  "contentId": "68ef790cc8cdffc39fc7114a"
}
```

#### Unlike Post cURL Command:
```bash
curl -X DELETE "http://103.14.120.163:8081/api/likes/unlike" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGU4ZWNmZTgxOWUzNDVhZGRkZTJkZWIiLCJpYXQiOjE3NjEzODg1MTgsImV4cCI6MTc2Mzk4MDUxOH0.JBmqGX7y_YBFdNAdCUhiyZ2kuh3_JXx5HqHQz44-J5g" \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "post",
    "contentId": "68ef790cc8cdffc39fc7114a"
  }'
```

#### Delete Post cURL Command:
```bash
curl -X DELETE "http://103.14.120.163:8081/api/posts-management/delete?postId=68ef790cc8cdffc39fc7114a" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGU4ZWNmZTgxOWUzNDVhZGRkZTJkZWIiLCJpYXQiOjE3NjEzODg1MTgsImV4cCI6MTc2Mzk4MDUxOH0.JBmqGX7y_YBFdNAdCUhiyZ2kuh3_JXx5HqHQz44-J5g" \
  -H "Content-Type: application/json"
```

### 7.2 Media File Operations

#### Delete Media File JSON Request:
```json
{
  "mediaId": "68fcaf1a1bfb5ca3a9d9e584"
}
```

#### Delete Media File cURL Command:
```bash
curl -X DELETE "http://103.14.120.163:8081/api/chat/media-management?mediaId=68fcaf1a1bfb5ca3a9d9e584" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGU4ZWNmZTgxOWUzNDVhZGRkZTJkZWIiLCJpYXQiOjE3NjEzODg1MTgsImV4cCI6MTc2Mzk4MDUxOH0.JBmqGX7y_YBFdNAdCUhiyZ2kuh3_JXx5HqHQz44-J5g" \
  -H "Content-Type: application/json"
```

#### Delete Local Storage File JSON Request:
```json
{
  "fileName": "68e8ecfe819e345addde2deb_1761390362900_8lant8ga1_media.jpg",
  "folder": "images"
}
```

#### Delete Local Storage File cURL Command:
```bash
curl -X DELETE "http://103.14.120.163:8081/api/local-storage/delete?userId=68e8ecfe819e345addde2deb" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGU4ZWNmZTgxOWUzNDVhZGRkZTJkZWIiLCJpYXQiOjE3NjEzODg1MTgsImV4cCI6MTc2Mzk4MDUxOH0.JBmqGX7y_YBFdNAdCUhiyZ2kuh3_JXx5HqHQz44-J5g" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "68e8ecfe819e345addde2deb_1761390362900_8lant8ga1_media.jpg",
    "folder": "images"
  }'
```

### 7.3 PowerShell JSON Testing

#### Like Post PowerShell with JSON:
```powershell
$body = @{
    contentType = "post"
    contentId = "68ef790cc8cdffc39fc7114a"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://103.14.120.163:8081/api/likes/like" -Method POST -Headers @{"Authorization"="Bearer YOUR_TOKEN_HERE"; "Content-Type"="application/json"} -Body $body
$response | ConvertTo-Json -Depth 10
```

#### Unlike Post PowerShell with JSON:
```powershell
$body = @{
    contentType = "post"
    contentId = "68ef790cc8cdffc39fc7114a"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://103.14.120.163:8081/api/likes/unlike" -Method DELETE -Headers @{"Authorization"="Bearer YOUR_TOKEN_HERE"; "Content-Type"="application/json"} -Body $body
$response | ConvertTo-Json -Depth 10
```

#### Delete Post PowerShell:
```powershell
$response = Invoke-RestMethod -Uri "http://103.14.120.163:8081/api/posts-management/delete?postId=68ef790cc8cdffc39fc7114a" -Method DELETE -Headers @{"Authorization"="Bearer YOUR_TOKEN_HERE"; "Content-Type"="application/json"}
$response | ConvertTo-Json -Depth 10
```

### 7.4 JavaScript/Fetch Examples

#### Like Post JavaScript:
```javascript
const likePost = async () => {
  const response = await fetch('http://103.14.120.163:8081/api/likes/like', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_TOKEN_HERE',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contentType: 'post',
      contentId: '68ef790cc8cdffc39fc7114a'
    })
  });
  
  const data = await response.json();
  console.log(data);
};
```

#### Unlike Post JavaScript:
```javascript
const unlikePost = async () => {
  const response = await fetch('http://103.14.120.163:8081/api/likes/unlike', {
    method: 'DELETE',
    headers: {
      'Authorization': 'Bearer YOUR_TOKEN_HERE',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contentType: 'post',
      contentId: '68ef790cc8cdffc39fc7114a'
    })
  });
  
  const data = await response.json();
  console.log(data);
};
```

#### Delete Post JavaScript:
```javascript
const deletePost = async () => {
  const response = await fetch('http://103.14.120.163:8081/api/posts-management/delete?postId=68ef790cc8cdffc39fc7114a', {
    method: 'DELETE',
    headers: {
      'Authorization': 'Bearer YOUR_TOKEN_HERE',
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  console.log(data);
};
```

---

## 8. Complete Success Response Examples

### 8.1 Like Success Responses

#### Universal Like API Success Response:
```json
{
  "success": true,
  "message": "Content liked successfully",
  "data": {
    "likeId": "60f7b3b3b3b3b3b3b3b3b3b3",
    "userId": "68e8ecfe819e345addde2deb",
    "contentType": "post",
    "contentId": "68ef790cc8cdffc39fc7114a",
    "likedAt": "2025-10-25T11:15:30.123Z",
    "likesCount": 1,
    "user": {
      "userId": "68e8ecfe819e345addde2deb",
      "username": "swayam",
      "fullName": "swayam",
      "avatar": "http://103.14.120.163:8081/uploads/68e8ecfe819e345addde2deb/images/avatar.jpg"
    },
    "content": {
      "contentId": "68ef790cc8cdffc39fc7114a",
      "contentType": "post",
      "title": "Post Title",
      "author": "swayam"
    }
  }
}
```

#### Posts Management Like Success Response:
```json
{
  "success": true,
  "message": "Post liked successfully",
  "postId": "68ef790cc8cdffc39fc7114a",
  "likedBy": "swayam",
  "likedByUserId": "68e8ecfe819e345addde2deb",
  "likesCount": 1,
  "isLiked": true,
  "timestamp": "2025-10-25T11:15:30.123Z"
}
```

#### Reels Management Like Success Response:
```json
{
  "success": true,
  "message": "Reel liked successfully",
  "reelId": "REEL_ID_HERE",
  "likedBy": "swayam",
  "likedByUserId": "68e8ecfe819e345addde2deb",
  "likesCount": 1,
  "isLiked": true,
  "timestamp": "2025-10-25T11:15:30.123Z"
}
```

### 8.2 Unlike Success Responses

#### Universal Unlike API Success Response:
```json
{
  "success": true,
  "message": "Content unliked successfully",
  "data": {
    "userId": "68e8ecfe819e345addde2deb",
    "contentType": "post",
    "contentId": "68ef790cc8cdffc39fc7114a",
    "unlikedAt": "2025-10-25T11:16:30.123Z",
    "likesCount": 0,
    "user": {
      "userId": "68e8ecfe819e345addde2deb",
      "username": "swayam",
      "fullName": "swayam",
      "avatar": "http://103.14.120.163:8081/uploads/68e8ecfe819e345addde2deb/images/avatar.jpg"
    },
    "content": {
      "contentId": "68ef790cc8cdffc39fc7114a",
      "contentType": "post",
      "title": "Post Title",
      "author": "swayam"
    }
  }
}
```

#### Posts Management Unlike Success Response:
```json
{
  "success": true,
  "message": "Post unliked successfully",
  "postId": "68ef790cc8cdffc39fc7114a",
  "unlikedBy": "swayam",
  "unlikedByUserId": "68e8ecfe819e345addde2deb",
  "likesCount": 0,
  "isLiked": false,
  "timestamp": "2025-10-25T11:16:30.123Z"
}
```

#### Reels Management Unlike Success Response:
```json
{
  "success": true,
  "message": "Reel unliked successfully",
  "reelId": "REEL_ID_HERE",
  "unlikedBy": "swayam",
  "unlikedByUserId": "68e8ecfe819e345addde2deb",
  "likesCount": 0,
  "isLiked": false,
  "timestamp": "2025-10-25T11:16:30.123Z"
}
```

### 8.3 Delete Success Responses

#### Posts Management Delete Success Response:
```json
{
  "success": true,
  "message": "Post deleted successfully",
  "data": {
    "deletedPostId": "68ef790cc8cdffc39fc7114a",
    "deletedAt": "2025-10-25T11:17:30.123Z",
    "deletedBy": "68e8ecfe819e345addde2deb",
    "deletedByUsername": "swayam",
    "postContent": "This was the post content...",
    "mediaFilesDeleted": [
      "image1.jpg",
      "video1.mp4"
    ],
    "commentsDeleted": 5,
    "likesRemoved": 12
  }
}
```

#### Comprehensive Post Delete Success Response:
```json
{
  "success": true,
  "message": "Post deleted successfully",
  "data": {
    "deletedPost": {
      "_id": "68ef790cc8cdffc39fc7114a",
      "content": "Post content here",
      "type": "post",
      "author": {
        "_id": "68e8ecfe819e345addde2deb",
        "username": "swayam",
        "fullName": "swayam",
        "avatar": "http://103.14.120.163:8081/uploads/68e8ecfe819e345addde2deb/images/avatar.jpg",
        "religion": "Hindu",
        "isPrivate": false
      },
      "images": [],
      "videos": [],
      "likes": [],
      "likeCount": 0,
      "comments": [],
      "commentCount": 0,
      "shares": 0,
      "createdAt": "2025-10-25T10:00:00.000Z",
      "updatedAt": "2025-10-25T11:17:30.123Z",
      "isActive": false,
      "deletedAt": "2025-10-25T11:17:30.123Z"
    },
    "deletedAt": "2025-10-25T11:17:30.123Z",
    "deletedBy": "68e8ecfe819e345addde2deb",
    "cleanup": {
      "mediaFilesDeleted": 2,
      "commentsDeleted": 5,
      "likesRemoved": 12,
      "storageSpaceFreed": "15.2 MB"
    }
  }
}
```

#### Reels Management Delete Success Response:
```json
{
  "success": true,
  "message": "Reel deleted successfully",
  "data": {
    "deletedReelId": "REEL_ID_HERE",
    "deletedAt": "2025-10-25T11:17:30.123Z",
    "deletedBy": "68e8ecfe819e345addde2deb",
    "deletedByUsername": "swayam",
    "reelContent": "This was the reel content...",
    "videoFileDeleted": "reel_video.mp4",
    "thumbnailDeleted": "reel_thumbnail.jpg",
    "likesRemoved": 8,
    "commentsDeleted": 3
  }
}
```

#### Comprehensive Reel Delete Success Response:
```json
{
  "success": true,
  "message": "Reel deleted successfully",
  "data": {
    "deletedReel": {
      "_id": "REEL_ID_HERE",
      "content": "Reel content here",
      "type": "reel",
      "author": {
        "_id": "68e8ecfe819e345addde2deb",
        "username": "swayam",
        "fullName": "swayam",
        "avatar": "http://103.14.120.163:8081/uploads/68e8ecfe819e345addde2deb/images/avatar.jpg"
      },
      "video": "",
      "thumbnail": "",
      "duration": 0,
      "likes": [],
      "likeCount": 0,
      "comments": [],
      "commentCount": 0,
      "views": 0,
      "createdAt": "2025-10-25T10:00:00.000Z",
      "updatedAt": "2025-10-25T11:17:30.123Z",
      "isActive": false,
      "deletedAt": "2025-10-25T11:17:30.123Z"
    },
    "deletedAt": "2025-10-25T11:17:30.123Z",
    "deletedBy": "68e8ecfe819e345addde2deb",
    "cleanup": {
      "videoFileDeleted": "reel_video.mp4",
      "thumbnailDeleted": "reel_thumbnail.jpg",
      "likesRemoved": 8,
      "commentsDeleted": 3,
      "storageSpaceFreed": "25.8 MB"
    }
  }
}
```

#### Story Delete Success Response:
```json
{
  "success": true,
  "message": "Story deleted successfully",
  "data": {
    "deletedStoryId": "STORY_ID_HERE",
    "deletedAt": "2025-10-25T11:17:30.123Z",
    "deletedBy": "68e8ecfe819e345addde2deb",
    "deletedByUsername": "swayam",
    "storyContent": "This was the story content...",
    "mediaFileDeleted": "story_media.jpg",
    "viewsRemoved": 15
  }
}
```

#### Media File Delete Success Response:
```json
{
  "success": true,
  "message": "Media file deleted successfully",
  "data": {
    "deletedMediaId": "68fcaf1a1bfb5ca3a9d9e584",
    "fileName": "68e8ecfe819e345addde2deb_1761390362900_8lant8ga1_media.jpg",
    "originalName": "bow-wow-Tyvg1zigZ14-unsplash.jpg",
    "filePath": "/var/www/html/rgram_api_linux_new/public/uploads/users/68e8ecfe819e345addde2deb/images/68e8ecfe819e345addde2deb_1761390362900_8lant8ga1_media.jpg",
    "publicUrl": "/uploads/users/68e8ecfe819e345addde2deb/images/68e8ecfe819e345addde2deb_1761390362900_8lant8ga1_media.jpg",
    "fileSize": 2432476,
    "fileType": "image",
    "mimeType": "image/jpeg",
    "folder": "images",
    "deletedAt": "2025-10-25T11:17:30.123Z",
    "deletedBy": {
      "userId": "68e8ecfe819e345addde2deb",
      "username": "swayam",
      "fullName": "swayam"
    },
    "storageInfo": {
      "type": "local",
      "spaceFreed": "2.3 MB",
      "totalUserStorage": "45.7 MB"
    }
  }
}
```

#### Local Storage Delete Success Response:
```json
{
  "success": true,
  "message": "File deleted successfully",
  "data": {
    "deletedFile": {
      "fileName": "68e8ecfe819e345addde2deb_1761390362900_8lant8ga1_media.jpg",
      "originalName": "bow-wow-Tyvg1zigZ14-unsplash.jpg",
      "filePath": "/var/www/html/rgram_api_linux_new/public/uploads/68e8ecfe819e345addde2deb/images/68e8ecfe819e345addde2deb_1761390362900_8lant8ga1_media.jpg",
      "publicUrl": "/uploads/68e8ecfe819e345addde2deb/images/68e8ecfe819e345addde2deb_1761390362900_8lant8ga1_media.jpg",
      "size": 2432476,
      "mimetype": "image/jpeg",
      "folder": "images",
      "deletedAt": "2025-10-25T11:17:30.123Z",
      "deletedBy": {
        "userId": "68e8ecfe819e345addde2deb",
        "username": "swayam",
        "fullName": "swayam"
      }
    },
    "cleanup": {
      "emptyFoldersRemoved": ["images"],
      "spaceFreed": "2.3 MB",
      "remainingFiles": 4
    }
  }
}
```

### 8.4 Bulk Operations Success Responses

#### Bulk Like Success Response:
```json
{
  "success": true,
  "message": "Bulk like operation completed",
  "data": {
    "totalRequested": 5,
    "successful": 4,
    "failed": 1,
    "results": [
      {
        "contentId": "68ef790cc8cdffc39fc7114a",
        "contentType": "post",
        "status": "liked",
        "likesCount": 1
      },
      {
        "contentId": "REEL_ID_HERE",
        "contentType": "reel",
        "status": "liked",
        "likesCount": 1
      },
      {
        "contentId": "INVALID_ID",
        "contentType": "post",
        "status": "failed",
        "error": "Content not found"
      }
    ],
    "timestamp": "2025-10-25T11:17:30.123Z"
  }
}
```

### 8.5 Status Check Success Responses

#### Like Status Check Success Response:
```json
{
  "success": true,
  "message": "Like status retrieved successfully",
  "data": {
    "contentId": "68ef790cc8cdffc39fc7114a",
    "contentType": "post",
    "isLiked": true,
    "likesCount": 1,
    "likedAt": "2025-10-25T11:15:30.123Z",
    "user": {
      "userId": "68e8ecfe819e345addde2deb",
      "username": "swayam",
      "fullName": "swayam"
    },
    "content": {
      "title": "Post Title",
      "author": "swayam"
    }
  }
}
```

### 8.6 Success Response Headers

#### Typical Success Response Headers:
```json
{
  "status": 200,
  "statusText": "OK",
  "headers": {
    "content-type": "application/json",
    "content-length": "1234",
    "date": "Sat, 25 Oct 2025 11:17:30 GMT",
    "server": "nginx/1.18.0",
    "x-response-time": "45ms",
    "x-request-id": "req_1234567890"
  }
}
```

### 8.7 Success Response Patterns

#### Common Success Response Structure:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Operation-specific data
  },
  "timestamp": "2025-10-25T11:17:30.123Z",
  "requestId": "req_1234567890"
}
```

#### Success Response with Metadata:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Main response data
  },
  "metadata": {
    "processingTime": "45ms",
    "serverVersion": "1.0.0",
    "apiVersion": "v1",
    "timestamp": "2025-10-25T11:17:30.123Z"
  }
}
```

---

## 9. GET USER'S POSTS WITH COMMENT COUNTS

### 9.1 Get User Profile
**Endpoint**: `GET /api/user/profile/[user_id]`

#### cURL Example:
```bash
curl -X GET "http://103.14.120.163:8081/api/user/profile/USER_ID_HERE" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### 9.2 Get User's Posts with Comment Counts
**Endpoint**: `GET /api/user/posts/[user_id]`

#### Query Parameters:
- `page` (default: 1): Page number
- `limit` (default: 10): Number of posts per page
- `type` (optional): Filter by type (post, reel, video, story)

#### cURL Example for babaji's posts:
```bash
curl -X GET "http://103.14.120.163:8081/api/user/posts/USER_ID_HERE?page=1&limit=100" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

#### Response Example:
```json
{
  "success": true,
  "message": "Posts retrieved successfully",
  "data": {
    "posts": [
      {
        "_id": "POST_ID",
        "content": "Post content...",
        "likesCount": 5,
        "commentsCount": 3,
        "sharesCount": 2,
        "author": {
          "_id": "USER_ID",
          "username": "babaji",
          "fullName": "Babaji Name",
          "avatar": "avatar_url"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalPosts": 50,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

**Note**: Sum the `commentsCount` from all posts to get total comment count for that user.

### 9.3 Get Post Comment Count Specifically
**Endpoint**: `GET /api/posts/interactions?postId=POST_ID&type=comments`

#### cURL Example:
```bash
curl -X GET "http://103.14.120.163:8081/api/posts/interactions?postId=POST_ID_HERE&type=comments" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

#### Response Example:
```json
{
  "success": true,
  "message": "Interactions retrieved successfully",
  "data": {
    "comments": [...],
    "count": 5
  }
}
```

---

## 10. Notes

- **Authentication**: All requests require a valid JWT token
- **Content Types**: Use the correct content type for each API
- **Ownership**: Users can only delete their own content
- **Media Cleanup**: Deletion APIs automatically clean up associated media files
- **Soft Delete**: Some APIs use soft delete (marking as inactive) instead of hard delete
- **Error Handling**: Always check response status and error messages

## 11. API Endpoints Summary

| Operation | Endpoint | Method | Description |
|-----------|----------|--------|-------------|
| Like Content | `/api/likes/like` | POST | Universal like API |
| Unlike Content | `/api/likes/unlike` | DELETE | Universal unlike API |
| Like Post | `/api/posts-management/like` | POST | Post-specific like |
| Unlike Post | `/api/posts-management/unlike` | DELETE | Post-specific unlike |
| Like Reel | `/api/reels-management/like` | POST | Reel-specific like |
| Unlike Reel | `/api/reels-management/unlike` | DELETE | Reel-specific unlike |
| Delete Post | `/api/posts-management/delete` | DELETE | Delete post |
| Delete Reel | `/api/reels-management/delete` | DELETE | Delete reel |
| Delete Story | `/api/stories/enhanced` | DELETE | Delete story |
| Delete Media | `/api/chat/media-management` | DELETE | Delete media file |
| Get User Posts | `/api/user/posts/[user_id]` | GET | Get user's posts with counts |
| Get Post Interactions | `/api/posts/interactions` | GET | Get post comment/like counts |

---

## 12. LIKE MEDIA FILES (User Assets)

### 12.1 Like a Media File

To like a media file that was uploaded by a user, use the **Universal Like API** with `contentType: "userAsset"`.

**Endpoint**: `POST /api/likes/like`

#### Request Body:
```json
{
  "contentType": "userAsset",
  "contentId": "6901a295c4b01d383103026d"
}
```

#### cURL Example:
```bash
curl -X POST "http://103.14.120.163:8081/api/likes/like" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "userAsset",
    "contentId": "6901a295c4b01d383103026d"
  }'
```

#### Successful Response:
```json
{
  "success": true,
  "message": "Content liked successfully",
  "data": {
    "likeId": "like_id_here",
    "contentType": "userAsset",
    "contentId": "6901a295c4b01d383103026d",
    "userId": "68e8ecfe819e345addde2deb",
    "likesCount": 1,
    "user": {
      "userId": "68e8ecfe819e345addde2deb",
      "username": "swayam",
      "fullName": "swayam"
    },
    "content": {
      "mediaId": "6901a295c4b01d383103026d",
      "fileName": "68e8ecfe819e345addde2deb_1761714837213_5z9j9aawy_media.jpg",
      "fileType": "image",
      "publicUrl": "http://103.14.120.163:8081/uploads/users/68e8ecfe819e345addde2deb/images/68e8ecfe819e345addde2deb_1761714837213_5z9j9aawy_media.jpg"
    }
  }
}
```

### 12.2 Unlike a Media File

**Endpoint**: `DELETE /api/likes/unlike`

#### cURL Example:
```bash
curl -X DELETE "http://103.14.120.163:8081/api/likes/unlike" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "userAsset",
    "contentId": "6901a295c4b01d383103026d"
  }'
```

#### Successful Response:
```json
{
  "success": true,
  "message": "Content unliked successfully",
  "data": {
    "contentType": "userAsset",
    "contentId": "6901a295c4b01d383103026d",
    "userId": "68e8ecfe819e345addde2deb",
    "likesCount": 0,
    "user": {
      "userId": "68e8ecfe819e345addde2deb",
      "username": "swayam",
      "fullName": "swayam"
    }
  }
}
```

### 12.3 Check Like Status for Media

**Endpoint**: `GET /api/likes/status?contentType=userAsset&contentId=6901a295c4b01d383103026d`

#### cURL Example:
```bash
curl -X GET "http://103.14.120.163:8081/api/likes/status?contentType=userAsset&contentId=6901a295c4b01d383103026d" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

#### Response Example:
```json
{
  "success": true,
  "data": {
    "contentId": "6901a295c4b01d383103026d",
    "contentType": "userAsset",
    "isLiked": true,
    "likedAt": "2025-10-29T05:15:30.123Z"
  }
}
```

### 12.4 Get Like Count for Media

**Endpoint**: `GET /api/likes/count?contentType=userAsset&contentId=6901a295c4b01d383103026d`

#### cURL Example:
```bash
curl -X GET "http://103.14.120.163:8081/api/likes/count?contentType=userAsset&contentId=6901a295c4b01d383103026d" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

#### Response Example:
```json
{
  "success": true,
  "data": {
    "contentType": "userAsset",
    "contentId": "6901a295c4b01d383103026d",
    "likesCount": 5,
    "recentLikes": [
      {
        "userId": {
          "username": "user1",
          "fullName": "User One",
          "avatar": "avatar_url"
        },
        "createdAt": "2025-10-29T05:15:30.123Z"
      }
    ]
  }
}
```

### 12.5 PowerShell Example (Windows)

#### Like Media File:
```powershell
$body = @{
    contentType = "userAsset"
    contentId = "6901a295c4b01d383103026d"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://103.14.120.163:8081/api/likes/like" `
  -Method POST `
  -Headers @{
    "Authorization"="Bearer YOUR_TOKEN_HERE"
    "Content-Type"="application/json"
  } `
  -Body $body

$response | ConvertTo-Json -Depth 10
```

#### Unlike Media File:
```powershell
$body = @{
    contentType = "userAsset"
    contentId = "6901a295c4b01d383103026d"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://103.14.120.163:8081/api/likes/unlike" `
  -Method DELETE `
  -Headers @{
    "Authorization"="Bearer YOUR_TOKEN_HERE"
    "Content-Type"="application/json"
  } `
  -Body $body

$response | ConvertTo-Json -Depth 10
```

### 12.6 JavaScript/Fetch Example

```javascript
// Like Media File
const likeMedia = async (mediaId) => {
  const response = await fetch('http://103.14.120.163:8081/api/likes/like', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_TOKEN_HERE',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contentType: 'userAsset',
      contentId: mediaId
    })
  });
  
  const data = await response.json();
  console.log(data);
  return data;
};

// Unlike Media File
const unlikeMedia = async (mediaId) => {
  const response = await fetch('http://103.14.120.163:8081/api/likes/unlike', {
    method: 'DELETE',
    headers: {
      'Authorization': 'Bearer YOUR_TOKEN_HERE',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contentType: 'userAsset',
      contentId: mediaId
    })
  });
  
  const data = await response.json();
  console.log(data);
  return data;
};

// Usage
likeMedia('6901a295c4b01d383103026d');
```

---

## 13. Quick Reference Card

### Complete Example: Like Media from Your Logs

Based on your media logs, here's the exact command to like the media:

```bash
curl -X POST "http://103.14.120.163:8081/api/likes/like" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "userAsset",
    "contentId": "6901a295c4b01d383103026d"
  }'
```

This will like the media file with ID `6901a295c4b01d383103026d` uploaded by user `swayam` (ID: `68e8ecfe819e345addde2deb`).

---

## 14. Troubleshooting

### Common Issues:

1. **"Content not found"**: Ensure the mediaId exists in the database
2. **"Authentication required"**: Check your JWT token is valid
3. **"You have already liked this content"**: You can only like once per media
4. **"Invalid content type"**: Use `"userAsset"` for media files

### Debug Commands:

```bash
# Check if media exists
curl -X GET "http://103.14.120.163:8081/api/user/assets/USER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Check like status
curl -X GET "http://103.14.120.163:8081/api/likes/status?contentType=userAsset&contentId=6901a295c4b01d383103026d" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

**End of Documentation**