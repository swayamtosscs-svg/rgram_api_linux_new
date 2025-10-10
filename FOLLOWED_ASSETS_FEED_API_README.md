# 📱 Followed Users Assets Feed API

## 🎯 **Overview**

This API provides a comprehensive feed system that shows posts from users you follow, with detailed asset information from the `public/assets` folder. It's perfect for creating a social media feed that displays posts with images and videos from followed users.

## 🚀 **API Endpoints**

### **1. Followed Users Assets Feed**
```
GET /api/feed/followed-assets
```
Shows posts ONLY from users you follow (accepted follow requests).

### **2. General Assets Feed**
```
GET /api/feed/assets
```
Shows posts with assets from followed users first, then public users if you're not following anyone.

## ✨ **Key Features**

- 🔐 **Authentication Required**: JWT token authentication
- 👥 **Follow-Based**: Shows posts from users you follow
- 📁 **Asset Integration**: Processes images and videos from `public/assets` folder
- 📊 **Detailed Statistics**: Comprehensive asset and engagement metrics
- 🔍 **File Validation**: Checks if local assets exist and provides file info
- 📱 **Smart Filtering**: Prioritizes followed users, falls back to public users
- 📄 **Pagination**: Handle large numbers of posts efficiently

## 📁 **Asset Processing**

The API processes two types of assets:

### **Local Assets** (`/assets/` folder)
- ✅ **File Validation**: Checks if files exist on disk
- 📏 **Size Calculation**: Provides actual file sizes
- 📅 **Last Modified**: Shows when files were last updated
- 🔗 **Direct URLs**: Ready-to-use URLs for frontend

### **External Assets** (Cloudinary, etc.)
- 🌐 **External URLs**: Handles external media URLs
- ✅ **Always Available**: Assumes external URLs are valid
- 🔗 **Direct Access**: Ready-to-use URLs

## 📤 **API Usage**

### **Headers**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

### **Query Parameters**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Posts per page (default: 10)

### **Example Request**
```bash
curl -X GET "http://localhost:3000/api/feed/followed-assets?page=1&limit=5" \
  -H "Authorization: Bearer your_jwt_token"
```

## 📋 **Response Structure**

### **Success Response (200)**
```json
{
  "success": true,
  "message": "Followed users feed with assets retrieved successfully",
  "data": {
    "posts": [
      {
        "_id": "post_id",
        "author": {
          "_id": "user_id",
          "username": "username",
          "fullName": "Full Name",
          "avatar": "avatar_url",
          "isPrivate": false,
          "religion": "Hindu"
        },
        "content": "Post content text",
        "type": "post",
        "category": "general",
        "processedImages": [
          {
            "url": "/assets/user_id/images/image.jpg",
            "type": "image",
            "exists": true,
            "size": 1024000,
            "lastModified": "2024-01-01T00:00:00.000Z",
            "isLocal": true
          }
        ],
        "processedVideos": [
          {
            "url": "/assets/user_id/videos/video.mp4",
            "type": "video",
            "exists": true,
            "size": 5000000,
            "lastModified": "2024-01-01T00:00:00.000Z",
            "isLocal": true
          }
        ],
        "totalAssets": 2,
        "totalAssetSize": 6024000,
        "hasAssets": true,
        "visibilityReason": "following_user",
        "canInteract": true,
        "likesCount": 10,
        "commentsCount": 5,
        "sharesCount": 2,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalPosts": 50,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "statistics": {
      "totalFollowing": 10,
      "postsFromFollowing": 5,
      "totalAssets": 15,
      "totalAssetSize": 50000000,
      "postsWithAssets": 4,
      "averageAssetsPerPost": "3.75"
    },
    "followingUsers": [
      {
        "_id": "user_id",
        "username": "username",
        "fullName": "Full Name",
        "avatar": "avatar_url",
        "isPrivate": false,
        "religion": "Hindu"
      }
    ],
    "userInfo": {
      "userId": "current_user_id",
      "username": "current_username",
      "religion": "Hindu",
      "isPrivate": false
    }
  }
}
```

### **No Followed Users Response**
```json
{
  "success": true,
  "message": "No followed users found. Follow some users to see their posts!",
  "data": {
    "posts": [],
    "pagination": {
      "currentPage": 1,
      "totalPages": 0,
      "totalPosts": 0,
      "hasNextPage": false,
      "hasPrevPage": false
    },
    "statistics": {
      "totalFollowing": 0,
      "postsFromFollowing": 0,
      "totalAssets": 0
    }
  }
}
```

## 🔧 **Asset Processing Details**

### **Local Asset Processing**
```javascript
// For each image/video URL starting with /assets/
{
  "url": "/assets/user_id/images/image.jpg",
  "type": "image",
  "exists": true,           // File exists on disk
  "size": 1024000,         // File size in bytes
  "lastModified": "2024-01-01T00:00:00.000Z",
  "isLocal": true
}
```

### **External Asset Processing**
```javascript
// For external URLs (Cloudinary, etc.)
{
  "url": "https://res.cloudinary.com/image.jpg",
  "type": "image",
  "exists": true,           // Assumed to exist
  "size": 0,               // Size not available
  "lastModified": null,
  "isExternal": true
}
```

## 📊 **Statistics Explained**

- **totalFollowing**: Number of users you follow
- **postsFromFollowing**: Number of posts from followed users
- **totalAssets**: Total number of images and videos
- **totalAssetSize**: Total size of all assets in bytes
- **postsWithAssets**: Number of posts that have images or videos
- **averageAssetsPerPost**: Average assets per post (rounded to 2 decimals)

## 🎯 **Use Cases**

1. **Social Media Feed**: Display posts from followed users with their media
2. **Asset Management**: Track and validate user-uploaded assets
3. **Content Discovery**: Find posts with specific types of media
4. **Storage Monitoring**: Monitor asset storage usage
5. **Performance Optimization**: Identify large files for optimization

## 🔍 **Error Handling**

### **Authentication Errors**
- `401`: Authentication required
- `401`: Invalid token

### **User Errors**
- `404`: User not found

### **Server Errors**
- `500`: Internal server error

## 🚀 **Getting Started**

1. **Ensure Authentication**: Get a valid JWT token
2. **Follow Users**: Follow some users to see their posts
3. **Create Posts**: Create posts with images/videos using the assets API
4. **Call Feed API**: Use the feed endpoints to get posts with assets

## 📝 **Example Integration**

```javascript
// Get followed users feed with assets
const response = await fetch('/api/feed/followed-assets?page=1&limit=10', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();

// Display posts with assets
data.data.posts.forEach(post => {
  console.log(`Post by ${post.author.username}:`);
  console.log(`Content: ${post.content}`);
  console.log(`Images: ${post.processedImages.length}`);
  console.log(`Videos: ${post.processedVideos.length}`);
  
  // Display images
  post.processedImages.forEach(img => {
    if (img.exists) {
      console.log(`Image: ${img.url} (${img.size} bytes)`);
    }
  });
});
```

## 🎉 **Success!**

Your followed users assets feed API is now ready to use! It will show posts from users you follow, with detailed information about their images and videos stored in the `public/assets` folder.
