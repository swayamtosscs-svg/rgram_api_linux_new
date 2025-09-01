const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up Forgot Password API...\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('✅ .env.local file already exists');
} else {
  console.log('❌ .env.local file not found');
  console.log('\n📝 Please create a .env.local file with the following content:\n');
  
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

  console.log(envContent);
  console.log('\n⚠️  IMPORTANT: Replace the placeholder values with your actual configuration!');
}

console.log('\n📋 Required Environment Variables:');
console.log('1. MONGODB_URI - Your MongoDB connection string');
console.log('2. SMTP_HOST - SMTP server host (e.g., smtp.gmail.com)');
console.log('3. SMTP_PORT - SMTP server port (e.g., 587)');
console.log('4. SMTP_USER - Your email address');
console.log('5. SMTP_PASS - Your email password or app password');

console.log('\n🔐 For Gmail setup:');
console.log('1. Enable 2-factor authentication');
console.log('2. Generate an App Password');
console.log('3. Use the App Password as SMTP_PASS');

console.log('\n🚀 After setting up .env.local, restart your development server:');
console.log('npm run dev');

console.log('\n🧪 Test the API with:');
console.log('POST http://localhost:3000/api/auth/forgot-password');
console.log('Body: { "email": "user@example.com" }');
