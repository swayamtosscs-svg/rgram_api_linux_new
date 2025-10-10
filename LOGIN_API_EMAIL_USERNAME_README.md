# Login API Enhancement - Email and Username Support

## Overview
The login API has been enhanced to support authentication using either email or username, providing users with more flexible login options.

## Changes Made

### 1. Main Login API (`/api/auth/login`)
- **File**: `pages/api/auth/login.ts`
- **Enhancement**: Now accepts both `email` and `username` fields
- **Validation**: Automatically detects whether the input is an email or username
- **Security**: Prevents providing both email and username simultaneously

### 2. Admin Login API (`/api/admin/auth/login`)
- **File**: `pages/api/admin/auth/login.ts`
- **Enhancement**: Now accepts both `email` and `username` fields
- **Validation**: Same validation logic as main login API
- **Security**: Maintains admin-only access restrictions

### 3. Helper Functions
- **Email Detection**: Uses `validateEmail()` to determine if input is an email
- **Username Detection**: Uses `validateUsername()` to determine if input is a username
- **Input Validation**: Ensures only one login method is provided at a time

## API Usage

### Login with Email
```javascript
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Login with Username
```javascript
POST /api/auth/login
Content-Type: application/json

{
  "username": "username123",
  "password": "password123"
}
```

### Admin Login with Username
```javascript
POST /api/admin/auth/login
Content-Type: application/json

{
  "username": "admin_user",
  "password": "admin_password"
}
```

## Request Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | string | No* | User's email address |
| `username` | string | No* | User's username |
| `password` | string | Yes | User's password |

*Either `email` or `username` is required, but not both.

## Response Format

### Success Response (200)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "username": "username123",
      "fullName": "Full Name",
      "avatar": "avatar_url",
      "bio": "User bio",
      "website": "website_url",
      "location": "User location",
      "religion": "Religion",
      "isPrivate": false,
      "isEmailVerified": true,
      "isVerified": false,
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

### Error Responses

#### Invalid Input (400)
```json
{
  "success": false,
  "message": "Please provide either email or username along with password"
}
```

#### Both Email and Username Provided (400)
```json
{
  "success": false,
  "message": "Please provide either email or username, not both"
}
```

#### Invalid Format (400)
```json
{
  "success": false,
  "message": "Please provide a valid email address or username"
}
```

#### Invalid Credentials (401)
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

#### Account Deactivated (401)
```json
{
  "success": false,
  "message": "Account is deactivated. Please contact support."
}
```

## Validation Rules

### Email Validation
- Must be a valid email format
- Automatically converted to lowercase
- Uses the existing `validateEmail()` function

### Username Validation
- Must be 3-30 characters long
- Can only contain letters, numbers, and underscores
- Automatically converted to lowercase
- Cannot be a reserved username
- Uses the existing `validateUsername()` function

## Security Features

1. **Single Login Method**: Prevents users from providing both email and username
2. **Input Validation**: Validates format before database queries
3. **Case Insensitive**: Converts inputs to lowercase for consistent matching
4. **Password Security**: Maintains existing password validation and hashing
5. **Account Status**: Checks for active accounts before allowing login

## Testing

A test script has been created to verify the functionality:
- `test-login-with-username.js` - Comprehensive test suite for both email and username login

### Running Tests
```bash
node test-login-with-username.js
```

## Backward Compatibility

- ✅ Existing email-based logins continue to work
- ✅ No breaking changes to existing API contracts
- ✅ All existing validation and security measures maintained
- ✅ Response format remains unchanged

## Database Queries

The API now performs different database queries based on input type:

### Email Login
```javascript
User.findOne({ email: loginField.toLowerCase() }).select('+password')
```

### Username Login
```javascript
User.findOne({ username: loginField.toLowerCase() }).select('+password')
```

## Error Handling

- Comprehensive error messages for different scenarios
- Proper HTTP status codes
- Input validation before database queries
- Graceful handling of invalid formats

## Future Enhancements

Potential future improvements could include:
- Phone number login support
- Social media login integration
- Multi-factor authentication
- Remember me functionality
- Login attempt rate limiting

## Files Modified

1. `pages/api/auth/login.ts` - Main login API
2. `pages/api/admin/auth/login.ts` - Admin login API
3. `test-login-with-username.js` - Test script (new)
4. `LOGIN_API_EMAIL_USERNAME_README.md` - Documentation (new)

## Dependencies

- No new dependencies added
- Uses existing validation utilities
- Maintains existing authentication middleware
