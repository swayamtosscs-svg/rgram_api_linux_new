# 🚀 Google Login API - Complete Implementation Guide

## 📋 Overview

Your RGram API already has a **complete Google OAuth implementation** that handles user registration, login, and authentication. Here's everything you need to know:

## 🔧 Available API Endpoints

### 1. Initialize Google OAuth
```
GET /api/auth/google/init
```
**Purpose**: Gets the Google OAuth URL to redirect users for authentication

**Response**:
```json
{
  "success": true,
  "data": {
    "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?...",
    "isMock": false,
    "message": "Real Google OAuth URL generated"
  }
}
```

### 2. Google OAuth Callback
```
GET /api/auth/google/callback?code=AUTHORIZATION_CODE
```
**Purpose**: Handles the callback from Google after user authentication

**Response**: Redirects to demo page with JWT token

### 3. Direct Google Login (Alternative)
```
POST /api/auth/google
```
**Purpose**: Direct login with Google user data

**Request Body**:
```json
{
  "email": "user@gmail.com",
  "name": "User Name",
  "googleId": "google_user_id",
  "avatar": "https://profile-picture-url.com"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Google login successful",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@gmail.com",
      "username": "user1234",
      "fullName": "User Name",
      "avatar": "https://profile-picture-url.com",
      "isEmailVerified": true,
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

### 4. Get Authenticated User
```
GET /api/auth/user
Authorization: Bearer JWT_TOKEN
```
**Purpose**: Get current authenticated user information

## 🛠️ Setup Instructions

### Step 1: Environment Configuration
1. Copy `ENV_TEMPLATE.txt` to `.env.local`
2. Fill in your configuration values:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/rgram_api

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Google OAuth (for real authentication)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Testing Mode (set to true for testing without Google setup)
MOCK_GOOGLE_AUTH=true
```

### Step 2: Google Cloud Console Setup (For Real OAuth)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set Application type to "Web application"
6. Add authorized redirect URI: `http://localhost:3000/api/auth/google/callback`
7. Copy Client ID and Client Secret to your `.env.local`

### Step 3: Test the API

#### Option A: Test with Mock Data (Recommended for Development)
```bash
# Set MOCK_GOOGLE_AUTH=true in .env.local
# Then test the init endpoint
curl http://localhost:3000/api/auth/google/init

# Test the callback with mock data
curl "http://localhost:3000/api/auth/google/callback?test=true&format=json"
```

#### Option B: Test with Real Google OAuth
```bash
# Set MOCK_GOOGLE_AUTH=false in .env.local
# Configure real Google credentials
# Then test the init endpoint
curl http://localhost:3000/api/auth/google/init
```

## 📱 Frontend Integration

### React/Next.js Example

```javascript
// Initialize Google OAuth
const initGoogleLogin = async () => {
  try {
    const response = await fetch('/api/auth/google/init');
    const data = await response.json();
    
    if (data.success) {
      // Redirect to Google OAuth URL
      window.location.href = data.data.authUrl;
    }
  } catch (error) {
    console.error('Google login init error:', error);
  }
};

// Handle Google OAuth callback
const handleGoogleCallback = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  if (token) {
    // Store token and redirect to app
    localStorage.setItem('authToken', token);
    window.location.href = '/dashboard';
  }
};
```

### Mobile App Integration

```javascript
// For React Native or mobile apps
const googleLogin = async () => {
  try {
    // Use Google Sign-In SDK to get user data
    const googleUser = await GoogleSignin.signIn();
    
    // Send user data to your API
    const response = await fetch('/api/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: googleUser.user.email,
        name: googleUser.user.name,
        googleId: googleUser.user.id,
        avatar: googleUser.user.photo
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Store token and proceed
      await AsyncStorage.setItem('authToken', data.data.token);
      // Navigate to main app
    }
  } catch (error) {
    console.error('Google login error:', error);
  }
};
```

## 🔐 Security Features

1. **JWT Token Authentication**: Secure token-based authentication
2. **Email Verification**: Google users are automatically email verified
3. **User Data Validation**: Validates all incoming Google user data
4. **Database Integration**: Stores user data in MongoDB with proper indexing
5. **Error Handling**: Comprehensive error handling and logging

## 📊 Database Schema

The User model already includes Google OAuth fields:
- `googleId`: Unique Google user ID
- `email`: User's email (verified by Google)
- `fullName`: User's full name from Google
- `avatar`: Profile picture URL from Google
- `isEmailVerified`: Automatically set to true for Google users

## 🚀 Production Deployment

1. Set `MOCK_GOOGLE_AUTH=false`
2. Configure real Google OAuth credentials
3. Update `GOOGLE_CALLBACK_URL` to your production domain
4. Set strong `JWT_SECRET`
5. Configure production MongoDB URI

## 🧪 Testing

The API includes comprehensive testing capabilities:
- Mock mode for development testing
- Real Google OAuth for production
- Error handling and validation
- Database connection testing

## 📞 Support

Your Google Login API is ready to use! The implementation handles:
- ✅ User registration via Google
- ✅ User login via Google  
- ✅ JWT token generation
- ✅ Database integration
- ✅ Error handling
- ✅ Security validation

Just configure your environment variables and start using the API endpoints!
