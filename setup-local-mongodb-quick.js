#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('🚀 Setting up Local MongoDB for R-GRAM API...\n');

// Create .env.local file with local MongoDB configuration
const envContent = `# R-GRAM API Environment Variables
# Local MongoDB Configuration for Development

# Database Configuration - Local MongoDB
MONGODB_URI=mongodb://localhost:27017/api_rgram

# Email Configuration (Gmail Example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_gmail@gmail.com

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
APP_NAME=R-GRAM
NODE_ENV=development

# OTP Configuration
OTP_EXPIRE_MINUTES=10

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
`;

try {
  // Create .env.local file
  fs.writeFileSync('.env.local', envContent);
  console.log('✅ Created .env.local file with local MongoDB configuration');
  
  console.log('\n📋 Next steps to complete setup:');
  console.log('1. Install MongoDB locally:');
  console.log('   - Windows: Download from https://www.mongodb.com/try/download/community');
  console.log('   - Or run: npm install -g mongodb');
  console.log('');
  console.log('2. Start MongoDB service:');
  console.log('   - Windows: Start MongoDB service from Services');
  console.log('   - Or run: mongod');
  console.log('');
  console.log('3. Test the connection by running your API');
  console.log('');
  console.log('💡 The database.ts file has been updated to use local MongoDB by default');
  console.log('💡 If you want to use MongoDB Atlas later, update MONGODB_URI in .env.local');
  
} catch (error) {
  console.error('❌ Error creating .env.local:', error.message);
  console.log('\n🔧 Manual setup:');
  console.log('1. Create .env.local file in your project root');
  console.log('2. Add: MONGODB_URI=mongodb://localhost:27017/api_rgram');
  console.log('3. Install and start MongoDB locally');
}
