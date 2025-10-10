# Privacy & Follow API Documentation

This document provides comprehensive cURL examples and success responses for all Privacy and Follow APIs.

## Base URL
```
http://103.14.120.163:8081
```

## Authentication
All APIs require Bearer token authentication:
```bash
-H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🔐 Privacy APIs

### 1. Get Privacy Settings
**Endpoint:** `GET /api/user/privacy-settings`

**cURL Command:**
```bash
curl -X GET "http://103.14.120.163:8081/api/user/privacy-settings" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "userId": "68da3b7dcffda6e29eb54016",
    "username": "testuser",
    "fullName": "Test User",
    "privacySettings": {
      "isPrivate": false,
      "profileVisibility": "public",
      "lastUpdated": "2025-09-29T07:56:00.259Z"
    }
  }
}
```

### 2. Toggle Privacy (Simple)
**Endpoint:** `PUT /api/user/toggle-privacy`

**cURL Command:**
```bash
curl -X PUT "http://103.14.120.163:8081/api/user/toggle-privacy" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Success Response:**
```json
{
  "success": true,
  "message": "Account is now private",
  "data": {
    "userId": "68da3b7dcffda6e29eb54016",
    "username": "testuser",
    "fullName": "Test User",
    "isPrivate": true,
    "privacyChangedAt": "2025-09-29T07:56:00.259Z"
  }
}
```

### 3. Set Privacy to Public
**Endpoint:** `PUT /api/user/privacy-settings`

**cURL Command:**
```bash
curl -X PUT "http://103.14.120.163:8081/api/user/privacy-settings" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "set",
    "isPrivate": false
  }'
```

**Success Response:**
```json
{
  "success": true,
  "message": "Account privacy set to public",
  "data": {
    "userId": "68da3b7dcffda6e29eb54016",
    "username": "testuser",
    "fullName": "Test User",
    "isPrivate": false,
    "profileVisibility": "public",
    "privacyChangedAt": "2025-09-29T07:56:00.259Z"
  }
}
```

### 4. Set Privacy to Private
**Endpoint:** `PUT /api/user/privacy-settings`

**cURL Command:**
```bash
curl -X PUT "http://103.14.120.163:8081/api/user/privacy-settings" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "set",
    "isPrivate": true
  }'
```

**Success Response:**
```json
{
  "success": true,
  "message": "Account privacy set to private",
  "data": {
    "userId": "68da3b7dcffda6e29eb54016",
    "username": "testuser",
    "fullName": "Test User",
    "isPrivate": true,
    "profileVisibility": "private",
    "privacyChangedAt": "2025-09-29T07:56:00.259Z"
  }
}
```

### 5. Toggle Privacy (Advanced)
**Endpoint:** `PUT /api/user/privacy-settings`

**cURL Command:**
```bash
curl -X PUT "http://103.14.120.163:8081/api/user/privacy-settings" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "toggle"
  }'
```

**Success Response:**
```json
{
  "success": true,
  "message": "Account is now private",
  "data": {
    "userId": "68da3b7dcffda6e29eb54016",
    "username": "testuser",
    "fullName": "Test User",
    "isPrivate": true,
    "privacyChangedAt": "2025-09-29T07:56:00.259Z"
  }
}
```

---

## 👥 Follow APIs

### 1. Send Follow Request
**Endpoint:** `POST /api/follow-request/send`

**cURL Command:**
```bash
curl -X POST "http://103.14.120.163:8081/api/follow-request/send" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "targetUserId": "68da3b7dcffda6e29eb54016"
  }'
```

**Success Response:**
```json
{
  "success": true,
  "message": "Follow request sent successfully",
  "data": {
    "followRequest": {
      "_id": "68da3c06cffda6e29eb54063",
      "follower": {
        "_id": "68da3ba6cffda6e29eb5403c",
        "username": "testuser2",
        "fullName": "Test User 2",
        "avatar": ""
      },
      "following": {
        "_id": "68da3b7dcffda6e29eb54016",
        "username": "testuser",
        "fullName": "Test User",
        "avatar": ""
      },
      "status": "pending",
      "requestedAt": "2025-09-29T07:56:00.259Z"
    }
  }
}
```

### 2. Get Pending Follow Requests
**Endpoint:** `GET /api/follow-request/pending`

