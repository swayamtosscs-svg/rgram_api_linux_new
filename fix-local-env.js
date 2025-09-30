#!/usr/bin/env node

const fs = require('fs');

console.log('🔧 Fixing Environment Configuration for Local Development...\n');

// Check if .env.local exists
if (fs.existsSync('.env.local')) {
  let content = fs.readFileSync('.env.local', 'utf8');
  
  console.log('📝 Current .env.local content:');
  console.log(content);
  console.log('\n🔧 Updating for local development...');
  
  // Update NODE_ENV to development
  content = content.replace(/NODE_ENV=production/g, 'NODE_ENV=development');
  
  // Update NEXT_PUBLIC_APP_URL to localhost
  content = content.replace(/NEXT_PUBLIC_APP_URL=http:\/\/103\.14\.120\.\d+:8081/g, 'NEXT_PUBLIC_APP_URL=http://localhost:3000');
  
  // If NEXT_PUBLIC_APP_URL doesn't exist, add it
  if (!content.includes('NEXT_PUBLIC_APP_URL=')) {
    content += '\nNEXT_PUBLIC_APP_URL=http://localhost:3000';
  }
  
  fs.writeFileSync('.env.local', content);
  
  console.log('✅ Updated .env.local for local development');
  console.log('\n📋 Changes made:');
  console.log('- NODE_ENV: production → development');
  console.log('- NEXT_PUBLIC_APP_URL: server IP → localhost:3000');
  
} else {
  console.log('⚠️  .env.local file not found');
  console.log('💡 Creating new .env.local for local development...');
  
  const localEnvContent = `# Local Development Environment
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database Configuration
MONGODB_URI=mongodb+srv://tossitswayam:Qwert123%23%24@cluster0.tpk0nle.mongodb.net/api_rgram?retryWrites=true&w=majority

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_gmail@gmail.com

# JWT Configuration
JWT_SECRET=rgram_jwt_secret_key_2024_secure_random_string_12345

# OTP Configuration
OTP_EXPIRE_MINUTES=10
`;

  fs.writeFileSync('.env.local', localEnvContent);
  console.log('✅ Created new .env.local file');
}

console.log('\n🎉 Environment configuration fixed!');
console.log('🔄 Please restart your development server:');
console.log('   1. Stop current server (Ctrl+C)');
console.log('   2. Run: npm run dev');
console.log('   3. Test forgot password at: http://localhost:3000/forgot-password');
