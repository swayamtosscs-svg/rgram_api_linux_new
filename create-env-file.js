const fs = require('fs');
const path = require('path');

console.log('📝 Creating .env.local file...\n');

const envContent = `# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/rgram

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
APP_NAME=RGram

# Security Settings
PASSWORD_RESET_TOKEN_EXPIRY=900000

# Development vs Production
NODE_ENV=development`;

const envPath = path.join(__dirname, '.env.local');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env.local file created successfully!');
  console.log('\n⚠️  IMPORTANT: You need to edit this file and replace the placeholder values:');
  console.log('1. Replace "your-email@gmail.com" with your actual Gmail address');
  console.log('2. Replace "your-app-password" with your Gmail app password');
  console.log('3. Update MONGODB_URI if you\'re not using local MongoDB');
  console.log('\n📧 To get a Gmail app password:');
  console.log('1. Enable 2-factor authentication on your Gmail account');
  console.log('2. Go to Google Account Settings → Security → 2-Step Verification → App passwords');
  console.log('3. Generate a password for "Mail"');
  console.log('\n🚀 After editing, restart your development server: npm run dev');
} catch (error) {
  console.log('❌ Error creating .env.local file:', error.message);
  console.log('\n📝 Please create the file manually with this content:');
  console.log('\n' + envContent);
}
