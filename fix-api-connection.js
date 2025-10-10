// Fix API Connection for VPS
const fs = require('fs');

console.log('🔧 Creating VPS API Fix...\n');

// Option 1: Use local MongoDB on VPS
const localVPSConfig = `# VPS Local MongoDB Configuration
NODE_ENV=production
HOST_ENV=VPS

# Use LOCAL MongoDB on VPS (localhost:27017)
MONGODB_URI=mongodb://Toss:Toss%40123@localhost:27017/admin

# JWT Secret
JWT_SECRET=9vQNPH6kL1jZ2JVsla8czb0WiEngqT7tUuGoYpxwSKyeXhC3A4mMfRBrIDdO5F

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=swayam.toss.cs@gmail.com
SMTP_PASS=yawq uwvk pode lmpc

# Application Configuration
NEXT_PUBLIC_APP_URL=http://103.14.120.163:8081
APP_NAME=RGram
PORT=8081

# Security Settings
PASSWORD_RESET_TOKEN_EXPIRY=900000

# Email Configuration for Forgot Password API
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=swayam.toss.cs@gmail.com
EMAIL_PASS=yawq uwvk pode lmpc
EMAIL_FROM=swayam.toss.cs@gmail.com
`;

fs.writeFileSync('.env.vps-local', localVPSConfig);
console.log('✅ Created .env.vps-local (uses localhost MongoDB on VPS)');

// Quick fix for current deployment
const quickFix = `#!/bin/bash
# Quick Fix for VPS API

echo "🚀 Quick fixing VPS API..."

# Copy the local VPS config
cp .env.vps-local .env

# Set environment variables
export NODE_ENV=production
export HOST_ENV=VPS
export PORT=8081
export MONGODB_URI="mongodb://Toss:Toss%40123@localhost:27017/admin"

# Restart the API
echo "🔄 Restarting API..."
npm start

echo "✅ API should now work with local MongoDB on VPS"
`;

fs.writeFileSync('quick-fix-vps.sh', quickFix);
console.log('✅ Created quick-fix-vps.sh');

console.log('\n🎯 SOLUTION FOR YOUR VPS:');
console.log('');
console.log('The issue is that your API is trying to connect to:');
console.log('❌ mongodb://127.0.0.1:27018 (wrong port and not configured)');
console.log('');
console.log('Instead, it should connect to:');
console.log('✅ mongodb://localhost:27017 (local MongoDB on VPS)');
console.log('');
console.log('📋 Steps to fix:');
console.log('1. On your VPS, install MongoDB:');
console.log('   sudo apt install mongodb');
console.log('');
console.log('2. Start MongoDB:');
console.log('   sudo systemctl start mongodb');
console.log('');
console.log('3. Set environment variable:');
console.log('   export MONGODB_URI="mongodb://localhost:27017/admin"');
console.log('');
console.log('4. Restart your API');
console.log('');
console.log('OR use the quick fix:');
console.log('   chmod +x quick-fix-vps.sh');
console.log('   ./quick-fix-vps.sh');
