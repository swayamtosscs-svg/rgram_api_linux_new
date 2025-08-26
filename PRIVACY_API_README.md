# Privacy Settings API Documentation

This document explains how to use the Privacy Settings APIs that allow users to toggle their account between public and private.

## Overview

The Privacy Settings API provides two endpoints:
1. **Toggle Privacy API** - Simple toggle between public/private
2. **Privacy Settings API** - Comprehensive privacy management with multiple actions

## API Endpoints

### 1. Toggle Privacy API
**Endpoint:** `PUT /api/user/toggle-privacy`

**Description:** Simple API to toggle user account privacy between public and private.

**Headers Required:**
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Request Body:** None required (automatically toggles current status)

**Response:**
```json
{
  "success": true,
  "message": "Account is now private",
  "data": {
    "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "username": "john_doe",
    "fullName": "John Doe",
    "isPrivate": true,
    "privacyChangedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Usage Example:**
```javascript
const response = await fetch('/api/user/toggle-privacy', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### 2. Privacy Settings API
**Endpoint:** `GET /api/user/privacy-settings` and `PUT /api/user/privacy-settings`

**Description:** Comprehensive API for managing privacy settings with multiple actions.

#### GET Request - Retrieve Current Privacy Settings
**Headers Required:**
```
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "username": "john_doe",
    "fullName": "John Doe",
    "privacySettings": {
      "isPrivate": false,
      "profileVisibility": "public",
      "lastUpdated": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

#### PUT Request - Update Privacy Settings
**Headers Required:**
```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Request Body Options:**

**Option 1: Toggle Current Status**
```json
{
  "action": "toggle"
}
```

**Option 2: Set Specific Status**
```json
{
  "action": "set",
  "isPrivate": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account privacy set to private",
  "data": {
    "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "username": "john_doe",
    "fullName": "John Doe",
    "isPrivate": true,
    "profileVisibility": "private",
    "privacyChangedAt": "2024-01-15T10:30:00.000Z",
    "previousStatus": false
  }
}
```

## How It Works

1. **User Authentication:** The API requires a valid JWT token in the Authorization header
2. **Privacy Toggle:** When using "toggle" action, it automatically switches between public and private
3. **Specific Setting:** When using "set" action, you can specify exactly what privacy level you want
4. **Database Update:** The `isPrivate` field in the User model is updated accordingly
5. **Response:** Returns the updated user information and confirmation message

## Privacy Levels

- **Public Account (`isPrivate: false`):**
  - Profile is visible to all users
  - Posts and content are publicly accessible
  - Anyone can follow the user
  - Search results include the user

- **Private Account (`isPrivate: true`):**
  - Profile visibility is restricted
  - Content access is limited
  - Follow requests may require approval
  - Limited search visibility

## Error Handling

### Common Error Responses

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Access token required"
}
```

**401 Unauthorized (Invalid Token):**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "User not found"
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Invalid action. Use 'toggle' or 'set'"
}
```

**405 Method Not Allowed:**
```json
{
  "success": false,
  "message": "Method not allowed"
}
```

## Testing

Use the provided test file `test-privacy-api.js` to test the APIs:

```javascript
const { runPrivacyTests } = require('./test-privacy-api.js');

// Run all privacy tests
await runPrivacyTests('your-jwt-token-here');

// Or test individual functions
const { testTogglePrivacy, getPrivacySettings } = require('./test-privacy-api.js');
await testTogglePrivacy(token);
await getPrivacySettings(token);
```

## Frontend Integration

### React Component Example

```jsx
import React, { useState, useEffect } from 'react';

const PrivacyToggle = ({ token }) => {
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);

  const togglePrivacy = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/privacy-settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'toggle' })
      });

      const data = await response.json();
      if (data.success) {
        setIsPrivate(data.data.isPrivate);
      }
    } catch (error) {
      console.error('Error toggling privacy:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button 
        onClick={togglePrivacy} 
        disabled={loading}
        className={`btn ${isPrivate ? 'btn-warning' : 'btn-success'}`}
      >
        {loading ? 'Updating...' : 
         isPrivate ? 'Make Public' : 'Make Private'}
      </button>
      <p>Account is currently: {isPrivate ? 'Private' : 'Public'}</p>
    </div>
  );
};

export default PrivacyToggle;
```

## Security Considerations

1. **Authentication Required:** All privacy operations require valid JWT tokens
2. **User Isolation:** Users can only modify their own privacy settings
3. **Token Validation:** Tokens are verified on every request
4. **Input Validation:** All inputs are validated before processing

## Database Schema

The privacy setting is stored in the User model:

```typescript
interface IUser {
  // ... other fields
  isPrivate: boolean;  // false = public, true = private
  // ... other fields
}
```

## Rate Limiting

Consider implementing rate limiting to prevent abuse:
- Maximum 10 privacy changes per hour per user
- Cooldown period between rapid changes

## Future Enhancements

Potential future features:
- Granular privacy controls (posts, stories, followers)
- Privacy levels (public, friends, private, custom)
- Privacy history and audit trail
- Bulk privacy updates for multiple content types
