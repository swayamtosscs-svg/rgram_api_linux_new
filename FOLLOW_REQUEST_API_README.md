# Follow Request API Documentation

This document describes the comprehensive follow request system for the Rgram API, which handles follow requests, accept/reject functionality, and private account management.

## Overview

The follow request system allows users to:
- Send follow requests to other users
- Accept or reject incoming follow requests
- Cancel sent follow requests
- View pending, accepted, and rejected follow requests
- Handle private vs public account following

## API Endpoints

### 1. Send Follow Request

**Endpoint:** `POST /api/follow-request/send`

**Description:** Send a follow request to another user.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "targetUserId": "user_id_here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Follow request sent successfully",
  "data": {
    "followRequest": {
      "_id": "follow_request_id",
      "follower": {
        "_id": "follower_user_id",
        "username": "follower_username",
        "fullName": "Follower Name",
        "avatar": "avatar_url"
      },
      "following": {
        "_id": "following_user_id",
        "username": "following_username",
        "fullName": "Following Name",
        "avatar": "avatar_url"
      },
      "status": "pending",
      "requestedAt": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `400`: Target user ID is required
- `400`: Cannot follow yourself
- `400`: Already following this user
- `400`: Follow request already sent
- `401`: Authentication required
- `404`: Target user not found
- `500`: Internal server error

---

### 2. Accept Follow Request

**Endpoint:** `POST /api/follow-request/accept`

**Description:** Accept an incoming follow request.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "followRequestId": "follow_request_id_here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Follow request accepted successfully",
  "data": {
    "followRequest": {
      "_id": "follow_request_id",
      "follower": {
        "_id": "follower_user_id",
        "username": "follower_username",
        "fullName": "Follower Name",
        "avatar": "avatar_url"
      },
      "following": {
        "_id": "following_user_id",
        "username": "following_username",
        "fullName": "Following Name",
        "avatar": "avatar_url"
      },
      "status": "accepted",
      "requestedAt": "2024-01-01T00:00:00.000Z",
      "respondedAt": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `400`: Follow request ID is required
- `400`: Follow request is already accepted/rejected
- `401`: Authentication required
- `403`: You can only accept follow requests sent to you
- `404`: Follow request not found
- `500`: Internal server error

---

### 3. Reject Follow Request

**Endpoint:** `POST /api/follow-request/reject`

**Description:** Reject an incoming follow request.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "followRequestId": "follow_request_id_here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Follow request rejected successfully",
  "data": {
    "followRequest": {
      "_id": "follow_request_id",
      "follower": {
        "_id": "follower_user_id",
        "username": "follower_username",
        "fullName": "Follower Name",
        "avatar": "avatar_url"
      },
      "following": {
        "_id": "following_user_id",
        "username": "following_username",
        "fullName": "Following Name",
        "avatar": "avatar_url"
      },
      "status": "rejected",
      "requestedAt": "2024-01-01T00:00:00.000Z",
      "respondedAt": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `400`: Follow request ID is required
- `400`: Follow request is already accepted/rejected
- `401`: Authentication required
- `403`: You can only reject follow requests sent to you
- `404`: Follow request not found
- `500`: Internal server error

---

### 4. Get Pending Follow Requests

**Endpoint:** `GET /api/follow-request/pending`

**Description:** Get all pending follow requests for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Example:** `GET /api/follow-request/pending?page=1&limit=10`

**Response:**
```json
{
  "success": true,
  "message": "Pending follow requests retrieved successfully",
  "data": {
    "pendingRequests": [
      {
        "_id": "follow_request_id",
        "follower": {
          "_id": "follower_user_id",
          "username": "follower_username",
          "fullName": "Follower Name",
          "avatar": "avatar_url",
          "bio": "User bio"
        },
        "following": "current_user_id",
        "status": "pending",
        "requestedAt": "2024-01-01T00:00:00.000Z",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCount": 100,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

**Error Responses:**
- `401`: Authentication required
- `500`: Internal server error

---

### 5. Get Sent Follow Requests

**Endpoint:** `GET /api/follow-request/sent`

**Description:** Get all follow requests sent by the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `status` (optional): Filter by status (pending, accepted, rejected)

**Example:** `GET /api/follow-request/sent?page=1&limit=10&status=pending`

**Response:**
```json
{
  "success": true,
  "message": "Sent follow requests retrieved successfully",
  "data": {
    "sentRequests": [
      {
        "_id": "follow_request_id",
        "follower": "current_user_id",
        "following": {
          "_id": "following_user_id",
          "username": "following_username",
          "fullName": "Following Name",
          "avatar": "avatar_url",
          "bio": "User bio"
        },
        "status": "pending",
        "requestedAt": "2024-01-01T00:00:00.000Z",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalCount": 50,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

**Error Responses:**
- `401`: Authentication required
- `500`: Internal server error

---

### 6. Cancel Follow Request

**Endpoint:** `DELETE /api/follow-request/cancel?followRequestId=<id>`

**Description:** Cancel a follow request sent by the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `followRequestId`: ID of the follow request to cancel

**Response:**
```json
{
  "success": true,
  "message": "Follow request cancelled successfully"
}
```

**Error Responses:**
- `400`: Follow request ID is required
- `400`: Cannot cancel follow request that is already accepted/rejected
- `401`: Authentication required
- `403`: You can only cancel follow requests sent by you
- `404`: Follow request not found
- `500`: Internal server error

---

### 7. Follow/Unfollow User (Updated)

**Endpoint:** `POST /api/follow/[user_id]` or `DELETE /api/follow/[user_id]`

**Description:** Follow or unfollow a user (handles both public and private accounts).

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `user_id`: ID of the user to follow/unfollow

**Behavior:**
- **Public Accounts**: Follows immediately
- **Private Accounts**: Sends follow request
- **Already Following**: Returns appropriate message
- **Unfollow**: Only works with accepted follow relationships

**Response Examples:**

Follow Public User:
```json
{
  "success": true,
  "message": "Successfully followed user"
}
```

Follow Private User:
```json
{
  "success": true,
  "message": "Follow request sent successfully (private account)",
  "data": {
    "followRequest": { ... }
  }
}
```

Unfollow:
```json
{
  "success": true,
  "message": "Successfully unfollowed user"
}
```

---

### 8. Get Followers (Updated)

**Endpoint:** `GET /api/followers/[user_id]`

**Description:** Get all accepted followers for a user.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "message": "Followers retrieved",
  "data": {
    "followers": [
      {
        "_id": "follower_user_id",
        "username": "follower_username",
        "fullName": "Follower Name",
        "avatar": "avatar_url",
        "bio": "User bio"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCount": 100,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

### 9. Get Following (Updated)

**Endpoint:** `GET /api/following/[user_id]`

**Description:** Get all accepted following relationships for a user.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Response:**
```json
{
  "success": true,
  "message": "Following retrieved",
  "data": {
    "following": [
      {
        "_id": "following_user_id",
        "username": "following_username",
        "fullName": "Following Name",
        "avatar": "avatar_url",
        "bio": "User bio"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalCount": 50,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

## Data Model

### Follow Schema

```typescript
interface IFollow {
  _id: string;
  follower: mongoose.Types.ObjectId;  // User sending the request
  following: mongoose.Types.ObjectId; // User receiving the request
  status: 'pending' | 'accepted' | 'rejected';
  requestedAt: Date;                  // When the request was sent
  respondedAt?: Date;                 // When the request was accepted/rejected
  createdAt: Date;
  updatedAt: Date;
}
```

### Status Meanings

- **pending**: Follow request sent, waiting for response
- **accepted**: Follow request approved, users are now connected
- **rejected**: Follow request denied

## Private vs Public Accounts

- **Public Accounts**: Users can be followed immediately
- **Private Accounts**: Users require follow request approval
- The system automatically detects account privacy settings
- Follow requests are only created for private accounts

## Authentication

All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Error Handling

All endpoints return consistent error responses:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (only in development)"
}
```

## Rate Limiting

Consider implementing rate limiting for:
- Follow request sending (e.g., max 100 requests per hour)
- Follow request actions (accept/reject)

## Best Practices

1. **Always check authentication** before processing requests
2. **Validate user permissions** for actions
3. **Use pagination** for large datasets
4. **Handle edge cases** like self-following
5. **Update user counts** when follow status changes
6. **Provide clear error messages** for better UX

## Testing

Test the APIs with:
- Valid and invalid tokens
- Different user privacy settings
- Edge cases (self-following, duplicate requests)
- Pagination functionality
- Error scenarios

## Example Usage

### Frontend Integration

```javascript
// Send follow request
const sendFollowRequest = async (targetUserId) => {
  const response = await fetch('/api/follow-request/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ targetUserId })
  });
  return response.json();
};

// Accept follow request
const acceptFollowRequest = async (followRequestId) => {
  const response = await fetch('/api/follow-request/accept', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ followRequestId })
  });
  return response.json();
};

// Get pending requests
const getPendingRequests = async (page = 1, limit = 20) => {
  const response = await fetch(`/api/follow-request/pending?page=${page}&limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

This comprehensive follow request system provides a robust foundation for social media functionality with proper privacy controls and user experience considerations.
