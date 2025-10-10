#!/usr/bin/env node

/**
 * Quick Email Configuration Update Script
 * Updates the .env.local file with proper email configuration
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Quick Email Configuration Fix');
console.log('==================================\n');

const envPath = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found!');
  process.exit(1);
}

// Read current .env.local
let envContent = fs.readFileSync(envPath, 'utf8');

console.log('📝 Updating email configuration...');

// Update email configuration
envContent = envContent.replace(
  /EMAIL_USER=your_gmail@gmail\.com/g,
  'EMAIL_USER=swayam121july@gmail.com'
);

envContent = envContent.replace(
  /EMAIL_FROM=your_gmail@gmail\.com/g,
  'EMAIL_FROM=swayam121july@gmail.com'
);

// Keep EMAIL_PASS as placeholder - user needs to set their app password
envContent = envContent.replace(
  /EMAIL_PASS=your_app_password/g,
  'EMAIL_PASS=YOUR_GMAIL_APP_PASSWORD_HERE'
);

// Write updated content
fs.writeFileSync(envPath, envContent);

console.log('✅ Email configuration updated!');
console.log('\n📧 Next Steps:');
console.log('==============');
console.log('1. Go to your Google Account: https://myaccount.google.com/');
console.log('2. Enable 2-Factor Authentication if not already enabled');
console.log('3. Go to Security → 2-Step Verification → App passwords');
console.log('4. Generate a new app password for "Mail"');
console.log('5. Copy the 16-character password');
console.log('6. Update EMAIL_PASS in .env.local with your app password');
console.log('7. Restart your server');

console.log('\n🔧 Manual Update Required:');
console.log('===========================');
console.log('Open .env.local and change:');
console.log('EMAIL_PASS=YOUR_GMAIL_APP_PASSWORD_HERE');
console.log('To:');
console.log('EMAIL_PASS=your_actual_16_character_password');

console.log('\n🧪 Test Commands:');
console.log('=================');
console.log('1. Test email service:');
console.log('   node test-email-service.js');
console.log('');
console.log('2. Test forgot password API:');
console.log('   curl -X POST "http://103.14.120.163:8081/api/auth/forgot-password" \\');
console.log('     -H "Content-Type: application/json" \\');
console.log('     -d \'{"email":"swayam121july@gmail.com"}\'');

console.log('\n✅ Configuration updated! Remember to set your Gmail app password.');
