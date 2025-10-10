# Post Share API - CURL Commands

## Prerequisites
Replace `<YOUR_JWT_TOKEN>` with your actual JWT token obtained from login/signup.

## 1. Share/Unshare Any Post

### Share a Text Post
```bash
curl -X POST "http://localhost:3000/api/posts/share" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "postId": "POST_ID_HERE",
    "shareType": "general"
  }'
```

### Share an Image Post
```bash
curl -X POST "http://localhost:3000/api/posts/share" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "postId": "IMAGE_POST_ID_HERE",
    "shareType": "image"
  }'
```

### Share a Video/Reel Post
```bash
curl -X POST "http://localhost:3000/api/posts/share" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "postId": "VIDEO_POST_ID_HERE",
    "shareType": "video"
  }'
```

### Share Any Post (Minimal)
```bash
curl -X POST "http://localhost:3000/api/posts/share" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "postId": "POST_ID_HERE"
  }'
```

### Example with Real Data
```bash
curl -X POST "http://localhost:3000/api/posts/share" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "postId": "507f1f77bcf86cd799439011",
    "shareType": "entertainment"
  }'
```

---

## 2. Get Shareable Posts

### Get All Shareable Posts (Default)
```bash
curl -X GET "http://localhost:3000/api/posts/shareable" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### Get Shareable Posts with Pagination
```bash
curl -X GET "http://localhost:3000/api/posts/shareable?page=1&limit=10" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### Get Only Reel Posts
```bash
curl -X GET "http://localhost:3000/api/posts/shareable?type=reel" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### Get Only Video Posts
```bash
curl -X GET "http://localhost:3000/api/posts/shareable?type=video" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### Get Posts by Category
```bash
curl -X GET "http://localhost:3000/api/posts/shareable?category=entertainment" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### Get Posts by Religion
```bash
curl -X GET "http://localhost:3000/api/posts/shareable?religion=hindu" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### Get Posts by Specific User
```bash
curl -X GET "http://localhost:3000/api/posts/shareable?userId=USER_ID_HERE" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### Get Posts with Multiple Filters
```bash
curl -X GET "http://localhost:3000/api/posts/shareable?type=reel&category=entertainment&religion=hindu&page=1&limit=5" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### Sort Posts by Different Fields
```bash
# Sort by share count (descending)
curl -X GET "http://localhost:3000/api/posts/shareable?sortBy=shareCount&sortOrder=desc" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"

# Sort by like count (ascending)
curl -X GET "http://localhost:3000/api/posts/shareable?sortBy=likeCount&sortOrder=asc" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"

# Sort by creation date (newest first)
curl -X GET "http://localhost:3000/api/posts/shareable?sortBy=createdAt&sortOrder=desc" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

---

## 3. Get Shareable Content

### Get All Shareable Content (Default)
```bash
curl -X GET "http://localhost:3000/api/posts/shareable-content" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### Get Only Text Posts
```bash
curl -X GET "http://localhost:3000/api/posts/shareable-content?contentType=text" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### Get Only Image Posts
```bash
curl -X GET "http://localhost:3000/api/posts/shareable-content?contentType=image" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### Get Only Video Posts
```bash
curl -X GET "http://localhost:3000/api/posts/shareable-content?contentType=video" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### Get Content by Category and Religion
```bash
curl -X GET "http://localhost:3000/api/posts/shareable-content?category=entertainment&religion=hindu&limit=20" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### Get Mixed Content with Filters
```bash
curl -X GET "http://localhost:3000/api/posts/shareable-content?type=post&category=entertainment&religion=hindu&limit=30" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

---

## 4. Get Reel Video IDs

### Get Reel Video IDs (Default)
```bash
curl -X GET "http://localhost:3000/api/posts/reel-video-ids" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### Get Limited Number of Video IDs
```bash
curl -X GET "http://localhost:3000/api/posts/reel-video-ids?limit=20" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### Get Video IDs Only (Not Reels)
```bash
curl -X GET "http://localhost:3000/api/posts/reel-video-ids?type=video" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### Get Video IDs by Category
```bash
curl -X GET "http://localhost:3000/api/posts/reel-video-ids?category=entertainment" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### Get Video IDs by Religion
```bash
curl -X GET "http://localhost:3000/api/posts/reel-video-ids?religion=hindu" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### Get Video IDs with Multiple Filters
```bash
curl -X GET "http://localhost:3000/api/posts/reel-video-ids?type=reel&category=entertainment&religion=hindu&limit=30" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

---

## 4. Production Server Examples

### For Production Server (Replace with your domain)
```bash
# Share a post
curl -X POST "https://your-domain.com/api/posts/share" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "postId": "POST_ID_HERE",
    "shareType": "general"
  }'

