# Google OAuth Integration Setup

This document provides instructions for setting up Google OAuth authentication in the API_RGRAM application.

## Prerequisites

1. A Google Cloud Platform account
2. MongoDB database
3. Node.js and npm installed

## Setup Steps

### 1. Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" and select "OAuth client ID"
5. Set the application type to "Web application"
6. Add a name for your OAuth client
7. Add authorized JavaScript origins (e.g., `http://localhost:3000`)
8. Add authorized redirect URIs (e.g., `http://localhost:3000/api/auth/google/callback`)
9. Click "Create"
10. Note your Client ID and Client Secret

### 2. Configure Environment Variables

1. Copy the `.env.example` file to `.env.local` (if not already done)
2. Update the following variables in your `.env.local` file:

```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

### 3. API Endpoints

The following API endpoints are available for Google OAuth authentication:

#### Initialize Google OAuth

```
GET /api/auth/google/init
```

Returns a Google authorization URL that the client should redirect to.

#### Google OAuth Callback

```
GET /api/auth/google/callback?code={authorization_code}
```

Handles the callback from Google after user authorization. Redirects to the frontend with a JWT token.

#### Direct Google Authentication

```
POST /api/auth/google

Body:
{
  "email": "user@example.com",
  "name": "User Name",
  "googleId": "google_user_id",
  "avatar": "profile_image_url" (optional)
}
```

For client-side Google authentication flows. Authenticates or creates a user based on Google profile information.

### 4. Client-Side Integration

You can use the provided utility functions in `lib/utils/googleAuth.ts` to integrate Google authentication in your frontend:

```typescript
import { authenticateWithGoogle, initGoogleAuth } from '../lib/utils/googleAuth';

// Initialize Google OAuth client
initGoogleAuth();

// Handle Google login
async function handleGoogleLogin(googleResponse) {
  try {
    const authResult = await authenticateWithGoogle(googleResponse);
    // Store token and redirect user
    localStorage.setItem('token', authResult.data.token);
    // Redirect to dashboard or home page
  } catch (error) {
    console.error('Google login failed:', error);
  }
}
```

### 5. Alternative: Server-Side Flow

For a server-side flow:

1. Redirect the user to the URL from `/api/auth/google/init`
2. Google will redirect back to your callback URL with an authorization code
3. The callback endpoint will handle user creation/authentication and redirect to your frontend with a token

## User Model

The User model has been updated to include a `googleId` field that stores the Google user ID for authentication.

## Security Considerations

1. Always use HTTPS in production
2. Keep your Client Secret secure
3. Validate all user input
4. Consider implementing rate limiting for authentication endpoints
5. Regularly rotate your JWT secret

## Troubleshooting

- If you encounter CORS issues, ensure your frontend origin is listed in the `CORS_ORIGIN` environment variable
- Check that your redirect URI exactly matches what's configured in the Google Cloud Console
- Verify that all required environment variables are set correctly
- Check server logs for detailed error messages