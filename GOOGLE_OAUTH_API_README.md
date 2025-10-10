# Google OAuth API - RGram Authentication System

A complete Google OAuth 2.0 authentication system for the RGram application, built with Next.js API routes and TypeScript.

## 🚀 **Features**

### **OAuth Flow**
- **OAuth Initialization**: Generate Google OAuth authorization URLs
- **OAuth Callback**: Handle Google's authorization response
- **JWT Token Generation**: Create secure authentication tokens
- **User Profile Management**: Retrieve and update user information
- **Session Management**: Token verification and logout functionality
- **Account Management**: Delete account and manage user data
- **Token Refresh**: Refresh expired access tokens
- **Password Reset**: Secure password reset functionality

### **Security Features**
- JWT-based authentication
- Token expiration handling
- Secure OAuth flow implementation
- Input validation and sanitization
- Account deletion confirmation
- Password strength validation
- Refresh token rotation

## 📁 **API Endpoints**

### **1. Google OAuth Initialization**
```
GET /api/auth/google/init
```
**Purpose**: Generates the Google OAuth authorization URL
**Query Parameters**:
- `redirect_uri` (optional): Custom redirect URI

**Response**:
```json
{
  "success": true,
  "authUrl": "https://accounts.google.com/oauth/authorize?...",
  "message": "Google OAuth URL generated successfully"
}
```

### **2. Google OAuth Callback**
```
GET /api/auth/google/callback
```
**Purpose**: Handles Google's OAuth callback with authorization code
**Query Parameters**:
- `code`: Authorization code from Google
- `error`: Error message if OAuth failed

**Response**:
```json
{
  "success": true,
  "message": "Google authentication successful",
  "data": {
    "user": {
      "id": "google_user_id",
      "email": "user@example.com",
      "name": "User Name",
      "firstName": "User",
      "lastName": "Name",
      "picture": "https://...",
      "locale": "en",
      "verified": true,
      "provider": "google",
      "sessionId": "uuid",
      "loginTime": "2025-01-27T..."
    },
    "token": "jwt_token_here",
    "expiresIn": 3600,
    "tokenType": "Bearer"
  }
}
```

### **3. Token Verification**
```
POST /api/auth/verify
```
**Purpose**: Verifies JWT token validity
**Body**:
```json
{
  "token": "jwt_token_here"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Token verified successfully",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "User Name",
      "verified": true
    },
    "tokenInfo": {
      "issuedAt": "2025-01-27T...",
      "expiresAt": "2025-01-27T...",
      "isValid": true
    }
  }
}
```

### **4. User Profile**
```
GET /api/auth/user
```
**Purpose**: Retrieves authenticated user's profile
**Headers**:
```
Authorization: Bearer jwt_token_here
```

**Response**:
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "User Name",
      "verified": true,
      "provider": "google",
      "lastLogin": "2025-01-27T..."
    }
  }
}
```

### **5. Update User Profile**
```
PUT /api/auth/user
```
**Purpose**: Updates authenticated user's profile
**Headers**:
```
Authorization: Bearer jwt_token_here
Content-Type: application/json
```
**Body**:
```json
{
  "name": "New Name",
  "preferences": { "theme": "dark" }
}
```

### **6. Logout**
```
POST /api/auth/logout
GET /api/auth/logout?token=jwt_token_here
```
**Purpose**: Logs out user and invalidates session
**Body** (POST method):
```json
{
  "token": "jwt_token_here"
}
```

### **7. Account Deletion**
```
DELETE /api/auth/delete
GET /api/auth/delete?token=jwt_token_here&confirmDelete=true&reason=reason
```
**Purpose**: Permanently deletes user account and all associated data
**Headers** (DELETE method):
```
Authorization: Bearer jwt_token_here
Content-Type: application/json
```
**Body** (DELETE method):
```json
{
  "confirmDelete": "true",
  "reason": "User requested account deletion"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Account deleted successfully",
  "data": {
    "deletion": {
      "userId": "user_id",
      "email": "user@example.com",
      "name": "User Name",
      "deletedAt": "2025-01-27T...",
      "reason": "User requested account deletion",
      "dataRemoved": [
        "User profile",
        "Authentication tokens",
        "User sessions",
        "Associated media files",
        "User posts and content"
      ]
    },
    "instructions": [
      "Your account has been permanently deleted",
      "All associated data has been removed",
      "You will need to create a new account to use the service again"
    ]
  }
}
```

### **8. Token Refresh**
```
POST /api/auth/refresh
GET /api/auth/refresh?refreshToken=refresh_token_here
```
**Purpose**: Refreshes expired access tokens using refresh tokens
**Body** (POST method):
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "new_access_token",
    "refreshToken": "new_refresh_token",
    "expiresIn": 3600,
    "tokenType": "Bearer",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "User Name",
      "verified": true
    }
  }
}
```

