# Instagram-like API Documentation

## Base URL
```
http://localhost:5001/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### 1. User Signup
**POST** `/auth/signup`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "username": "johndoe" // optional, will be auto-generated if not provided
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "username": "johndoe",
      "fullName": "John Doe",
      "avatar": "",
      "bio": "",
      "website": "",
      "location": "",
      "isPrivate": false,
      "isEmailVerified": false,
      "followersCount": 0,
      "followingCount": 0,
      "postsCount": 0,
      "reelsCount": 0,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

### 2. User Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "username": "johndoe",
      "fullName": "John Doe",
      "avatar": "",
      "bio": "",
      "website": "",
      "location": "",
      "isPrivate": false,
      "isEmailVerified": false,
      "followersCount": 0,
      "followingCount": 0,
      "postsCount": 0,
      "reelsCount": 0,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "lastActive": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

---

## User Endpoints

### 3. Get User Profile
**GET** `/user/profile`

**Response:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "username": "johndoe",
      "fullName": "John Doe",
      "avatar": "",
      "bio": "",
      "website": "",
      "location": "",
      "isPrivate": false,
      "isEmailVerified": false,
      "followersCount": 0,
      "followingCount": 0,
      "postsCount": 0,
      "reelsCount": 0,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 4. Update User Profile
**PUT** `/user/profile`

**Request Body:**
```json
{
  "fullName": "John Doe Updated",
  "bio": "My bio",
  "website": "https://example.com",
  "location": "New York",
  "isPrivate": false
}
```

### 5. Follow/Unfollow User
**POST** `/user/follow` - Follow user
**DELETE** `/user/follow` - Unfollow user

**Request Body:**
```json
{
  "userId": "user_id_to_follow"
}
```

---

## Posts Endpoints

### 6. Create Post
**POST** `/posts`

**Request Body:**
```json
{
  "content": "This is my post content",
  "images": ["image_url_1", "image_url_2"],
  "type": "post" // or "reel"
}
```

### 7. Get Posts (User's posts)
**GET** `/posts?page=1&limit=10`

### 8. Get Single Post
**GET** `/posts/[post_id]`

### 9. Update Post
**PUT** `/posts/[post_id]`

**Request Body:**
```json
{
  "content": "Updated post content",
  "images": ["new_image_url"]
}
```

### 10. Delete Post
**DELETE** `/posts/[post_id]`

### 11. Like/Unlike Post
**POST** `/posts/[post_id]/like` - Like post
**DELETE** `/posts/[post_id]/like` - Unlike post

### 12. Add Comment
**POST** `/posts/[post_id]/comments`

**Request Body:**
```json
{
  "content": "This is a comment"
}
```

### 13. Delete Comment
**DELETE** `/posts/[post_id]/comments/[comment_id]`

---

## Feed Endpoints

### 14. Get User Feed
**GET** `/posts/feed?page=1&limit=10`

Returns posts from users that the current user follows.

---

## Stories Endpoints

### 15. Create Story
**POST** `/stories`

**Request Body:**
```json
{
  "media": "story_media_url",
  "type": "image", // or "video"
  "caption": "Story caption",
  "mentions": ["user_id_1", "user_id_2"],
  "hashtags": ["hashtag1", "hashtag2"],
  "location": "New York"
}
```

### 16. Get Stories
**GET** `/stories?page=1&limit=20`

Returns active stories (not expired).

---

## Search Endpoints

### 17. Search Users
**GET** `/search?q=john&type=users&page=1&limit=10`

### 18. Search Posts
**GET** `/search?q=content&type=posts&page=1&limit=10`

---

## Notifications Endpoints

### 19. Get Notifications
**GET** `/notifications?page=1&limit=20`

### 20. Mark Notifications as Read
**PUT** `/notifications`

**Request Body:**
```json
{
  "notificationIds": ["notification_id_1", "notification_id_2"]
}
```

Or mark all as read:
```json
{}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (only in development)"
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `405` - Method Not Allowed
- `500` - Internal Server Error

---

## Environment Variables

Create a `.env.local` file with:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your_jwt_secret_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
EMAIL_FROM=your_email@gmail.com
PORT=5001
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

---

## Features Included

✅ User Authentication (Signup/Login)  
✅ User Profiles  
✅ Posts (Create, Read, Update, Delete)  
✅ Likes and Comments  
✅ Follow/Unfollow System  
✅ User Feed  
✅ Stories  
✅ Search (Users & Posts)  
✅ Notifications  
✅ JWT Authentication  
✅ MongoDB Integration  
✅ Email Support  
✅ Input Validation  
✅ Error Handling  
✅ Pagination  
✅ Rate Limiting Ready  

---

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env.local`

3. Run the development server:
```bash
npm run dev
```

4. Test the API endpoints using Postman or similar tool

The API will be available at `http://localhost:5001/api`
