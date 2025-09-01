#!/usr/bin/env node

/**
 * Real Google OAuth Setup Script
 * This script helps you configure real Google OAuth for RGram
 */

const fs = require('fs');
const path = require('path');

console.log('🔐 Real Google OAuth Setup for RGram');
console.log('=====================================\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('📁 Found existing .env.local file');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check for Google OAuth variables
  const hasGoogleClientId = envContent.includes('GOOGLE_CLIENT_ID=');
  const hasGoogleClientSecret = envContent.includes('GOOGLE_CLIENT_SECRET=');
  const hasGoogleCallbackUrl = envContent.includes('GOOGLE_CALLBACK_URL=');
  const hasMockAuth = envContent.includes('MOCK_GOOGLE_AUTH=');
  
  console.log('\n📊 Current Configuration:');
  console.log(`   GOOGLE_CLIENT_ID: ${hasGoogleClientId ? '✅ Set' : '❌ Missing'}`);
  console.log(`   GOOGLE_CLIENT_SECRET: ${hasGoogleClientSecret ? '✅ Set' : '❌ Missing'}`);
  console.log(`   GOOGLE_CALLBACK_URL: ${hasGoogleCallbackUrl ? '✅ Set' : '❌ Missing'}`);
  console.log(`   MOCK_GOOGLE_AUTH: ${hasMockAuth ? '✅ Set' : '❌ Missing'}`);
  
  if (hasGoogleClientId && hasGoogleClientSecret && hasGoogleCallbackUrl) {
    console.log('\n🎉 Google OAuth is already configured!');
    console.log('To enable real Google OAuth, set:');
    console.log('   MOCK_GOOGLE_AUTH=false');
    console.log('\nTo test real Google OAuth:');
    console.log('   curl -X GET "http://localhost:3000/api/auth/google/init"');
  } else {
    console.log('\n⚠️  Google OAuth is not fully configured.');
    console.log('Follow the setup guide to configure it properly.');
  }
} else {
  console.log('📁 No .env.local file found');
  console.log('Creating template .env.local file...\n');
  
  const templateEnv = `# Google OAuth Configuration
# Get these from Google Cloud Console: https://console.cloud.google.com/
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Set to false for real Google OAuth, true for mock mode
MOCK_GOOGLE_AUTH=false

# Other required variables
JWT_SECRET=your_jwt_secret_here
MONGODB_URI=your_mongodb_connection_string

# Optional: For production
# GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
`;

  fs.writeFileSync(envPath, templateEnv);
  console.log('✅ Created .env.local template file');
  console.log('📝 Please edit the file and add your Google OAuth credentials');
}

console.log('\n📋 Setup Instructions:');
console.log('1. Go to Google Cloud Console: https://console.cloud.google.com/');
console.log('2. Create a new project or select existing one');
console.log('3. Enable Google+ API or Google Identity API');
console.log('4. Create OAuth 2.0 credentials (Web application)');
console.log('5. Add redirect URI: http://localhost:3000/api/auth/google/callback');
console.log('6. Copy Client ID and Client Secret');
console.log('7. Update .env.local with your credentials');
console.log('8. Set MOCK_GOOGLE_AUTH=false');
console.log('9. Restart your development server');

console.log('\n🧪 Test Commands:');
console.log('1. Test OAuth Init:');
console.log('   curl -X GET "http://localhost:3000/api/auth/google/init"');
console.log('\n2. Test with Browser:');
console.log('   - Copy the authUrl from the response');
console.log('   - Open in browser and complete Google login');
console.log('   - Check the callback URL for authorization code');
console.log('\n3. Test Callback:');
console.log('   curl -X GET "http://localhost:3000/api/auth/google/callback?code=YOUR_AUTH_CODE"');

console.log('\n🎯 Expected Results:');
console.log('- Real Google OAuth URL (not mock)');
console.log('- User data fetched from your Google account');
console.log('- Real name, email, and avatar from Google');
console.log('- No more "undefined" accounts');

console.log('\n📖 For detailed setup guide, see: GOOGLE_OAUTH_REAL_SETUP.md');
console.log('\n🚀 Happy coding! 🚀');
