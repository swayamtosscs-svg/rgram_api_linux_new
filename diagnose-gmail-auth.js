#!/usr/bin/env node

/**
 * Gmail App Password Diagnostic Script
 * Helps troubleshoot Gmail authentication issues
 */

const nodemailer = require('nodemailer');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function diagnoseGmailAuth() {
  console.log('🔍 Gmail App Password Diagnostic');
  console.log('=================================\n');

  // Check current configuration
  console.log('📋 Current Configuration:');
  console.log(`EMAIL_HOST: ${process.env.EMAIL_HOST}`);
  console.log(`EMAIL_PORT: ${process.env.EMAIL_PORT}`);
  console.log(`EMAIL_USER: ${process.env.EMAIL_USER}`);
  console.log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? '***' : 'MISSING'}`);
  console.log(`EMAIL_FROM: ${process.env.EMAIL_FROM}\n`);

  // Test different authentication methods
  console.log('🧪 Testing Different Authentication Methods...\n');

  // Method 1: Standard SMTP with App Password
  console.log('1️⃣ Testing Standard SMTP with App Password:');
  try {
    const transporter1 = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: false, // Use STARTTLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter1.verify();
    console.log('✅ Standard SMTP authentication successful!');
  } catch (error) {
    console.log('❌ Standard SMTP failed:', error.message);
  }

  // Method 2: OAuth2 (if credentials available)
  console.log('\n2️⃣ Testing OAuth2 (if available):');
  try {
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      const transporter2 = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.EMAIL_USER,
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        },
      });

      await transporter2.verify();
      console.log('✅ OAuth2 authentication successful!');
    } else {
      console.log('⚠️  OAuth2 credentials not available');
    }
  } catch (error) {
    console.log('❌ OAuth2 failed:', error.message);
  }

  // Method 3: Different port (465 with SSL)
  console.log('\n3️⃣ Testing Port 465 with SSL:');
  try {
    const transporter3 = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: 465,
      secure: true, // Use SSL
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter3.verify();
    console.log('✅ Port 465 SSL authentication successful!');
  } catch (error) {
    console.log('❌ Port 465 SSL failed:', error.message);
  }

  // Method 4: Test with different password formats
  console.log('\n4️⃣ Testing Password Formats:');
  
  const passwordFormats = [
    process.env.EMAIL_PASS, // Original
    process.env.EMAIL_PASS?.replace(/\s/g, ''), // No spaces
    process.env.EMAIL_PASS?.replace(/\s/g, '').toLowerCase(), // No spaces, lowercase
  ];

  for (let i = 0; i < passwordFormats.length; i++) {
    const password = passwordFormats[i];
    if (!password) continue;

    try {
      const transporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT),
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: password,
        },
      });

      await transporter.verify();
      console.log(`✅ Password format ${i + 1} successful!`);
      console.log(`   Format: ${password.length} characters`);
      break;
    } catch (error) {
      console.log(`❌ Password format ${i + 1} failed: ${error.message}`);
    }
  }

  console.log('\n🔧 Troubleshooting Steps:');
  console.log('==========================');
  console.log('1. Verify 2-Factor Authentication is enabled on your Gmail account');
  console.log('2. Generate a NEW app password (old ones might be invalid)');
  console.log('3. Make sure you selected "Mail" when generating the app password');
  console.log('4. Try generating the app password again');
  console.log('5. Check if your Gmail account has any security restrictions');
  console.log('6. Verify the app password is exactly 16 characters');
  console.log('7. Try using the app password without spaces');

  console.log('\n📧 Generate New App Password:');
  console.log('=============================');
  console.log('1. Go to: https://myaccount.google.com/');
  console.log('2. Security → 2-Step Verification → App passwords');
  console.log('3. Delete any existing "Mail" app passwords');
  console.log('4. Generate a new one for "Mail"');
  console.log('5. Copy the new 16-character password');
  console.log('6. Update EMAIL_PASS in .env.local');

  console.log('\n🧪 Test Commands:');
  console.log('==================');
  console.log('1. Test email config: node check-email-config.js');
  console.log('2. Test forgot password: node test-forgot-password-fix.js');
  console.log('3. Test API directly:');
  console.log('   curl -X POST "http://localhost:3000/api/auth/forgot-password" \\');
  console.log('     -H "Content-Type: application/json" \\');
  console.log('     -d \'{"email":"swayam121july@gmail.com"}\'');
}

// Run the diagnostic
diagnoseGmailAuth().catch(console.error);