# Get shareable posts
curl -X GET "https://your-domain.com/api/posts/shareable?type=reel&limit=10" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"

# Get reel video IDs
curl -X GET "https://your-domain.com/api/posts/reel-video-ids?limit=20" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

---

## 5. Testing Commands

### Test Authentication (Should return 401)
```bash
curl -X POST "http://localhost:3000/api/posts/share" \
  -H "Content-Type: application/json" \
  -d '{
    "postId": "test_id"
  }'
```

### Test Invalid Post ID (Should return 404)
```bash
curl -X POST "http://localhost:3000/api/posts/share" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "postId": "invalid_post_id"
  }'
```

### Test Method Not Allowed (Should return 405)
```bash
curl -X PUT "http://localhost:3000/api/posts/share" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "postId": "test_id"
  }'
```

---

## 6. Response Examples

### Successful Share Response
```json
{
  "success": true,
  "message": "Post shared successfully",
  "data": {
    "post": {
      "_id": "507f1f77bcf86cd799439011",
      "content": "Amazing reel content!",
      "type": "reel",
      "videos": ["https://example.com/video1.mp4"],
      "shareCount": 1,
      "likeCount": 5
    },
    "action": "shared",
    "isShared": true,
    "shareCount": 1,
    "videoId": "https://example.com/video1.mp4",
    "videoIds": ["https://example.com/video1.mp4"]
  }
}
```

### Shareable Posts Response
```json
{
  "success": true,
  "message": "Shareable reel video posts retrieved successfully",
  "data": {
    "posts": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "type": "reel",
        "videos": ["https://example.com/video1.mp4"],
        "primaryVideoId": "https://example.com/video1.mp4",
        "shareCount": 3,
        "isSharedByUser": false
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCount": 100
    }
  }
}
```

### Reel Video IDs Response
```json
{
  "success": true,
  "message": "Reel video IDs retrieved successfully",
  "data": {
    "videoData": [
      {
        "postId": "507f1f77bcf86cd799439011",
        "videoIds": ["https://example.com/video1.mp4"],
        "primaryVideoId": "https://example.com/video1.mp4",
        "title": "Amazing Reel",
        "shareCount": 3
      }
    ],
    "totalCount": 50,
    "returnedCount": 20
  }
}
```

---

## 7. Error Response Examples

### Authentication Error
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### Post Not Found Error
```json
{
  "success": false,
  "message": "Post not found"
}
```

### Invalid Post Type Error
```json
{
  "success": false,
  "message": "Only reel and video posts can be shared"
}
```

---

## 8. Track Where Shares Go

### Get Posts Shared by Current User
```bash
curl -X GET "http://localhost:3000/api/posts/my-shares" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### Get Posts Shared by User with Pagination
```bash
curl -X GET "http://localhost:3000/api/posts/my-shares?page=1&limit=10" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### Get Posts Shared by User (Filtered by Type)
```bash
curl -X GET "http://localhost:3000/api/posts/my-shares?type=reel&category=entertainment" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### Get Users Who Shared a Specific Post
```bash
curl -X GET "http://localhost:3000/api/posts/sharing-details?postId=POST_ID_HERE" \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

### Example: Get Sharing Details for a Post
```bash
curl -X GET "http://localhost:3000/api/posts/sharing-details?postId=507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 9. Quick Test Script

Create a test script to verify all endpoints:

```bash
#!/bin/bash

# Set your token here
TOKEN="YOUR_JWT_TOKEN_HERE"
BASE_URL="http://localhost:3000"

echo "Testing Post Reel Video Share APIs..."

# Test 1: Get shareable posts
echo "1. Testing get shareable posts..."
curl -s -X GET "$BASE_URL/api/posts/shareable?limit=5" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "\n2. Testing get reel video IDs..."
curl -s -X GET "$BASE_URL/api/posts/reel-video-ids?limit=5" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "\n3. Testing share post (replace POST_ID with actual ID)..."
curl -s -X POST "$BASE_URL/api/posts/share" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"postId": "POST_ID_HERE"}' | jq '.'

echo "Testing complete!"
```

Save this as `test-share-api.sh` and make it executable:
```bash
chmod +x test-share-api.sh
./test-share-api.sh
```

---

## Notes:
- Replace `<YOUR_JWT_TOKEN>` with your actual JWT token
- Replace `POST_ID_HERE` with actual post IDs from your database
- Replace `USER_ID_HERE` with actual user IDs
- For production, replace `localhost:3000` with your actual domain
- All endpoints require authentication except for testing error cases
- Use `jq` for pretty JSON formatting in responses
