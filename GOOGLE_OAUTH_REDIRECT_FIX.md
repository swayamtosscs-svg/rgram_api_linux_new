# Fixing Google OAuth Redirect URI Mismatch Error

## Problem

When trying to sign in with Google, you're encountering the following error:

```
Access blocked: This app's request is invalid
Error 400: redirect_uri_mismatch
```

This error occurs when the redirect URI that your application is using doesn't match any of the authorized redirect URIs configured in the Google Cloud Console.

## Solution

### 1. Identify Your Redirect URIs

Based on the application code and configuration, the following redirect URIs are being used:

- `http://localhost:3000/api/auth/google/callback` (Local development)
- `https://api-rgram1.vercel.app/api/auth/google/callback` (Production)
- `http://localhost:3000/api/auth/google/callback` (Alternative local development)

### 2. Update Google Cloud Console Configuration

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Find and click on your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, add all of the following URIs:
   - `http://localhost:3000/api/auth/google/callback`
   - `https://api-rgram1.vercel.app/api/auth/google/callback`
   - `http://localhost:3000/api/auth/google/callback`
5. Click **Save**

### 3. Verify Environment Variables

Ensure your application's environment variables are correctly set:

```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

For production deployment, make sure to update the `GOOGLE_CALLBACK_URL` to match your production URL.

### 4. Testing the Fix

After updating the redirect URIs in Google Cloud Console:

1. Try signing in with Google again
2. If you're still experiencing issues, check the browser console for any errors
3. Verify that the URL in the address bar matches exactly one of the authorized redirect URIs

## Common Mistakes

- **Trailing slashes**: Make sure there are no trailing slashes in your URIs unless specifically required
- **HTTP vs HTTPS**: The protocol must match exactly (http:// vs https://)
- **Case sensitivity**: URIs are case-sensitive, so ensure the casing matches
- **Port numbers**: If using a non-standard port, it must be included in the authorized URI

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth 2.0 Redirect URI Guide](https://developers.google.com/identity/protocols/oauth2/web-server#uri-validation)