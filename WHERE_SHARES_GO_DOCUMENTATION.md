# Where Do Shared Posts Go? - Share Tracking Documentation

## Overview
When a user shares a post, the share information is stored in the **Post model** in the database. Here's exactly where and how shared posts are tracked:

## 📍 **Where Shares Are Stored**

### 1. In the Post Document
```javascript
// Post Schema (lib/models/Post.ts)
{
  _id: "post_id",
  content: "post content",
  shares: [ObjectId, ObjectId, ObjectId], // Array of user IDs who shared
  sharesCount: 3, // Total number of shares
  // ... other fields
}
```

### 2. Database Structure
- **Collection**: `posts`
- **Field**: `shares` (Array of User ObjectIds)
- **Count Field**: `sharesCount` (Number)
- **Reference**: Each share ID references a User document

## 🔍 **How to Track Shared Posts**

### 1. Get Posts Shared by Current User
**Endpoint:** `GET /api/posts/my-shares`

**Description:** Shows all posts that the current user has shared.

**CURL Example:**
```bash
curl -X GET "http://localhost:3000/api/posts/my-shares?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "User shared posts retrieved successfully",
  "data": {
    "sharedPosts": [
      {
        "_id": "post_id",
        "content": "Shared post content",
        "type": "post",
        "author": {
          "username": "original_author",
          "fullName": "Original Author"
        },
        "shareCount": 5,
        "isSharedByUser": true,
        "sharedAt": "2024-01-01T00:00:00.000Z",
        "videoIds": ["video_url"],
        "imageIds": ["image_url"]
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalCount": 25
    },
    "sharingStats": {
      "totalShared": 25,
      "byType": {
        "post": 10,
        "reel": 8,
        "video": 7
      },
      "categories": [
        { "_id": "entertainment", "count": 12 },
        { "_id": "general", "count": 8 }
      ]
    }
  }
}
```

### 2. Get Users Who Shared a Specific Post
**Endpoint:** `GET /api/posts/sharing-details?postId=POST_ID`

**Description:** Shows all users who shared a specific post.

**CURL Example:**
```bash
curl -X GET "http://localhost:3000/api/posts/sharing-details?postId=507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Post sharing details retrieved successfully",
  "data": {
    "post": {
      "_id": "post_id",
      "content": "Original post content",
      "type": "reel",
      "author": {
        "username": "original_author",
        "fullName": "Original Author"
      }
    },
    "sharedUsers": [
      {
        "_id": "user_id_1",
        "username": "sharer1",
        "fullName": "User One",
        "avatar": "avatar_url",
        "isCurrentUser": false
      },
      {
        "_id": "user_id_2", 
        "username": "sharer2",
        "fullName": "User Two",
        "avatar": "avatar_url",
        "isCurrentUser": true
      }
    ],
    "sharingStats": {
      "totalShares": 2,
      "totalLikes": 10,
      "totalComments": 3,
      "shareToLikeRatio": "0.20",
      "shareToCommentRatio": "0.67"
    },
    "currentUserShared": true,
    "shareCount": 2
  }
}
```

## 🗄️ **Database Queries**

### 1. Find Posts Shared by User
```javascript
// MongoDB Query
db.posts.find({
  shares: ObjectId("user_id"),
  isActive: true
})
```

### 2. Find Users Who Shared a Post
```javascript
// MongoDB Query
db.posts.findOne(
  { _id: ObjectId("post_id") },
  { shares: 1, sharesCount: 1 }
)
```

### 3. Get Share Statistics
```javascript
// MongoDB Aggregation
db.posts.aggregate([
  { $match: { shares: ObjectId("user_id"), isActive: true } },
  { $group: { _id: "$type", count: { $sum: 1 } } }
])
```

## 📊 **Share Tracking Features**

### 1. Share Count Tracking
- **Automatic**: `sharesCount` is automatically updated when shares are added/removed
- **Real-time**: Count reflects current number of shares
- **Accurate**: Uses MongoDB `$addToSet` and `$pull` operations

### 2. User Share Status
- **Check if shared**: `isSharedByUser` flag in responses
- **Toggle sharing**: Share/Unshare functionality
- **Prevent duplicates**: Uses `$addToSet` to prevent duplicate shares

### 3. Share Analytics
- **Total shares**: Count of all shares by user
- **By type**: Shares broken down by post type (post, reel, video)
- **By category**: Shares grouped by category
- **By religion**: Shares grouped by religion
- **Ratios**: Share-to-like and share-to-comment ratios

## 🔄 **Share Lifecycle**

### 1. When User Shares a Post
```javascript
// What happens in the database:
{
  $addToSet: { shares: userId }, // Add user ID to shares array
  $inc: { sharesCount: 1 }       // Increment share count
}
```

### 2. When User Unshares a Post
```javascript
// What happens in the database:
{
  $pull: { shares: userId },     // Remove user ID from shares array
  $inc: { sharesCount: -1 }      // Decrement share count
}
```

### 3. Share Data Structure
```javascript
// Before sharing:
{
  shares: [],
  sharesCount: 0
}

// After user shares:
{
  shares: [ObjectId("user_id")],
  sharesCount: 1
}

// After multiple users share:
{
  shares: [ObjectId("user1"), ObjectId("user2"), ObjectId("user3")],
  sharesCount: 3
}
```

## 🎯 **Use Cases**

### 1. User's Shared Posts Feed
- Show posts that user has shared
- Filter by type, category, religion
- Pagination support

### 2. Post Sharing Analytics
- See who shared a specific post
- Track sharing trends
- Calculate engagement ratios

### 3. Social Features
- Share notifications
- Share recommendations
- Viral content detection

## 📱 **Frontend Integration**

### 1. Check if User Shared Post
```javascript
const checkShareStatus = async (postId) => {
  const response = await fetch(`/api/posts/sharing-details?postId=${postId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  return data.data.currentUserShared;
};
```

### 2. Get User's Shared Posts
```javascript
const getMySharedPosts = async (page = 1) => {
  const response = await fetch(`/api/posts/my-shares?page=${page}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  return data.data.sharedPosts;
};
```

### 3. Share/Unshare Post
```javascript
const toggleShare = async (postId) => {
  const response = await fetch('/api/posts/share', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ postId })
  });
  const data = await response.json();
  return data.data.action; // 'shared' or 'unshared'
};
```

## 🔍 **Monitoring Shares**

### 1. Real-time Share Count
- Share count updates immediately
- No caching delays
- Accurate reflection of current state

### 2. Share History
- Track when posts were shared
- Monitor sharing patterns
- Identify trending content

### 3. Share Analytics
- Most shared posts
- Most active sharers
- Share-to-engagement ratios

## 📝 **Summary**

**Shares are stored in the Post document itself:**
- ✅ `shares` array contains user IDs who shared
- ✅ `sharesCount` tracks total number of shares
- ✅ Automatic count updates on share/unshare
- ✅ Full user details available via population
- ✅ Comprehensive analytics and filtering
- ✅ Real-time share status tracking

**Available APIs:**
- ✅ `/api/posts/share` - Share/Unshare posts
- ✅ `/api/posts/my-shares` - Get user's shared posts
- ✅ `/api/posts/sharing-details` - Get post sharing details
- ✅ `/api/posts/shareable` - Get all shareable posts
- ✅ `/api/posts/shareable-content` - Get shareable content with filters

The share system is fully integrated and provides complete tracking of where shared posts go and who shared them! 🚀
