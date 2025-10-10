const fs = require('fs');
const path = require('path');

console.log('🚀 Google OAuth Setup for RGram API\n');

// Create environment template
const envTemplate = `# Google OAuth Environment Variables
# Copy these to your Vercel dashboard environment variables

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=https://api-rgram1.vercel.app/api/auth/google/callback

# JWT Configuration
JWT_SECRET=your_strong_jwt_secret_here

# Database Configuration
MONGODB_URI=your_mongodb_connection_string

# CORS Configuration
CORS_ORIGIN=https://api-rgram1.vercel.app

# Environment
NODE_ENV=production

# OAuth Mode (set to false for production)
MOCK_GOOGLE_AUTH=false
`;

// Create setup instructions
const setupInstructions = `# Google OAuth Setup Instructions

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
4. Verify user information is displayed

## Step 4: Verify Configuration

Run: node check-google-oauth-env.js

## Troubleshooting

- If you see "Mock Mode: ENABLED", set MOCK_GOOGLE_AUTH=false
- If you get "Redirect URI mismatch", verify the exact URI in Google Console
- If you get "Google OAuth configuration is missing", check environment variables
`;

// Create files
try {
    // Create .env.template
    fs.writeFileSync('.env.template', envTemplate);
    console.log('✅ Created .env.template file');
    
    // Create setup instructions
    fs.writeFileSync('GOOGLE_OAUTH_SETUP_INSTRUCTIONS.md', setupInstructions);
    console.log('✅ Created GOOGLE_OAUTH_SETUP_INSTRUCTIONS.md file');
    
    console.log('\n📁 Files created successfully!');
    console.log('\n🎯 Next Steps:');
    console.log('   1. Follow the instructions in GOOGLE_OAUTH_SETUP_INSTRUCTIONS.md');
    console.log('   2. Set up Google Cloud Console OAuth credentials');
    console.log('   3. Configure environment variables in Vercel');
    console.log('   4. Test with the demo page');
    console.log('\n🔗 Useful Links:');
    console.log('   - Demo Page: https://api-rgram1.vercel.app/google-oauth-demo.html');
    console.log('   - Google Cloud Console: https://console.cloud.google.com/');
    console.log('   - Vercel Dashboard: https://vercel.com/dashboard');
    
} catch (error) {
    console.error('❌ Error creating files:', error.message);
}
