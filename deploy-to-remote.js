const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function deployToRemote() {
  console.log('🚀 Starting deployment to remote server...\n');
  
  try {
    // 1. Build the application
    console.log('📦 Building application...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build completed\n');
    
    // 2. Create production environment file
    console.log('⚙️ Creating production environment...');
    const prodEnv = `# Production Environment Variables
MONGODB_URI=mongodb://swayamUser:swayamPass@localhost:27017/swayam?authSource=admin
JWT_SECRET=9vQNPH6kL1jZ2JVsla8czb0WiEngqT7tUuGoYpxwSKyeXhC3A4mMfRBrIDdO5F

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=swayam.toss.cs@gmail.com
SMTP_PASS=yawq uwvk pode lmpc

# Application Configuration
NEXT_PUBLIC_APP_URL=http://103.14.120.163:8081
APP_NAME=RGram

# Security Settings
PASSWORD_RESET_TOKEN_EXPIRY=900000

# Production Environment
NODE_ENV=production

# Email Configuration for Forgot Password API
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=swayam.toss.cs@gmail.com
EMAIL_PASS=yawq uwvk pode lmpc
EMAIL_FROM=swayam.toss.cs@gmail.com
`;
    
    fs.writeFileSync('.env.production', prodEnv);
    console.log('✅ Production environment file created\n');
    
    // 3. Create deployment package
    console.log('📁 Creating deployment package...');
    const deploymentFiles = [
      '.next',
      'public',
      'package.json',
      'package-lock.json',
      '.env.production',
      'next.config.js',
      'next.config.mjs',
      'server.js',
      'ecosystem.config.js'
    ];
    
    console.log('📋 Files to deploy:', deploymentFiles.join(', '));
    console.log('✅ Deployment package ready\n');
    
    // 4. Create server startup script
    const serverScript = `#!/bin/bash
# Server startup script for 103.14.120.163:8081

echo "🚀 Starting RGram API Server..."

# Set environment
export NODE_ENV=production
export PORT=8081

# Install dependencies
npm install

# Start the server
npm start

echo "✅ Server started on port 8081"
`;
    
    fs.writeFileSync('start-server.sh', serverScript);
    console.log('✅ Server startup script created\n');
    
    // 5. Create PM2 ecosystem config
    const pm2Config = `module.exports = {
  apps: [{
    name: 'rgram-api',
    script: 'server.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 8081
    }
  }]
};
`;
    
    fs.writeFileSync('ecosystem.config.js', pm2Config);
    console.log('✅ PM2 configuration created\n');
    
    console.log('📋 Deployment Instructions:');
    console.log('1. Copy these files to your server (103.14.120.163):');
    console.log('   - .next/ (build folder)');
    console.log('   - public/');
    console.log('   - package.json');
    console.log('   - package-lock.json');
    console.log('   - .env.production');
    console.log('   - next.config.js');
    console.log('   - server.js');
    console.log('   - ecosystem.config.js');
    console.log('   - start-server.sh');
    console.log('');
    console.log('2. On your server, run:');
    console.log('   chmod +x start-server.sh');
    console.log('   ./start-server.sh');
    console.log('');
    console.log('3. Or use PM2:');
    console.log('   npm install -g pm2');
    console.log('   pm2 start ecosystem.config.js --env production');
    console.log('');
    console.log('4. Check if server is running:');
    console.log('   curl http://103.14.120.163:8081/api/debug-env');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
  }
}

deployToRemote();
