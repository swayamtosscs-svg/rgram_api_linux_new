#!/usr/bin/env node

/**
 * Gmail Authentication Fix Script
 * This script helps fix the Gmail authentication issue for the forgot password API
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Gmail Authentication Fix for Forgot Password API');
console.log('====================================================\n');

const envPath = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found!');
  console.log('📝 Creating .env.local file...\n');
  
  const envContent = `# R-GRAM API Environment Variables
# Database Configuration
MONGODB_URI=mongodb+srv://tossitswayam:Qwert123%23%24@cluster0.tpk0nle.mongodb.net/api_rgram?retryWrites=true&w=majority

# Email Configuration (Gmail) - IMPORTANT: Use App Password, not regular password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=swayam121july@gmail.com
EMAIL_PASS=YOUR_GMAIL_APP_PASSWORD_HERE
EMAIL_FROM=swayam121july@gmail.com

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
APP_NAME=R-GRAM
NODE_ENV=development

# JWT Configuration
JWT_SECRET=rgram_jwt_secret_key_2024_secure_random_string_12345

# OTP Configuration
OTP_EXPIRE_MINUTES=10

# Password Reset Configuration
PASSWORD_RESET_TOKEN_EXPIRY=900000`;

  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env.local file created successfully!\n');
  } catch (error) {
    console.log('❌ Error creating .env.local file:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ .env.local file exists');
}

console.log('🚨 CRITICAL ISSUE IDENTIFIED:');
console.log('==============================');
console.log('The error "Invalid login: 535-5.7.8 Username and Password not accepted"');
console.log('indicates that you are using your regular Gmail password instead of an App Password.\n');

console.log('📧 Gmail App Password Setup (REQUIRED):');
console.log('======================================');
console.log('1. Go to: https://myaccount.google.com/');
console.log('2. Click on "Security" in the left sidebar');
console.log('3. Under "Signing in to Google", click "2-Step Verification"');
console.log('4. If not enabled, enable 2-Step Verification first');
console.log('5. After enabling 2-Step Verification, go back to Security');
console.log('6. Under "Signing in to Google", click "App passwords"');
console.log('7. Select "Mail" as the app');
console.log('8. Click "Generate"');
console.log('9. Copy the 16-character password (e.g., "abcd efgh ijkl mnop")');
console.log('10. Use this password as EMAIL_PASS in your .env.local file\n');

console.log('🔧 Quick Fix Steps:');
console.log('===================');
console.log('1. Generate Gmail App Password (see steps above)');
console.log('2. Open .env.local file');
console.log('3. Replace EMAIL_PASS=YOUR_GMAIL_APP_PASSWORD_HERE');
console.log('   with EMAIL_PASS=your_16_character_app_password');
console.log('4. Save the file');
console.log('5. Restart your server\n');

console.log('🧪 Test Commands:');
console.log('=================');
console.log('1. Test email configuration:');
console.log('   node check-email-config.js');
console.log('');
console.log('2. Test forgot password API:');
console.log('   curl -X POST "http://localhost:3000/api/auth/forgot-password" \\');
console.log('     -H "Content-Type: application/json" \\');
console.log('     -d \'{"email":"swayam121july@gmail.com"}\'');
console.log('');

console.log('⚠️  IMPORTANT NOTES:');
console.log('====================');
console.log('- NEVER use your regular Gmail password for SMTP');
console.log('- Always use App Passwords for Gmail SMTP');
console.log('- App Passwords are 16 characters long');
console.log('- They look like: "abcd efgh ijkl mnop"');
console.log('- Remove spaces when using in EMAIL_PASS\n');

console.log('✅ After fixing EMAIL_PASS, your forgot password API will work correctly!');