**cURL Command:**
```bash
curl -X GET "http://103.14.120.163:8081/api/follow-request/pending" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response:**
```json
{
  "success": true,
  "message": "Pending follow requests retrieved successfully",
  "data": {
    "pendingRequests": [
      {
        "_id": "68da3c06cffda6e29eb54063",
        "follower": {
          "_id": "68da3ba6cffda6e29eb5403c",
          "username": "testuser2",
          "fullName": "Test User 2",
          "avatar": "",
          "bio": ""
        },
        "status": "pending",
        "requestedAt": "2025-09-29T07:56:00.259Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalCount": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

### 3. Accept Follow Request
**Endpoint:** `POST /api/follow-request/accept`

**cURL Command:**
```bash
curl -X POST "http://103.14.120.163:8081/api/follow-request/accept" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "followRequestId": "68da3c06cffda6e29eb54063"
  }'
```

**Success Response:**
```json
{
  "success": true,
  "message": "Follow request accepted successfully",
  "data": {
    "followRequest": {
      "_id": "68da3c06cffda6e29eb54063",
      "follower": {
        "_id": "68da3ba6cffda6e29eb5403c",
        "username": "testuser2",
        "fullName": "Test User 2",
        "avatar": ""
      },
      "following": {
        "_id": "68da3b7dcffda6e29eb54016",
        "username": "testuser",
        "fullName": "Test User",
        "avatar": ""
      },
      "status": "accepted",
      "requestedAt": "2025-09-29T07:56:00.259Z",
      "respondedAt": "2025-09-29T07:57:00.259Z"
    }
  }
}
```

### 4. Reject Follow Request
**Endpoint:** `POST /api/follow-request/reject`

**cURL Command:**
```bash
curl -X POST "http://103.14.120.163:8081/api/follow-request/reject" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "followRequestId": "68da3c06cffda6e29eb54063"
  }'
```

**Success Response:**
```json
{
  "success": true,
  "message": "Follow request rejected successfully",
  "data": {
    "followRequest": {
      "_id": "68da3c06cffda6e29eb54063",
      "status": "rejected",
      "respondedAt": "2025-09-29T07:57:00.259Z"
    }
  }
}
```

### 5. Get Sent Follow Requests
**Endpoint:** `GET /api/follow-request/sent`

**cURL Command:**
```bash
curl -X GET "http://103.14.120.163:8081/api/follow-request/sent" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response:**
```json
{
  "success": true,
  "message": "Sent follow requests retrieved successfully",
  "data": {
    "sentRequests": [
      {
        "_id": "68da3c06cffda6e29eb54063",
        "following": {
          "_id": "68da3b7dcffda6e29eb54016",
          "username": "testuser",
          "fullName": "Test User",
          "avatar": "",
          "bio": ""
        },
        "status": "accepted",
        "requestedAt": "2025-09-29T07:56:00.259Z",
        "respondedAt": "2025-09-29T07:57:00.259Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalCount": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

---

## 🔒 Privacy Enforcement APIs

### 1. Get User Posts (Privacy Enforced)
**Endpoint:** `GET /api/posts/manage?userId=USER_ID`

**cURL Command:**
```bash
curl -X GET "http://103.14.120.163:8081/api/posts/manage?userId=68da3b7dcffda6e29eb54016" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response (Follower):**
```json
{
  "success": true,
  "message": "User posts retrieved successfully",
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

**Error Response (Non-Follower):**
```json
{
  "success": false,
  "message": "You do not have permission to view this user's posts"
}
```

### 2. Get Social Feed (Privacy Enforced)
**Endpoint:** `GET /api/feed/social`

**cURL Command:**
```bash
curl -X GET "http://103.14.120.163:8081/api/feed/social" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response:**
```json
{
  "success": true,
  "message": "Social feed retrieved successfully",
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
      "totalFollowing": 1,
      "totalPublicUsers": 0,
      "totalPrivateUsers": 1,
      "postsFromFollowing": 0,
      "postsFromPublic": 0
    },
    "userInfo": {
      "userId": "68da3ba6cffda6e29eb5403c",
      "username": "testuser2",
      "religion": "hinduism",
      "isPrivate": false
    }
  }
}
```

### 3. Get Assets Feed (Privacy Enforced)
**Endpoint:** `GET /api/feed/assets`

**cURL Command:**
```bash
curl -X GET "http://103.14.120.163:8081/api/feed/assets" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response:**
```json
{
  "success": true,
  "message": "Assets feed retrieved successfully",
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
      "totalFollowing": 1,
      "totalPublicUsers": 0,
      "postsWithImages": 0,
      "postsWithVideos": 0
    }
  }
}
```

---

## 🔄 Complete Privacy Flow Example

### Step 1: Set User to Private
```bash
curl -X PUT "http://103.14.120.163:8081/api/user/privacy-settings" \
  -H "Authorization: Bearer USER1_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "set", "isPrivate": true}'
```

### Step 2: User 2 Tries to View User 1's Posts (Should Fail)
```bash
curl -X GET "http://103.14.120.163:8081/api/posts/manage?userId=USER1_ID" \
  -H "Authorization: Bearer USER2_TOKEN"
```
**Result:** `403 Forbidden`

### Step 3: User 2 Sends Follow Request
```bash
curl -X POST "http://103.14.120.163:8081/api/follow-request/send" \
  -H "Authorization: Bearer USER2_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"targetUserId": "USER1_ID"}'
```

### Step 4: User 1 Accepts Follow Request
```bash
curl -X POST "http://103.14.120.163:8081/api/follow-request/accept" \
  -H "Authorization: Bearer USER1_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"followRequestId": "FOLLOW_REQUEST_ID"}'
```

### Step 5: User 2 Can Now View User 1's Posts
```bash
curl -X GET "http://103.14.120.163:8081/api/posts/manage?userId=USER1_ID" \
  -H "Authorization: Bearer USER2_TOKEN"
```
**Result:** `200 OK`

---

## 📝 Notes

1. **Authentication Required:** All APIs require a valid JWT token
2. **Privacy Enforcement:** Private users' posts are only visible to accepted followers
3. **Follow Status:** Follow requests have three states: `pending`, `accepted`, `rejected`
4. **User IDs:** All user IDs must be valid 24-character MongoDB ObjectIds
5. **Error Handling:** APIs return appropriate HTTP status codes and error messages

## 🚨 Common Errors

### Invalid Token
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### User Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

### Permission Denied
```json
{
  "success": false,
  "message": "You do not have permission to view this user's posts"
}
```

### Already Following
```json
{
  "success": false,
  "message": "Already following this user"
}
```

### Follow Request Already Sent
```json
{
  "success": false,
  "message": "Follow request already sent"
}
```
