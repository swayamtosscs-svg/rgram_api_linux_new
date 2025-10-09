# Private Account System - Complete Implementation

## Overview
This system implements a comprehensive private account feature similar to Instagram, where users can set their accounts to private and control who can see their content, followers, and following lists.

## Features Implemented

### 1. Private Account Settings
- Users can set their account to private/public
- Private accounts require follow requests before content is visible
- Public accounts can be followed directly

### 2. Friend Request System
- Send follow requests to private accounts
- Accept or reject follow requests
- View pending follow requests
- Automatic notifications for all actions

### 3. Privacy Controls
- Profile visibility restrictions for non-followers
- Post visibility based on follow status
- Followers/Following list privacy
- Feed shows only followed users' content

### 4. Notification System
- Follow request notifications
- Follow accepted notifications
- Follow notifications for public accounts

## API Endpoints

### Follow Management

#### Send Follow Request / Follow User
```
POST /api/follow/[user_id]
Authorization: Bearer <token>
```

**Response for Private Account:**
```json
{
  "success": true,
  "message": "Follow request sent successfully (private account)",
  "data": {
    "followRequest": {
      "_id": "...",
      "follower": "...",
      "following": "...",
      "status": "pending",
      "requestedAt": "..."
    }
  }
}
```

**Response for Public Account:**
```json
{
  "success": true,
  "message": "Successfully followed user"
}
```

#### Accept Follow Request
```
POST /api/follow-requests/accept/[user_id]
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Follow request accepted successfully",
  "data": {
    "followRequest": {
      "_id": "...",
      "follower": "...",
      "following": "...",
      "status": "accepted",
      "respondedAt": "..."
    }
  }
}
```

#### Reject Follow Request
```
POST /api/follow-requests/reject/[user_id]
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Follow request rejected successfully",
  "data": {
    "followRequest": {
      "_id": "...",
      "follower": "...",
      "following": "...",
      "status": "rejected",
      "respondedAt": "..."
    }
  }
}
```

#### Get Pending Follow Requests
```
GET /api/follow-requests/pending?page=1&limit=20
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Pending follow requests retrieved successfully",
  "data": {
    "pendingRequests": [
      {
        "_id": "...",
        "follower": {
          "_id": "...",
          "username": "user123",
          "fullName": "John Doe",
          "avatar": "...",
          "bio": "...",
          "isPrivate": false
        },
        "status": "pending",
        "requestedAt": "..."
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalRequests": 5,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

### Profile Management

#### Get User Profile (with Privacy)
```
GET /api/user/profile/[user_id]
Authorization: Bearer <token>
```

**Response for Private Account (Non-follower):**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "user": {
      "_id": "...",
      "username": "private_user",
      "fullName": "Private User",
      "avatar": "...",
      "bio": "...",
      "isPrivate": true,
      "isVerified": false,
      "verificationType": null,
      "followersCount": 150,
      "followingCount": 200,
      "postsCount": 0,
      "reelsCount": 0,
      "videosCount": 0,
      "createdAt": "...",
      "isOwnProfile": false,
      "isFollowing": false,
      "isPrivateAccount": true,
      "showLimitedProfile": true
    }
  }
}
```

