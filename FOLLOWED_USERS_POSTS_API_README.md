# Followed Users Posts API

This API endpoint allows authenticated users to retrieve posts from users they follow, with full Cloudinary integration for image and video handling.

## Overview

The Followed Users Posts API provides a personalized feed showing posts exclusively from users that the authenticated user follows. This is different from the general feed API as it:

- **Excludes the user's own posts** - Only shows posts from followed users
- **Includes only accepted follows** - Respects the follow request system
- **Provides Cloudinary URLs** - All media URLs are properly formatted for Cloudinary
- **Supports pagination** - Efficient loading of large numbers of posts
- **Includes metadata** - Additional information for frontend optimization

## API Endpoint

**URL:** `GET /api/posts/followed-users`

**Authentication:** Required (Bearer Token)

## Request Parameters

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 10 | Number of posts per page (max recommended: 20) |

## Response Format

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Posts from followed users retrieved successfully",
  "data": {
    "posts": [
      {
        "_id": "post_id_here",
        "author": {
          "_id": "user_id_here",
          "username": "followed_user",
          "fullName": "Followed User Name",
          "avatar": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/avatar.jpg",
          "isPrivate": false,
          "followersCount": 100,
          "followingCount": 50,
          "postsCount": 25
        },
        "content": "This is a post from a followed user",
        "images": [
          "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/post_image.jpg"
        ],
        "videos": [],
        "type": "post",
        "likes": [],
        "likesCount": 0,
        "comments": [],
        "commentsCount": 0,
        "shares": [],
        "sharesCount": 0,
        "saves": [],
        "savesCount": 0,
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
        "_metadata": {
          "hasImages": true,
          "hasVideos": false,
          "hasContent": true,
          "totalMediaCount": 1
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalPosts": 50,
      "hasNextPage": true,
      "hasPrevPage": false,
      "limit": 10
    },
    "_info": {
      "followingCount": 10,
      "requestedBy": "current_user_id",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Empty Response (No Follows)
```json
{
  "success": true,
  "message": "No followed users found",
  "data": {
    "posts": [],
    "pagination": {
      "currentPage": 1,
      "totalPages": 0,
      "totalPosts": 0,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 401 Invalid Token
```json
{
  "success": false,
  "message": "Invalid token"
}
```

### 405 Method Not Allowed
```json
{
  "success": false,
  "message": "Method not allowed"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details (development only)"
}
```

## Cloudinary Integration

### Image URLs
All image URLs in the response are properly formatted Cloudinary URLs:
- **Format:** `https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{format}`
- **Optimization:** Images are automatically optimized for web delivery
- **Transformation:** Supports Cloudinary transformations for different sizes

### Video URLs
Video URLs follow the same Cloudinary pattern:
- **Format:** `https://res.cloudinary.com/{cloud_name}/video/upload/v{version}/{public_id}.{format}`
- **Streaming:** Supports adaptive streaming for better performance

### Metadata
Each post includes `_metadata` object with:
- `hasImages`: Boolean indicating if post has images
- `hasVideos`: Boolean indicating if post has videos
- `hasContent`: Boolean indicating if post has text content
- `totalMediaCount`: Total number of media files (images + videos)

## Usage Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

async function getFollowedUsersPosts(token, page = 1, limit = 10) {
  try {
    const response = await axios.get('/api/posts/followed-users', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      params: { page, limit }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching followed users posts:', error.response?.data);
    throw error;
  }
}

// Usage
getFollowedUsersPosts('your_jwt_token', 1, 10)
  .then(data => console.log('Posts:', data.data.posts))
  .catch(error => console.error('Error:', error));
```

### React/Next.js
```jsx
import { useState, useEffect } from 'react';

function FollowedUsersFeed({ token }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        const response = await fetch(`/api/posts/followed-users?page=${page}&limit=10`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        if (data.success) {
          setPosts(data.data.posts);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [page, token]);

  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {posts.map(post => (
        <div key={post._id} className="post">
          <div className="post-header">
            <img src={post.author.avatar} alt={post.author.username} />
            <span>{post.author.username}</span>
          </div>
          {post.content && <p>{post.content}</p>}
          {post._metadata.hasImages && (
            <div className="post-images">
              {post.images.map((image, index) => (
                <img key={index} src={image} alt={`Post image ${index + 1}`} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

### cURL
```bash
# Get first page of followed users posts
curl -X GET "http://localhost:3000/api/posts/followed-users?page=1&limit=10" \
  -H "Authorization: Bearer your_jwt_token_here" \
  -H "Content-Type: application/json"

# Get second page with smaller limit
curl -X GET "http://localhost:3000/api/posts/followed-users?page=2&limit=5" \
  -H "Authorization: Bearer your_jwt_token_here" \
  -H "Content-Type: application/json"
```

## Testing

### Test Script
Use the provided test script to verify the API functionality:
```bash
# Update the token in test-followed-users-posts.js
node test-followed-users-posts.js
```

### Postman Collection
Import the `followed-users-posts-postman-collection.json` file into Postman for easy testing.

## Performance Considerations

1. **Pagination**: Always use pagination to avoid loading too many posts at once
2. **Limit**: Recommended limit is 10-20 posts per request
3. **Caching**: Consider implementing client-side caching for better performance
4. **Lazy Loading**: Load images and videos only when they come into view

## Security Features

1. **Authentication Required**: All requests must include a valid JWT token
2. **User Isolation**: Users can only see posts from users they follow
3. **Follow Status**: Only shows posts from users with accepted follow requests
4. **Active Posts Only**: Only returns active (non-deleted) posts

## Database Queries

The API performs the following database operations:
1. Finds all accepted follow relationships for the authenticated user
2. Retrieves posts from followed users only
3. Populates author information and engagement data
4. Sorts by creation date (newest first)
5. Applies pagination

## Related APIs

- `/api/posts/feed` - General feed including own posts
- `/api/follow/[user_id]` - Follow/unfollow users
- `/api/follow-request/send` - Send follow requests
- `/api/follow-request/accept` - Accept follow requests

## Support

For issues or questions regarding this API, please check:
1. Authentication token validity
2. User follow relationships
3. Network connectivity
4. Server logs for detailed error information


