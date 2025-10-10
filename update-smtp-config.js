const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('📧 Setting up Gmail SMTP Configuration...\n');

console.log('🔐 Before we start, make sure you have:');
console.log('1. ✅ Enabled 2-factor authentication on your Gmail account');
console.log('2. ✅ Generated an App Password for "Mail"');
console.log('3. ✅ Copied the 16-character app password\n');

console.log('📋 To get Gmail App Password:');
console.log('1. Go to: https://myaccount.google.com/');
console.log('2. Security → 2-Step Verification → App passwords');
console.log('3. Select "Mail" and generate password\n');

const envPath = path.join(__dirname, '.env.local');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found!');
  console.log('Run: node create-env-file.js first');
  rl.close();
  return;
}

// Read current .env.local content
const currentContent = fs.readFileSync(envPath, 'utf8');

console.log('📄 Current .env.local content:');
console.log(currentContent);

console.log('\n⚠️  You need to manually edit the .env.local file and replace:');
console.log('SMTP_USER=your-email@gmail.com');
console.log('SMTP_PASS=your-app-password');
console.log('\nWith your actual Gmail and app password values.\n');

console.log('📝 Example of what to change:');
console.log('BEFORE: SMTP_USER=your-email@gmail.com');
console.log('AFTER:  SMTP_USER=john.doe@gmail.com');
console.log('');
console.log('BEFORE: SMTP_PASS=your-app-password');
console.log('AFTER:  SMTP_PASS=abcd efgh ijkl mnop\n');

console.log('🚀 After updating .env.local:');
console.log('1. Save the file');
console.log('2. Restart your development server: npm run dev');
console.log('3. Test the API again\n');

console.log('🧪 Test with:');
console.log('node test-forgot-password.js');

rl.close();
