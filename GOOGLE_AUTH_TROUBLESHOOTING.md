# Google Auth Troubleshooting Guide

## Common Issues and Solutions

### 1. Google Auth Blocked in Production

If you're experiencing issues with Google authentication in production (e.g., on Vercel), it might be due to network restrictions or DNS resolution problems.

#### Solution: Enable Mock Google Auth

We've implemented a mock Google authentication system that can be used when the real Google OAuth service is inaccessible.

1. **Set the environment variable in Vercel:**
   - Go to your Vercel project dashboard
   - Navigate to Settings > Environment Variables
   - Add a new environment variable: `MOCK_GOOGLE_AUTH` with value `true`

2. **How it works:**
   - When `MOCK_GOOGLE_AUTH=true`, the system will bypass the actual Google OAuth flow
   - Instead, it will use a mock authentication process that simulates Google login
   - This is useful for testing or when Google services are blocked

3. **Limitations:**
   - Mock authentication uses predefined test user data
   - It doesn't validate real Google credentials
   - Should only be used temporarily or for testing purposes

### 2. DNS Resolution Failures

If you're seeing errors related to DNS resolution for Google domains:

```
DNS resolution error for Google APIs
```

#### Solutions:

1. **Check network connectivity** to Google services from your server
2. **Verify DNS settings** on your hosting provider
3. **Enable Mock Google Auth** as described above as a temporary workaround

### 3. Redirect URI Mismatch

If you're getting errors about redirect URI mismatch:

#### Solutions:

1. **Verify your Google Cloud Console settings**:
   - Make sure the redirect URI in your Google Cloud Console matches exactly with your `GOOGLE_CALLBACK_URL` environment variable
   - For production, this should be something like `https://your-domain.com/api/auth/google/callback`

2. **Check environment variables**:
   - Ensure `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_CALLBACK_URL` are correctly set in your environment

### 4. Client-Side Integration Issues

If the client-side integration is not working:

#### Solutions:

1. **Check browser console** for any errors
2. **Verify the API endpoint** is correctly configured
3. **Test with the mock authentication** by setting `MOCK_GOOGLE_AUTH=true`

## Testing Google Auth

You can test the Google authentication flow using our test page:

```
/auth/test-google-auth
```

This page provides a simple interface to test both the real Google authentication and the mock authentication process.