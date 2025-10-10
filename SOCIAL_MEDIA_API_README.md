# Social Media API Documentation

A comprehensive social media API with friend requests, follow/unfollow functionality, home feed, and notifications.

## Features

- ✅ User Authentication with JWT
- ✅ Friend Request System (Send, Accept, Reject)
- ✅ Follow/Unfollow System
- ✅ Home Feed with Followed Users' Posts
- ✅ Cloudinary Media Upload Integration
- ✅ Real-time Notifications
- ✅ Post Creation with Images/Videos
- ✅ Friends List Management

## API Endpoints

### Authentication
All endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### 1. Friend Request System

#### Send Friend Request
```http
POST /api/friend-request/send
Content-Type: application/json

{
  "senderId": "sender_user_id_here",
  "recipientId": "recipient_user_id_here",
  "message": "Optional message with request"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Friend request sent successfully",
  "data": {
    "friendRequest": {
      "_id": "request_id",
      "sender": {
        "_id": "sender_id",
        "username": "sender_username",
        "fullName": "Sender Name",
        "avatar": "avatar_url"
      },
      "recipient": {
        "_id": "recipient_id",
        "username": "recipient_username",
        "fullName": "Recipient Name",
        "avatar": "avatar_url"
      },
      "status": "pending",
      "message": "Optional message",
      "sentAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### Accept Friend Request
```http
POST /api/friend-request/accept
Content-Type: application/json

{
  "requestId": "friend_request_id",
  "senderId": "sender_user_id",
  "recipientId": "recipient_user_id"
}
```

#### Reject Friend Request
```http
POST /api/friend-request/reject
Content-Type: application/json

{
  "requestId": "friend_request_id",
  "senderId": "sender_user_id",
  "recipientId": "recipient_user_id"
}
```

#### List Friend Requests
```http
GET /api/friend-request/list?type=received&status=pending&page=1&limit=10
```

**Query Parameters:**
- `type`: `received` or `sent`
- `status`: `pending`, `accepted`, `rejected` (optional)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

### 2. Follow/Unfollow System

#### Follow User
```http
POST /api/follow/{user_id}
```

#### Unfollow User
```http
DELETE /api/follow/{user_id}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully followed user"
}
```

### 3. Friends List

#### Get Friends List
```http
GET /api/friends/list?page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "message": "Friends list retrieved successfully",
  "data": {
    "friends": [
      {
        "_id": "friend_id",
        "username": "friend_username",
        "fullName": "Friend Name",
        "avatar": "avatar_url",
        "friendshipDate": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalFriends": 100,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### 4. Home Feed

#### Get Home Feed (Posts from Followed Users)
```http
GET /api/feed/home?page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "message": "Home feed retrieved",
  "data": {
    "posts": [
      {
        "_id": "post_id",
        "content": "Post content",
        "images": ["image_url_1", "image_url_2"],
        "videos": ["video_url"],
        "author": {
          "_id": "author_id",
          "username": "author_username",
          "fullName": "Author Name",
          "avatar": "avatar_url",
          "religion": "Hindu"
        },
        "likesCount": 10,
        "commentsCount": 5,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalPosts": 100,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### 5. Post Creation

#### Create Post with Media
```http
POST /api/posts/create
Content-Type: application/json

{
  "content": "Post content here",
  "images": [
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
    "https://example.com/image.jpg"
  ],
  "videos": [
    "data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW...",
    "https://example.com/video.mp4"
  ],
  "type": "post",
  "title": "Optional title",
  "description": "Optional description",
  "category": "general",
  "religion": "Hindu"
}
```

**Media Types Supported:**
- Images: JPEG, PNG, GIF, WebP
- Videos: MP4, MOV, AVI, WebM
- Base64 encoded files are automatically uploaded to Cloudinary
- Direct URLs are accepted as-is

### 6. Notifications

#### Get Notifications
```http
GET /api/notifications/list?page=1&limit=20&unreadOnly=false
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `unreadOnly`: Show only unread notifications (default: false)

**Response:**
```json
{
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": {
    "notifications": [
      {
        "_id": "notification_id",
        "type": "friend_request",
        "sender": {
          "_id": "sender_id",
          "username": "sender_username",
          "fullName": "Sender Name",
          "avatar": "avatar_url"
        },
        "isRead": false,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "unreadCount": 5,
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalNotifications": 50,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

#### Mark Notification as Read
```http
POST /api/notifications/mark-read
Content-Type: application/json

{
  "notificationId": "notification_id"
}
```

#### Mark All Notifications as Read
```http
POST /api/notifications/mark-read
Content-Type: application/json

{
  "markAll": true
}
```

## Notification Types

- `follow`: When someone follows you
- `friend_request`: When someone sends you a friend request
- `friend_request_accepted`: When someone accepts your friend request
- `like`: When someone likes your post
- `comment`: When someone comments on your post
- `mention`: When someone mentions you in a post/comment
- `story_view`: When someone views your story

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/rgram_db

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## Database Models

### User Model
- Basic user information (username, email, password)
- Profile details (avatar, bio, location, religion)
- Privacy settings (isPrivate)
- Counters (followersCount, followingCount, postsCount)

### FriendRequest Model
- Sender and recipient references
- Status (pending, accepted, rejected)
- Message and timestamps

### Follow Model
- Follower and following references
- Status (pending, accepted, rejected)
- Request timestamps

### Post Model
- Author reference
- Content, images, videos
- Engagement metrics (likes, comments, shares)
- Type and category

### Notification Model
- Recipient and sender references
- Type and related content references
- Read status

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (only in development)"
}
```

Common HTTP Status Codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `405`: Method Not Allowed
- `500`: Internal Server Error

## Testing Examples

### Using cURL

1. **Send Friend Request:**
```bash
curl -X POST http://localhost:3000/api/friend-request/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "senderId": "sender_user_id_here",
    "recipientId": "recipient_user_id_here",
    "message": "Hi, let us be friends!"
  }'
```

2. **Follow User:**
```bash
curl -X POST http://localhost:3000/api/follow/user_id_here \
  -H "Authorization: Bearer YOUR_TOKEN"
```

3. **Get Home Feed:**
```bash
curl -X GET "http://localhost:3000/api/feed/home?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

4. **Create Post:**
```bash
curl -X POST http://localhost:3000/api/posts/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello world!",
    "images": ["https://example.com/image.jpg"],
    "type": "post"
  }'
```

### Using JavaScript/Fetch

```javascript
// Send friend request
const sendFriendRequest = async (senderId, recipientId, message) => {
  const response = await fetch('/api/friend-request/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ senderId, recipientId, message })
  });
  return response.json();
};

// Get home feed
const getHomeFeed = async (page = 1, limit = 10) => {
  const response = await fetch(`/api/feed/home?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};

// Create post with image
const createPost = async (content, images) => {
  const response = await fetch('/api/posts/create', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ content, images })
  });
  return response.json();
};
```

## Security Features

- JWT-based authentication
- Input validation and sanitization
- Rate limiting (recommended to implement)
- CORS protection
- Secure file uploads with Cloudinary
- User permission checks

## Performance Optimizations

- Database indexing on frequently queried fields
- Pagination for large datasets
- Lean queries for read operations
- Cloudinary transformations for optimized media delivery
- Efficient aggregation queries

## Deployment

1. Set up environment variables
2. Configure MongoDB connection
3. Set up Cloudinary account
4. Deploy to your preferred platform (Vercel, Netlify, etc.)

## Support

For issues and questions, please check the existing documentation or create an issue in the repository.