**Response for Public Account or Follower:**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "user": {
      "_id": "...",
      "username": "public_user",
      "fullName": "Public User",
      "avatar": "...",
      "bio": "...",
      "website": "...",
      "location": "...",
      "religion": "...",
      "isPrivate": false,
      "isVerified": true,
      "verificationType": "blue_tick",
      "followersCount": 1000,
      "followingCount": 500,
      "postsCount": 50,
      "reelsCount": 20,
      "videosCount": 10,
      "createdAt": "...",
      "isOwnProfile": false,
      "isFollowing": true,
      "isPrivateAccount": false,
      "showLimitedProfile": false
    }
  }
}
```

### Posts Management

#### Get User Posts (with Privacy)
```
GET /api/user/posts/[user_id]?page=1&limit=10&type=all
Authorization: Bearer <token>
```

**Response for Private Account (Non-follower):**
```json
{
  "success": true,
  "message": "Posts retrieved successfully",
  "data": {
    "posts": [],
    "pagination": {
      "currentPage": 1,
      "totalPages": 0,
      "totalPosts": 0,
      "hasNextPage": false,
      "hasPrevPage": false
    },
    "privacyInfo": {
      "isPrivateAccount": true,
      "message": "This account is private. Follow John Doe to see their posts."
    }
  }
}
```

**Response for Public Account or Follower:**
```json
{
  "success": true,
  "message": "Posts retrieved successfully",
  "data": {
    "posts": [
      {
        "_id": "...",
        "content": "Post content...",
        "images": [...],
        "videos": [...],
        "author": {
          "_id": "...",
          "username": "user123",
          "fullName": "John Doe",
          "avatar": "...",
          "isPrivate": false,
          "religion": "Hindu"
        },
        "likes": [...],
        "comments": [...],
        "createdAt": "..."
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalPosts": 50,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "privacyInfo": {
      "isPrivateAccount": false,
      "canViewPosts": true
    }
  }
}
```

### Feed Management

#### Get Following Feed (Private Account Compatible)
```
GET /api/feed/following?page=1&limit=10&type=all
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Following feed retrieved successfully",
  "data": {
    "posts": [
      {
        "_id": "...",
        "content": "Post from followed user...",
        "author": {
          "_id": "...",
          "username": "followed_user",
          "fullName": "Followed User",
          "avatar": "...",
          "isPrivate": true
        },
        "createdAt": "..."
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalPosts": 100,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "followingCount": 25
  }
}
```

### Followers/Following Lists

#### Get Followers List (with Privacy)
```
GET /api/user/followers/[user_id]?page=1&limit=20
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Followers retrieved successfully",
  "data": {
    "followers": [
      {
        "_id": "...",
        "follower": {
          "_id": "...",
          "username": "follower1",
          "fullName": "Follower One",
          "avatar": "...",
          "bio": "...",
          "isPrivate": false,
          "isVerified": false
        },
        "isFollowing": true,
        "createdAt": "..."
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalFollowers": 100,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

#### Get Following List (with Privacy)
```
GET /api/user/following/[user_id]?page=1&limit=20
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Following retrieved successfully",
  "data": {
    "following": [
      {
        "_id": "...",
        "following": {
          "_id": "...",
          "username": "following1",
          "fullName": "Following One",
          "avatar": "...",
          "bio": "...",
          "isPrivate": true,
          "isVerified": true
        },
        "isFollowing": true,
        "createdAt": "..."
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalFollowing": 50,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### Notifications

#### Get Notifications
```
GET /api/user/notifications?page=1&limit=20
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": {
    "notifications": [
      {
        "_id": "...",
        "type": "follow_request",
        "content": "John Doe sent you a follow request",
        "sender": {
          "_id": "...",
          "username": "johndoe",
          "fullName": "John Doe",
          "avatar": "..."
        },
        "isRead": false,
        "createdAt": "..."
      },
      {
        "_id": "...",
        "type": "follow_accepted",
        "content": "Jane Smith accepted your follow request",
        "sender": {
          "_id": "...",
          "username": "janesmith",
          "fullName": "Jane Smith",
          "avatar": "..."
        },
        "isRead": true,
        "createdAt": "..."
      }
    ],
    "unreadCount": 5,
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalNotifications": 25,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

## Privacy Rules

### For Private Accounts:
1. **Profile Visibility**: Non-followers see only basic info (name, username, avatar, bio, follower/following counts)
2. **Posts**: Only followers can see posts
3. **Followers/Following Lists**: Only followers can see these lists
4. **Follow Requests**: Must be sent and accepted before following

### For Public Accounts:
1. **Profile Visibility**: Everyone can see full profile
2. **Posts**: Everyone can see posts
3. **Followers/Following Lists**: Everyone can see these lists
4. **Follow**: Direct follow without approval needed

## Notification Types

- `follow_request`: When someone sends a follow request to a private account
- `follow_accepted`: When a follow request is accepted
- `follow`: When someone follows a public account

## Database Schema Updates

### User Model
```javascript
{
  isPrivate: {
    type: Boolean,
    default: false
  }
}
```

### Follow Model
```javascript
{
  follower: ObjectId,
  following: ObjectId,
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  requestedAt: Date,
  respondedAt: Date
}
```

### Notification Model
```javascript
{
  type: {
    type: String,
    enum: ['follow_request', 'follow_accepted', 'follow', ...]
  },
  content: String,
  recipient: ObjectId,
  sender: ObjectId
}
```

## Usage Examples

### Setting Account to Private
```javascript
// Update user profile
PUT /api/user/profile
{
  "isPrivate": true
}
```

### Sending Follow Request
```javascript
// Send follow request to private account
POST /api/follow/user123
Authorization: Bearer <token>
```

### Accepting Follow Request
```javascript
// Accept follow request
POST /api/follow-requests/accept/user456
Authorization: Bearer <token>
```

### Getting Private User's Posts
```javascript
// This will return empty array with privacy message if not following
GET /api/user/posts/user123
Authorization: Bearer <token>
```

## Error Handling

### Common Error Responses

#### 403 Forbidden (Privacy Restriction)
```json
{
  "success": false,
  "message": "You do not have permission to view this user's posts"
}
```

#### 404 Not Found (No Pending Request)
```json
{
  "success": false,
  "message": "No pending follow request found from this user"
}
```

#### 400 Bad Request (Already Following)
```json
{
  "success": false,
  "message": "Already following this user"
}
```

## Testing

### Test Scenarios
1. Send follow request to private account
2. Accept/reject follow request
3. View private profile as non-follower
4. View private profile as follower
5. View private user's posts as non-follower
6. View private user's posts as follower
7. Get following feed with private accounts
8. View followers/following lists with privacy

### Sample Test Data
```javascript
// Create private user
const privateUser = {
  username: "private_user",
  email: "private@example.com",
  fullName: "Private User",
  isPrivate: true
};

// Create public user
const publicUser = {
  username: "public_user",
  email: "public@example.com",
  fullName: "Public User",
  isPrivate: false
};
```

## Security Considerations

1. **Authentication Required**: All endpoints require valid JWT token
2. **Privacy Enforcement**: Server-side validation of follow relationships
3. **Data Filtering**: Sensitive data hidden based on relationship status
4. **Rate Limiting**: Consider implementing rate limiting for follow requests
5. **Input Validation**: All user inputs are validated and sanitized

## Performance Optimizations

1. **Database Indexes**: Proper indexing on follow relationships
2. **Pagination**: All list endpoints support pagination
3. **Population**: Efficient population of related data
4. **Caching**: Consider caching frequently accessed data
5. **Query Optimization**: Optimized queries for follow status checks

This implementation provides a complete private account system similar to Instagram, with proper privacy controls, notifications, and API endpoints for all functionality.

