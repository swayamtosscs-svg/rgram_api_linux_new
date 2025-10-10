#!/usr/bin/env node

/**
 * Comprehensive Gmail Authentication Diagnostic
 * Helps identify the exact issue with Gmail authentication
 */

const nodemailer = require('nodemailer');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function comprehensiveDiagnostic() {
  console.log('🔍 Comprehensive Gmail Authentication Diagnostic');
  console.log('===============================================\n');

  console.log('📋 Current Configuration:');
  console.log(`EMAIL_USER: ${process.env.EMAIL_USER}`);
  console.log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? '*** (16 chars)' : 'MISSING'}`);
  console.log(`EMAIL_HOST: ${process.env.EMAIL_HOST}`);
  console.log(`EMAIL_PORT: ${process.env.EMAIL_PORT}`);
  console.log(`EMAIL_FROM: ${process.env.EMAIL_FROM}\n`);

  if (!process.env.EMAIL_PASS) {
    console.log('❌ EMAIL_PASS is missing!');
    return;
  }

  console.log('🧪 Testing Different Authentication Methods...\n');

  // Test 1: Standard Gmail SMTP (Port 587)
  console.log('1️⃣ Testing Gmail SMTP (Port 587, STARTTLS):');
  try {
    const transporter1 = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Use STARTTLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter1.verify();
    console.log('✅ Gmail SMTP (Port 587) authentication successful!');
  } catch (error) {
    console.log('❌ Gmail SMTP (Port 587) failed:', error.message);
  }

  // Test 2: Gmail SMTP (Port 465, SSL)
  console.log('\n2️⃣ Testing Gmail SMTP (Port 465, SSL):');
  try {
    const transporter2 = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // Use SSL
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter2.verify();
    console.log('✅ Gmail SMTP (Port 465) authentication successful!');
  } catch (error) {
    console.log('❌ Gmail SMTP (Port 465) failed:', error.message);
  }

  // Test 3: Different password formats
  console.log('\n3️⃣ Testing Password Formats:');
  const passwordFormats = [
    process.env.EMAIL_PASS, // Original
    process.env.EMAIL_PASS?.replace(/\s/g, ''), // No spaces
    process.env.EMAIL_PASS?.replace(/\s/g, '').toLowerCase(), // No spaces, lowercase
    process.env.EMAIL_PASS?.replace(/\s/g, '').toUpperCase(), // No spaces, uppercase
  ];

  for (let i = 0; i < passwordFormats.length; i++) {
    const password = passwordFormats[i];
    if (!password) continue;

    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: password,
        },
      });

      await transporter.verify();
      console.log(`✅ Password format ${i + 1} successful!`);
      console.log(`   Format: ${password.length} characters`);
      console.log(`   Value: ${password}`);
      break;
    } catch (error) {
      console.log(`❌ Password format ${i + 1} failed: ${error.message}`);
    }
  }

  // Test 4: Check if it's a Gmail account issue
  console.log('\n4️⃣ Checking Gmail Account Status:');
  console.log('📧 Email:', process.env.EMAIL_USER);
  console.log('🔍 Please verify:');
  console.log('   - Is this a Gmail account? (not Google Workspace)');
  console.log('   - Is 2-Factor Authentication enabled?');
  console.log('   - Are there any security restrictions on the account?');
  console.log('   - Is the account locked or suspended?');

  console.log('\n🔧 Troubleshooting Steps:');
  console.log('==========================');
  console.log('1. Verify 2-Factor Authentication is enabled');
  console.log('2. Check if "Less secure app access" is disabled (it should be)');
  console.log('3. Generate a NEW app password');
  console.log('4. Make sure you selected "Mail" when generating the app password');
  console.log('5. Try logging into Gmail in a browser to ensure account is active');
  console.log('6. Check if there are any security alerts on your Google account');

  console.log('\n📧 Generate New App Password:');
  console.log('=============================');
  console.log('1. Go to: https://myaccount.google.com/');
  console.log('2. Security → 2-Step Verification → App passwords');
  console.log('3. Delete ALL existing "Mail" app passwords');
  console.log('4. Generate a new one for "Mail"');
  console.log('5. Copy the new 16-character password');
  console.log('6. Update EMAIL_PASS in .env.local');

  console.log('\n🚨 Alternative Solutions:');
  console.log('=========================');
  console.log('1. Try using a different Gmail account');
  console.log('2. Use OAuth2 instead of App Password');
  console.log('3. Use a different email service (Outlook, Yahoo, etc.)');
  console.log('4. Check if your organization has email restrictions');

  console.log('\n🧪 Test Commands:');
  console.log('==================');
  console.log('1. Test Gmail auth: node test-gmail-simple.js');
  console.log('2. Test forgot password: node test-forgot-password-complete.js');
  console.log('3. Test API directly:');
  console.log('   curl -X POST "http://localhost:3000/api/auth/forgot-password" \\');
  console.log('     -H "Content-Type: application/json" \\');
  console.log('     -d \'{"email":"swayam121july@gmail.com"}\'');
}

// Run the diagnostic
comprehensiveDiagnostic().catch(console.error);
