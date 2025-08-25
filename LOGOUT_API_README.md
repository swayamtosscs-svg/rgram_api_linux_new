# Logout API Documentation

## Overview
The Logout API allows users to logout from the system. It supports both self-logout and logout by user ID (admin functionality). The API accepts the `userId` parameter in two ways: **request body** or **request header**.

## Endpoint
```
POST /api/auth/logout
```

## Authentication
- **Required**: Bearer token in Authorization header
- **Format**: `Authorization: Bearer <token>`

## Request Parameters

### Method 1: Request Body (JSON)
```json
{
  "userId": "507f1f77bcf86cd799439011"
}
```

### Method 2: Request Header
```
userid: 507f1f77bcf86cd799439011
```

**Note**: The API checks both methods and uses whichever is provided. If both are provided, the request body takes precedence.

## Request Examples

### Self Logout (Default)
```json
{
  // No body required - user will logout themselves
}
```

### Logout by User ID (Admin Only)
**Option A - Request Body:**
```json
{
  "userId": "68abecf0a28e1fa778af9845"
}
```

**Option B - Request Header:**
```
userid: 68abecf0a28e1fa778af9845
```

## Response Format

### Success Response (200)
```json
{
  "success": true,
  "message": "User 68abecf0a28e1fa778af9845 has been logged out successfully",
  "data": {
    "loggedOutUserId": "68abecf0a28e1fa778af9845",
    "loggedOutBy": "507f1f77bcf86cd799439012",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### Error Responses

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "No token provided"
}
```

```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Only admins can logout other users."
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "Target user not found"
}
```

#### 405 Method Not Allowed
```json
{
  "success": false,
  "message": "Method not allowed"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details (development only)"
}
```

## Features

### 1. Self Logout
- User can logout themselves using their own token
- Current token is blacklisted
- User's `lastActive` timestamp is updated

### 2. Logout by User ID (Admin Only)
- Only users with `isAdmin: true` can logout other users
- Creates a special blacklist entry that invalidates all future tokens for the target user
- Target user's `lastActive` timestamp is updated
- Logs the admin action for audit purposes

### 3. Token Blacklisting
- Uses the `BlacklistedToken` model to track invalidated tokens
- Special entries for admin-initiated logouts
- Automatic cleanup of expired blacklist entries

### 4. Flexible Parameter Input
- Supports `userId` in request body (JSON)
- Supports `userId` in request header
- Automatic fallback between methods

## Usage Examples

### cURL Examples

#### Self Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### Logout by User ID - Body Method
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId": "68abecf0a28e1fa778af9845"}'
```

#### Logout by User ID - Header Method
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -H "userid: 68abecf0a28e1fa778af9845"
```

### JavaScript/Node.js Examples

#### Self Logout
```javascript
const response = await fetch('/api/auth/logout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data.message); // "Logged out successfully"
```

#### Logout by User ID - Body Method
```javascript
const response = await fetch('/api/auth/logout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: '68abecf0a28e1fa778af9845'
  })
});

const data = await response.json();
if (data.success) {
  console.log(`User ${data.data.loggedOutUserId} logged out by ${data.data.loggedOutBy}`);
}
```

#### Logout by User ID - Header Method
```javascript
const response = await fetch('/api/auth/logout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json',
    'userid': '68abecf0a28e1fa778af9845'
  }
});

const data = await response.json();
if (data.success) {
  console.log(`User ${data.data.loggedOutUserId} logged out by ${data.data.loggedOutBy}`);
}
```

### React/Next.js Examples

#### Self Logout Hook
```typescript
import { useState } from 'react';

const useLogout = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logout = async (token: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Clear local storage, redirect, etc.
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to logout');
    } finally {
      setLoading(false);
    }
  };

  return { logout, loading, error };
};
```

#### Admin Logout Component (Header Method)
```typescript
import { useState } from 'react';

interface LogoutUserProps {
  userId: string;
  adminToken: string;
  onSuccess: () => void;
}

const LogoutUser: React.FC<LogoutUserProps> = ({ userId, adminToken, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleLogoutUser = async () => {
    if (!confirm(`Are you sure you want to logout user ${userId}?`)) {
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
          'userid': userId
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`User ${userId} has been logged out successfully`);
        onSuccess();
      } else {
        alert(`Failed to logout user: ${data.message}`);
      }
    } catch (err) {
      alert('Failed to logout user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleLogoutUser}
      disabled={loading}
      className="bg-red-500 text-white px-4 py-2 rounded"
    >
      {loading ? 'Logging out...' : 'Logout User'}
    </button>
  );
};
```

## Postman Setup

### Your Current Setup (Header Method)
Based on your Postman screenshot, you're using the header method correctly:

1. **Method**: POST
2. **URL**: `http://localhost:3000/api/auth/logout`
3. **Headers**:
   - `Authorization`: `Bearer YOUR_JWT_TOKEN`
   - `userid`: `68abecf0a28e1fa778af9845`
   - `Content-Type`: `application/json`
4. **Body**: Empty (raw JSON)

This should now work with the updated API!

## Security Considerations

### 1. Admin Authorization
- Only users with `isAdmin: true` can logout other users
- Admin actions are logged for audit purposes

### 2. Token Invalidation
- Current tokens are immediately blacklisted
- Special blacklist entries prevent future token usage for admin-logged-out users
- Blacklist entries automatically expire after 30 days

### 3. Rate Limiting
- Consider implementing rate limiting to prevent abuse
- Monitor logout patterns for suspicious activity

## Testing

### Test Script
Use the provided test script to verify API functionality:

```bash
node test-logout-api.js
```

### Test Scenarios
1. **Self Logout**: User logs out themselves
2. **Admin Logout - Body Method**: Admin logs out another user using request body
3. **Admin Logout - Header Method**: Admin logs out another user using header (your method)
4. **Unauthorized Access**: Non-admin tries to logout another user
5. **Invalid User ID**: Attempt to logout non-existent user
6. **Missing Token**: Request without authentication

## Database Schema

### BlacklistedToken Model
```typescript
interface BlacklistedToken {
  token: string;           // Token string or special identifier
  userId: ObjectId;        // User ID associated with the token
  expiresAt: Date;         // When the blacklist entry expires
  createdAt: Date;         // When the entry was created
}
```

### User Model Updates
- `lastActive` field is updated on logout
- `isAdmin` field determines logout permissions

## Error Handling

### Common Error Scenarios
1. **Invalid Token**: Token is expired, malformed, or already blacklisted
2. **User Not Found**: Target user ID doesn't exist in the database
3. **Permission Denied**: Non-admin user attempting to logout another user
4. **Database Errors**: Connection issues or query failures

### Error Recovery
- Failed logout attempts don't affect the user's current session
- Database connection issues are handled gracefully
- Detailed error messages in development mode

## Monitoring and Logging

### Logged Events
- Admin-initiated user logouts
- Failed logout attempts
- Database connection issues

### Metrics to Track
- Logout success/failure rates
- Admin logout frequency
- Token blacklist size and cleanup

## Future Enhancements

### Potential Improvements
1. **Bulk Logout**: Logout multiple users at once
2. **Logout Reasons**: Track why users were logged out
3. **Session Management**: More sophisticated session tracking
4. **Webhook Support**: Notify external systems of logouts
5. **Audit Trail**: Comprehensive logging of all logout activities

## Support

For questions or issues with the Logout API, please refer to:
- API documentation
- Test scripts
- Error logs
- Development team
