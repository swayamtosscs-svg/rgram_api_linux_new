# Google OAuth Setup Guide for RGram API

This guide explains how to set up and use Google OAuth authentication with your RGram API deployed at https://api-rgram1.vercel.app/

## 🚀 Quick Start

1. **Test the Demo**: Visit https://api-rgram1.vercel.app/google-oauth-demo.html
2. **Click "Sign in with Google"** to test the OAuth flow
3. **Complete the Google login** process
4. **View your user information** after successful authentication

## 🔧 Setup Instructions

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Google+ API
   - Google OAuth2 API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
5. Set Application Type to **"Web application"**
6. Add these **Authorized redirect URIs**:
   ```
   https://api-rgram1.vercel.app/api/auth/google/callback
   http://localhost:3000/api/auth/google/callback (for development)
   ```
7. Copy your **Client ID** and **Client Secret**

### 2. Environment Variables

Create a `.env.local` file in your project root with these variables:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=https://api-rgram1.vercel.app/api/auth/google/callback

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Database Configuration
MONGODB_URI=your_mongodb_connection_string

# CORS Configuration
CORS_ORIGIN=https://api-rgram1.vercel.app

# Environment
NODE_ENV=production
```

### 3. Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add the environment variables in Vercel dashboard
4. Deploy

## 📁 API Endpoints

### 1. Initialize Google OAuth
```
GET /api/auth/google/init
```
**Response:**
```json
{
  "success": true,
  "data": {
    "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
  }
}
```

### 2. Google OAuth Callback
```
GET /api/auth/google/callback?code=AUTHORIZATION_CODE
```
**Response:** Redirects to frontend with JWT token

### 3. Get User Info (Protected)
```
GET /api/auth/user
Authorization: Bearer JWT_TOKEN
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "username123",
    "fullName": "Full Name",
    "avatar": "avatar_url",
    "isEmailVerified": true
  }
}
```

## 🔄 OAuth Flow

1. **User clicks "Sign in with Google"**
2. **Frontend calls** `/api/auth/google/init`
3. **Backend returns** Google OAuth URL
4. **User is redirected** to Google login page
5. **User authenticates** with Google
6. **Google redirects** to `/api/auth/google/callback` with authorization code
7. **Backend exchanges** code for access token
8. **Backend fetches** user info from Google
9. **Backend creates/updates** user in database
10. **Backend generates** JWT token
11. **User is redirected** to frontend with token
12. **Frontend stores** token and displays user info

## 🧪 Testing

### Test the Live API
Visit: https://api-rgram1.vercel.app/google-oauth-demo.html

### Test with Postman
1. **Initialize OAuth:**
   ```
   GET https://api-rgram1.vercel.app/api/auth/google/init
   ```

2. **Test Callback (with mock):**
   ```
   GET https://api-rgram1.vercel.app/api/auth/google/callback?test=true&format=json
   ```

3. **Get User Info:**
   ```
   GET https://api-rgram1.vercel.app/api/auth/user
   Authorization: Bearer YOUR_JWT_TOKEN
   ```

## 🔒 Security Features

- **JWT Token Authentication**: Secure user sessions
- **Email Auto-verification**: Google users are automatically verified
- **Unique Username Generation**: Prevents conflicts
- **Password Generation**: Secure random passwords for Google users
- **Last Active Tracking**: User activity monitoring

## 🐛 Troubleshooting

### Common Issues

1. **"Google OAuth configuration is missing"**
   - Check environment variables in Vercel
   - Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set

2. **"Redirect URI mismatch"**
   - Verify redirect URI in Google Cloud Console matches exactly
   - Check for trailing slashes or protocol mismatches

3. **"DNS resolution failed"**
   - Google services might be blocked in your region
   - Check firewall/proxy settings

4. **"Invalid token"**
   - Token might be expired
   - Check JWT_SECRET configuration
   - Verify token format

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

### Mock Mode

For testing without Google APIs, set:
```env
MOCK_GOOGLE_AUTH=true
```

## 📱 Frontend Integration

### React Component Example

```tsx
import { initGoogleAuth } from '../lib/utils/googleAuth';

const GoogleLoginButton = () => {
  const handleGoogleLogin = async () => {
    try {
      const authUrl = await initGoogleAuth();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Google login failed:', error);
    }
  };

  return (
    <button onClick={handleGoogleLogin}>
      Sign in with Google
    </button>
  );
};
```

### Handle Callback

```tsx
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  if (token) {
    localStorage.setItem('auth_token', token);
    // Redirect to dashboard or home
    window.location.href = '/dashboard';
  }
}, []);
```

## 🌐 CORS Configuration

Ensure your frontend domain is added to CORS_ORIGIN:

```env
CORS_ORIGIN=https://your-frontend-domain.com
```

## 📊 Database Schema

The Google OAuth creates users with this structure:

```json
{
  "email": "user@gmail.com",
  "googleId": "google_user_id",
  "fullName": "User Full Name",
  "username": "user123",
  "password": "random_secure_password",
  "avatar": "google_profile_picture_url",
  "isEmailVerified": true,
  "lastActive": "2024-01-01T00:00:00.000Z"
}
```

## 🚀 Production Deployment

1. **Set NODE_ENV=production**
2. **Use strong JWT_SECRET**
3. **Configure proper CORS_ORIGIN**
4. **Enable HTTPS redirects**
5. **Monitor API logs for errors**

## 📞 Support

If you encounter issues:

1. Check the browser console for errors
2. Verify environment variables are set correctly
3. Test with the demo page first
4. Check Vercel deployment logs
5. Ensure Google Cloud Console configuration is correct

## 🔗 Useful Links

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [JWT Token Guide](https://jwt.io/introduction)
- [RGram API Base URL](https://api-rgram1.vercel.app/)

---

**Happy Coding! 🎉**