### **9. Password Reset**
```
POST /api/auth/password-reset
GET /api/auth/password-reset?email=email&action=request
```
**Purpose**: Handles password reset requests and resets
**Body** (POST method):
```json
{
  "email": "user@example.com",
  "action": "request"
}
```

**Response** (Request):
```json
{
  "success": true,
  "message": "Password reset email sent successfully",
  "data": {
    "email": "user@example.com",
    "resetToken": "reset_token_here",
    "expiresAt": "2025-01-28T...",
    "instructions": [
      "Check your email for password reset instructions",
      "The reset link will expire in 24 hours"
    ]
  }
}
```

**Body** (Reset):
```json
{
  "email": "user@example.com",
  "action": "reset",
  "resetToken": "reset_token_here",
  "newPassword": "newPassword123"
}
```

## 🛠️ **Setup Instructions**

### **Prerequisites**
- Node.js 16+
- Google Cloud Console account
- Next.js project

### **1. Google Cloud Console Setup**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable required APIs:
   - Google+ API
   - Google OAuth2 API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
5. Set Application Type to "Web application"
6. Add authorized redirect URIs:
   - `https://api-rgram1.vercel.app/api/auth/google/callback`
   - `http://localhost:3000/api/auth/google/callback` (for development)
7. Copy Client ID and Client Secret

### **2. Environment Configuration**

Create a `.env.local` file in your project root:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Next.js Configuration
NEXTAUTH_URL=https://api-rgram1.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret_key_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/api_rgram1

# Environment
NODE_ENV=development
```

### **3. Install Dependencies**

```bash
npm install uuid
npm install --save-dev @types/uuid
```

## 🔄 **OAuth Flow Diagram**

```
User → /api/auth/google/init → Google OAuth → User Authorizes → Google Callback → /api/auth/google/callback → JWT Token → User Authenticated
```

## 🧪 **Testing**

### **Run Tests**
```bash
node test-google-oauth.js
```

### **Manual Testing**

1. **Test OAuth Init**:
   ```bash
   curl "https://api-rgram1.vercel.app/api/auth/google/init"
   ```

2. **Test Token Verification**:
   ```bash
   curl -X POST "https://api-rgram1.vercel.app/api/auth/verify" \
     -H "Content-Type: application/json" \
     -d '{"token": "invalid_token"}'
   ```

3. **Test User Profile**:
   ```bash
   curl "https://api-rgram1.vercel.app/api/auth/user" \
     -H "Authorization: Bearer invalid_token"
   ```

4. **Test Account Deletion**:
   ```bash
   curl -X DELETE "https://api-rgram1.vercel.app/api/auth/delete" \
     -H "Authorization: Bearer invalid_token" \
     -H "Content-Type: application/json" \
     -d '{"confirmDelete": "true", "reason": "Testing"}'
   ```

5. **Test Token Refresh**:
   ```bash
   curl -X POST "https://api-rgram1.vercel.app/api/auth/refresh" \
     -H "Content-Type: application/json" \
     -d '{"refreshToken": "invalid_token"}'
   ```

6. **Test Password Reset**:
   ```bash
   curl -X POST "https://api-rgram1.vercel.app/api/auth/password-reset" \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "action": "request"}'
   ```

## 🔒 **Security Considerations**

### **Production Recommendations**
1. **Use proper JWT library**: Replace the simple JWT implementation with `jsonwebtoken`
2. **Strong secrets**: Use cryptographically strong secrets for JWT signing
3. **HTTPS only**: Ensure all OAuth endpoints use HTTPS
4. **Token blacklisting**: Implement token blacklisting for logout
5. **Rate limiting**: Add rate limiting to prevent abuse
6. **CORS configuration**: Configure CORS properly for your domains
7. **Account deletion**: Implement proper data cleanup and audit logging
8. **Password reset**: Use secure email delivery and token expiration
9. **Refresh tokens**: Implement refresh token rotation for enhanced security

### **JWT Implementation**
Current implementation uses a simple base64 encoding. For production:

```typescript
import jwt from 'jsonwebtoken';

