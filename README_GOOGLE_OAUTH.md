# Google OAuth Integration Guide

## Overview

This guide provides comprehensive instructions for setting up and troubleshooting Google OAuth authentication in the API_RGRAM application.

## Setup Instructions

### 1. Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** and select **OAuth client ID**
5. Set the application type to **Web application**
6. Add a name for your OAuth client
7. Add authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - `https://api-rgram1.vercel.app` (for production)
8. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/google/callback` (for development)
   - `https://api-rgram1.vercel.app/api/auth/google/callback` (for production)
9. Click **Create**
10. Note your Client ID and Client Secret

### 2. Configure Environment Variables

Update the following variables in your `.env.local` file:

```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

For production, set `GOOGLE_CALLBACK_URL` to your production URL.

## Common Issues and Solutions

### Error 400: redirect_uri_mismatch

#### Problem

When trying to sign in with Google, you see an error message:

```
Access blocked: This app's request is invalid
Error 400: redirect_uri_mismatch
```

#### Solution

1. **Verify your Google Cloud Console settings**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to **APIs & Services** > **Credentials**
   - Find your OAuth 2.0 Client ID
   - Make sure the redirect URI in your Google Cloud Console matches exactly with your `GOOGLE_CALLBACK_URL` environment variable
   - Add all necessary redirect URIs:
     - `http://localhost:3000/api/auth/google/callback`
     - `https://api-rgram1.vercel.app/api/auth/google/callback`

2. **Check environment variables**:
   - Ensure `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_CALLBACK_URL` are correctly set in your environment

3. **Run the verification script**:
   ```
   npm run verify-oauth
   ```
   This script will check your configuration and provide recommendations.

### DNS Resolution Failures

If you're seeing errors related to DNS resolution for Google domains:

#### Solution

1. **Check network connectivity** to Google services from your server
2. **Verify DNS settings** on your hosting provider
3. **Enable Mock Google Auth** by setting `MOCK_GOOGLE_AUTH=true` in your environment variables

## Testing Google Auth

### Using the Test Page

We've provided a test page to verify your Google OAuth configuration:

```
/public/google-oauth-test.html
```

This page provides a simple interface to test the Google authentication flow.

### Using the Verification Script

Run the verification script to check your configuration:

```
npm run verify-oauth
```

This script will:
1. Check if required environment variables are set
2. Test DNS resolution to Google APIs
3. Validate your redirect URIs
4. Provide recommendations for fixing any issues

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth 2.0 Redirect URI Guide](https://developers.google.com/identity/protocols/oauth2/web-server#uri-validation)