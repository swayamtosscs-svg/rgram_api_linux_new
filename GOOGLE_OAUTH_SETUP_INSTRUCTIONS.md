# Google OAuth Setup Instructions

## Step 1: Google Cloud Console Setup

1. Go to https://console.cloud.google.com/
2. Create a new project or select existing one
3. Enable these APIs:
   - Google+ API
   - Google OAuth2 API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client IDs
5. Set Application Type to "Web application"
6. Add these Authorized redirect URIs:
   - https://api-rgram1.vercel.app/api/auth/google/callback
   - http://localhost:3000/api/auth/google/callback (for development)
7. Copy Client ID and Client Secret

## Step 2: Vercel Environment Variables

1. Go to your Vercel dashboard
2. Select your RGram API project
3. Go to Settings → Environment Variables
4. Add each variable from the .env.template file
5. Redeploy your project

## Step 3: Test the Setup

1. Visit: https://api-rgram1.vercel.app/google-oauth-demo.html
2. Click "Sign in with Google"
3. Complete the OAuth flow
4. You'll be redirected back to the demo page with your user info displayed

## Step 4: Verify Configuration

Run: node check-google-oauth-env.js

## Troubleshooting

- If you see "Mock Mode: ENABLED", set MOCK_GOOGLE_AUTH=false
- If you get "Redirect URI mismatch", verify the exact URI in Google Console
- If you get "Google OAuth configuration is missing", check environment variables