// Sign token
const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1h' });

// Verify token
const decoded = jwt.verify(token, process.env.JWT_SECRET!);
```

## 📱 **Frontend Integration**

### **React Component Example**
```tsx
import React, { useState } from 'react';

const GoogleLogin = () => {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // Get OAuth URL
      const response = await fetch('/api/auth/google/init');
      const data = await response.json();
      
      if (data.success) {
        // Redirect to Google OAuth
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleGoogleLogin} disabled={loading}>
      {loading ? 'Loading...' : 'Sign in with Google'}
    </button>
  );
};

export default GoogleLogin;
```

### **Handle OAuth Callback**
```tsx
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  
  if (code) {
    // Exchange code for token
    handleOAuthCallback(code);
  }
}, []);

const handleOAuthCallback = async (code: string) => {
  try {
    const response = await fetch(`/api/auth/google/callback?code=${code}`);
    const data = await response.json();
    
    if (data.success) {
      // Store token and user data
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      
      // Redirect to dashboard
      router.push('/dashboard');
    }
  } catch (error) {
    console.error('OAuth callback error:', error);
  }
};
```

### **Account Deletion Example**
```tsx
const handleAccountDeletion = async () => {
  const confirmed = window.confirm(
    'Are you sure you want to delete your account? This action cannot be undone.'
  );
  
  if (!confirmed) return;

  try {
    const response = await fetch('/api/auth/delete', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        confirmDelete: 'true',
        reason: 'User requested account deletion'
      })
    });

    const data = await response.json();
    
    if (data.success) {
      // Clear local storage and redirect
      localStorage.clear();
      router.push('/');
    }
  } catch (error) {
    console.error('Account deletion error:', error);
  }
};
```

### **Token Refresh Example**
```tsx
const refreshToken = async () => {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        refreshToken: localStorage.getItem('refreshToken')
      })
    });

    const data = await response.json();
    
    if (data.success) {
      // Update tokens
      localStorage.setItem('token', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
    }
  } catch (error) {
    // Redirect to login if refresh fails
    router.push('/login');
  }
};
```

## 🚨 **Error Handling**

### **Common Error Responses**

1. **Missing Credentials**:
   ```json
   {
     "error": "Cloudinary not configured. Please check environment variables.",
     "required": ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
     "setup": "Create a .env.local file with your Google OAuth credentials"
   }
   ```

2. **Invalid Token**:
   ```json
   {
     "error": "Invalid or expired token",
     "message": "Please login again to get a new token"
   }
   ```

3. **Missing Authorization**:
   ```json
   {
     "error": "Authorization header required",
     "message": "Please provide a valid Bearer token in the Authorization header"
   }
   ```

4. **Account Deletion Not Confirmed**:
   ```json
   {
     "error": "Account deletion not confirmed",
     "message": "Please set confirmDelete to \"true\" to proceed with account deletion",
     "warning": "This action is irreversible and will permanently delete your account and all data"
   }
   ```

5. **Invalid Password**:
   ```json
   {
     "error": "Invalid password",
     "message": "Password must be at least 8 characters long and contain letters and numbers",
     "requirements": [
       "Minimum 8 characters",
       "Must contain letters",
       "Must contain numbers",
       "Can contain special characters"
     ]
   }
   ```

## 🔄 **Deployment**

### **Vercel Deployment**
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### **Environment Variables in Vercel**
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `JWT_SECRET`

## 📚 **Additional Resources**

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [JWT.io](https://jwt.io/) - JWT Debugger
- [Google Cloud Console](https://console.cloud.google.com/)

## 🤝 **Support**

For issues and questions:
1. Check the error logs in your deployment platform
2. Verify environment variables are set correctly
3. Ensure Google OAuth credentials are properly configured
4. Test with the provided test suite
5. All endpoints are now available and documented

---

**Built with ❤️ using Next.js, TypeScript, and Google OAuth 2.0**
