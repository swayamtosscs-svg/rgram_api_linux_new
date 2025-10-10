# Block/Unblock User API Documentation

## Overview
This API provides functionality for users to block and unblock other users in the Rgram social media platform. When a user is blocked, they cannot see the blocker's content and vice versa.

## Features
- Block/unblock users
- Automatic removal of follow relationships when blocking
- Notifications for blocked/unblocked users
- Get list of blocked users
- Feed filtering to exclude blocked users' content

## API Endpoints

### 1. Block User
**POST** `/api/block/[user_id]`

Blocks a specific user.

#### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Parameters
- `user_id` (path parameter): ID of the user to block

#### Response
```json
{
  "success": true,
  "message": "User blocked successfully",
  "data": {
    "blockedUserId": "user_id",
    "blockedUserName": "User Name"
  }
}
```

#### What happens when blocking:
1. User is added to the blocker's blocked list
2. Any existing follow relationships (both directions) are removed
3. Follower/following counts are updated accordingly
4. Notification is sent to the blocked user

### 2. Unblock User
**DELETE** `/api/block/[user_id]`

Unblocks a previously blocked user.

#### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Parameters
- `user_id` (path parameter): ID of the user to unblock

#### Response
```json
{
  "success": true,
  "message": "User unblocked successfully",
  "data": {
    "unblockedUserId": "user_id",
    "unblockedUserName": "User Name"
  }
}
```

#### What happens when unblocking:
1. User is removed from the blocker's blocked list
2. Notification is sent to the unblocked user

### 3. Get Blocked Users List
**GET** `/api/user/blocked`

Retrieves the list of all blocked users with their profile information.

#### Headers
```
Authorization: Bearer <jwt_token>
```

#### Response
```json
{
  "success": true,
  "message": "Blocked users retrieved successfully",
  "data": {
    "blockedUsers": [
      {
        "_id": "user_id",
        "username": "username",
        "fullName": "Full Name",
        "avatar": "avatar_url",
        "bio": "User bio",
        "followersCount": 100,
        "followingCount": 50,
        "postsCount": 25,
        "isPrivate": false,
        "isVerified": false,
        "verificationType": null
      }
    ],
    "totalBlocked": 1
  }
}
```

## Database Schema Changes

### User Model Updates
```javascript
{
  // ... existing fields
  blockedUsers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
}
```

### Notification Model Updates
```javascript
{
  type: {
    type: String,
    enum: [
      // ... existing types
      'block', 
      'unblock'
    ]
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Cannot block yourself"
}
```

```json
{
  "success": false,
  "message": "User is already blocked"
}
```

```json
{
  "success": false,
  "message": "User is not blocked"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

### 405 Method Not Allowed
```json
{
  "success": false,
  "message": "Method not allowed"
}
```

## Usage Examples

### Block a User
```bash
curl -X POST "http://localhost:3000/api/block/64a1b2c3d4e5f6789012345" \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json"
```

### Unblock a User
```bash
curl -X DELETE "http://localhost:3000/api/block/64a1b2c3d4e5f6789012345" \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json"
```

### Get Blocked Users
```bash
curl -X GET "http://localhost:3000/api/user/blocked" \
  -H "Authorization: Bearer your_jwt_token"
```

## Integration with Other Features

### Feed Filtering
The following feed API (`/api/feed/following`) automatically excludes posts from blocked users.

### Follow System
When a user is blocked:
- All existing follow relationships are removed
- Follower/following counts are updated
- Users cannot follow each other while blocked

### Notifications
- Blocked users receive a notification when blocked
- Unblocked users receive a notification when unblocked
- Blocked users cannot send notifications to the blocker

## Security Considerations

1. **Authentication Required**: All endpoints require valid JWT authentication
2. **Self-Blocking Prevention**: Users cannot block themselves
3. **Bidirectional Blocking**: Blocking affects both users' ability to see each other's content
4. **Follow Relationship Cleanup**: Automatic removal of follow relationships prevents circumvention

## Testing

Use the provided Postman collection (`block-unblock-api-postman-collection.json`) to test all endpoints.

### Test Scenarios
1. Block a user successfully
2. Try to block the same user again (should fail)
3. Try to block yourself (should fail)
4. Unblock a user successfully
5. Try to unblock a non-blocked user (should fail)
6. Get blocked users list
7. Verify feed excludes blocked users' posts

## Notes

- Blocking is immediate and takes effect right away
- Blocked users cannot see the blocker's posts, stories, or profile updates
- The blocker cannot see the blocked user's content either
- Unblocking restores normal interaction capabilities
- All actions are logged and notifications are sent appropriately



