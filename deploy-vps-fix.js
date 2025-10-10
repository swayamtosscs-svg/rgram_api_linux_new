const fs = require('fs');

console.log('🚀 Creating VPS Deployment Fix...\n');

// Create VPS environment file
const vpsEnvContent = `# VPS Environment Configuration
NODE_ENV=production
HOST_ENV=VPS

# MongoDB Connection for VPS (Port 27017, not 8081)
MONGODB_URI=mongodb://Toss:Toss%40123@103.14.120.163:27017/admin

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

fs.writeFileSync('.env.production', vpsEnvContent);
console.log('✅ Created .env.production for VPS');

// Create VPS startup script
const startupScript = `#!/bin/bash
# VPS Startup Script

echo "🚀 Starting RGram API on VPS..."

# Set environment
export NODE_ENV=production
export HOST_ENV=VPS
export PORT=8081

# Load environment variables
source .env.production

# Install dependencies
npm install --production

# Start the server
npm start

echo "✅ Server started on port 8081"
`;

fs.writeFileSync('start-vps.sh', startupScript);
console.log('✅ Created start-vps.sh script');

console.log('\n📋 VPS Deployment Instructions:');
console.log('1. Upload these files to your VPS:');
console.log('   - .env.production');
console.log('   - All your project files');
console.log('');
console.log('2. On your VPS, run:');
console.log('   chmod +x start-vps.sh');
console.log('   ./start-vps.sh');
console.log('');
console.log('3. Or manually set environment:');
console.log('   export NODE_ENV=production');
console.log('   export HOST_ENV=VPS');
console.log('   npm start');
console.log('');
console.log('4. Test the API:');
console.log('   curl http://103.14.120.163:8081/api/debug-env');
console.log('');
console.log('⚠️  IMPORTANT: MongoDB should be on port 27017, not 8081!');
console.log('   API runs on port 8081');
console.log('   MongoDB runs on port 27017');
