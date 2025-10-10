#!/usr/bin/env node

/**
 * Quick .env.local Editor
 * Helps you update the EMAIL_PASS in .env.local
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Quick .env.local Editor');
console.log('===========================\n');

const envPath = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found!');
  process.exit(1);
}

// Read current content
let envContent = fs.readFileSync(envPath, 'utf8');

console.log('📋 Current EMAIL_PASS line:');
const emailPassLine = envContent.match(/EMAIL_PASS=.+/);
if (emailPassLine) {
  console.log(emailPassLine[0]);
} else {
  console.log('EMAIL_PASS line not found!');
}

console.log('\n🔧 To fix this:');
console.log('===============');
console.log('1. Get your Gmail app password from: https://myaccount.google.com/');
console.log('2. Run this command to open .env.local:');
console.log('   notepad .env.local');
console.log('');
console.log('3. Find this line:');
console.log('   EMAIL_PASS=YOUR_GMAIL_APP_PASSWORD_HERE');
console.log('');
console.log('4. Replace it with:');
console.log('   EMAIL_PASS=your_16_character_password');
console.log('');
console.log('5. Save the file and restart your server');

console.log('\n💡 Alternative - PowerShell command to open file:');
console.log('=================================================');
console.log('notepad .env.local');

console.log('\n🧪 After fixing, test with:');
console.log('============================');
console.log('node test-email-service.js');

console.log('\n✅ Once EMAIL_PASS is set correctly, your forgot password API will work!');
