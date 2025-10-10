#!/usr/bin/env node

/**
 * Complete Email Service Fix
 * This script will help you set up the email service completely
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 Complete Email Service Fix');
console.log('==============================\n');

const envPath = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found!');
  process.exit(1);
}

// Read current .env.local
let envContent = fs.readFileSync(envPath, 'utf8');

console.log('📋 Current Email Configuration:');
console.log('===============================');

// Extract current email config
const emailUser = envContent.match(/EMAIL_USER=(.+)/)?.[1] || 'NOT SET';
const emailPass = envContent.match(/EMAIL_PASS=(.+)/)?.[1] || 'NOT SET';
const emailFrom = envContent.match(/EMAIL_FROM=(.+)/)?.[1] || 'NOT SET';

console.log(`EMAIL_USER: ${emailUser}`);
console.log(`EMAIL_PASS: ${emailPass.includes('YOUR_') ? '❌ PLACEHOLDER' : '✅ SET'}`);
console.log(`EMAIL_FROM: ${emailFrom}`);

if (emailPass.includes('YOUR_') || emailPass === 'NOT SET') {
  console.log('\n🚨 ISSUE FOUND: EMAIL_PASS is not set!');
  console.log('\n📧 Gmail App Password Setup:');
  console.log('============================');
  console.log('1. Go to: https://myaccount.google.com/');
  console.log('2. Click "Security" in the left sidebar');
  console.log('3. Under "Signing in to Google", click "2-Step Verification"');
  console.log('4. Scroll down and click "App passwords"');
  console.log('5. Select "Mail" as the app');
  console.log('6. Copy the 16-character password (like: abcd efgh ijkl mnop)');
  console.log('7. Paste it below (spaces will be removed automatically)');
  
  console.log('\n💡 Alternative: You can also manually edit .env.local');
  console.log('   Change: EMAIL_PASS=YOUR_GMAIL_APP_PASSWORD_HERE');
  console.log('   To: EMAIL_PASS=your_16_character_password');
  
  console.log('\n🔧 Quick Fix Options:');
  console.log('=====================');
  console.log('1. Enter your Gmail app password below');
  console.log('2. Or press Enter to skip and fix manually');
  
  rl.question('\nEnter your Gmail app password (or press Enter to skip): ', (password) => {
    if (password.trim()) {
      // Remove spaces from password
      const cleanPassword = password.replace(/\s/g, '');
      
      // Update the .env.local file
      envContent = envContent.replace(
        /EMAIL_PASS=YOUR_GMAIL_APP_PASSWORD_HERE/g,
        `EMAIL_PASS=${cleanPassword}`
      );
      
      fs.writeFileSync(envPath, envContent);
      
      console.log('✅ Email password updated successfully!');
      console.log('\n🧪 Testing email service...');
      
      // Test the email service
      testEmailService();
    } else {
      console.log('\n⏭️  Skipped password update.');
      console.log('📝 To fix manually:');
      console.log('1. Open .env.local');
      console.log('2. Change EMAIL_PASS=YOUR_GMAIL_APP_PASSWORD_HERE');
      console.log('3. To EMAIL_PASS=your_actual_password');
      console.log('4. Restart your server');
      
      rl.close();
    }
  });
} else {
  console.log('\n✅ Email configuration looks good!');
  console.log('\n🧪 Testing email service...');
  testEmailService();
}

function testEmailService() {
  try {
    const nodemailer = require('nodemailer');
    require('dotenv').config({ path: '.env.local' });
    
    const transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    transporter.verify((error, success) => {
      if (error) {
        console.log('❌ Email service test failed:', error.message);
        
        if (error.message.includes('Invalid login')) {
          console.log('\n🔧 Fix: Invalid Gmail credentials');
          console.log('1. Make sure 2-Factor Authentication is enabled');
          console.log('2. Generate a new App Password for Gmail');
          console.log('3. Update EMAIL_PASS in .env.local');
        }
      } else {
        console.log('✅ Email service test successful!');
        console.log('\n🎉 Your forgot password API should work now!');
        console.log('\n🧪 Test the API:');
        console.log('curl -X POST "http://localhost:3000/api/auth/forgot-password" \\');
        console.log('  -H "Content-Type: application/json" \\');
        console.log('  -d \'{"email":"swayam121july@gmail.com"}\'');
      }
      
      rl.close();
    });
  } catch (error) {
    console.log('❌ Error testing email service:', error.message);
    console.log('\n🔧 Try installing nodemailer:');
    console.log('npm install nodemailer');
    rl.close();
  }
}
