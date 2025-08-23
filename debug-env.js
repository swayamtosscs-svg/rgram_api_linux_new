// Debug script to check environment variables and configuration
// Run this to identify why the API is returning 500 errors

console.log('🔍 Debugging Environment Variables...\n');

// Check required environment variables
const requiredEnvVars = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY', 
  'CLOUDINARY_API_SECRET',
  'MONGODB_URI'
];

console.log('📋 Required Environment Variables:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 10)}...`);
  } else {
    console.log(`❌ ${varName}: NOT SET`);
  }
});

console.log('\n🔧 Node Environment:', process.env.NODE_ENV || 'not set');
console.log('📁 Current Directory:', process.cwd());

// Check if .env.local exists
const fs = require('fs');
const path = require('path');

const envFiles = [
  '.env.local',
  '.env',
  '.env.development',
  '.env.production'
];

console.log('\n📄 Environment Files:');
envFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} not found`);
  }
});

// Test MongoDB connection
console.log('\n🗄️ Testing MongoDB Connection...');
try {
  const mongoose = require('mongoose');
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    console.log('❌ MONGODB_URI not set');
  } else {
    console.log('✅ MONGODB_URI is set');
    console.log('🔗 URI starts with:', MONGODB_URI.substring(0, 20) + '...');
  }
} catch (error) {
  console.log('❌ Mongoose not available:', error.message);
}

// Test Cloudinary configuration
console.log('\n☁️ Testing Cloudinary Configuration...');
try {
  const { v2: cloudinary } = require('cloudinary');
  
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  
  if (cloudName && apiKey && apiSecret) {
    console.log('✅ All Cloudinary variables are set');
    console.log('☁️ Cloud Name:', cloudName);
    console.log('🔑 API Key starts with:', apiKey.substring(0, 10) + '...');
    console.log('🔐 API Secret starts with:', apiSecret.substring(0, 10) + '...');
  } else {
    console.log('❌ Some Cloudinary variables are missing');
  }
} catch (error) {
  console.log('❌ Cloudinary not available:', error.message);
}

console.log('\n📝 Next Steps:');
console.log('1. If any variables are missing, create a .env.local file');
console.log('2. Add the missing environment variables');
console.log('3. Restart your development server');
console.log('4. Test the API again');

console.log('\n🔗 Example .env.local content:');
console.log('CLOUDINARY_CLOUD_NAME=your_cloud_name');
console.log('CLOUDINARY_API_KEY=your_api_key');
console.log('CLOUDINARY_API_SECRET=your_api_secret');
console.log('MONGODB_URI=mongodb://localhost:27017/rgram1');
