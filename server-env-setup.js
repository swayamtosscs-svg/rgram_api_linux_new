#!/usr/bin/env node

/**
 * Server Environment Setup Script
 * This script helps configure the server environment for assets API
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up server environment for assets API...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local not found. Creating from template...');
  
  const envTemplate = `# MongoDB Configuration
MONGODB_URI=mongodb+srv://tossitswayam:Qwert123%23%24@cluster0.tpk0nle.mongodb.net/api_rgram?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=rgram_jwt_secret_key_2024_secure_random_string_12345

# Server Configuration
NODE_ENV=production
PORT=3000

# Assets Configuration
ASSETS_BASE_PATH=/assets
ASSETS_MAX_SIZE=104857600
`;

  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ Created .env.local file');
} else {
  console.log('✅ .env.local already exists');
}

// Check public/assets directory
const assetsDir = path.join(process.cwd(), 'public', 'assets');
if (!fs.existsSync(assetsDir)) {
  console.log('📁 Creating public/assets directory...');
  fs.mkdirSync(assetsDir, { recursive: true });
  console.log('✅ Created public/assets directory');
} else {
  console.log('✅ public/assets directory exists');
}

// Create .gitkeep file to ensure directory is tracked
const gitkeepPath = path.join(assetsDir, '.gitkeep');
if (!fs.existsSync(gitkeepPath)) {
  fs.writeFileSync(gitkeepPath, '# This file ensures the assets directory is tracked by git');
  console.log('✅ Created .gitkeep file');
}

// Check permissions
console.log('\n🔍 Checking directory permissions...');
try {
  const testFile = path.join(assetsDir, 'test-permissions.txt');
  fs.writeFileSync(testFile, 'test');
  fs.unlinkSync(testFile);
  console.log('✅ Write permissions OK');
} catch (error) {
  console.log('❌ Write permission error:', error.message);
  console.log('💡 Try running: sudo chmod -R 755 public/assets');
}

console.log('\n🎯 Server environment setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Make sure your server IP is whitelisted in MongoDB Atlas');
console.log('2. Restart your server: pm2 restart all');
console.log('3. Test the upload API with a curl command');
