const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

console.log('🔧 R-GRAM Email Configuration Fix');
console.log('=' .repeat(50));

// Check current configuration
console.log('\n📋 Current Configuration:');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM);

// Test email connection
async function testEmailConnection() {
  console.log('\n🧪 Testing Email Connection...');
  
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.verify();
    console.log('✅ Email connection successful!');
    return true;
  } catch (error) {
    console.log('❌ Email connection failed:', error.message);
    return false;
  }
}

// Fix configuration
async function fixEmailConfig() {
  console.log('\n🔧 Fixing Email Configuration...');
  
  // Try different configurations
  const configs = [
    {
      name: 'Gmail with Port 587 (TLS)',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false
    },
    {
      name: 'Gmail with Port 465 (SSL)',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true
    }
  ];

  for (const config of configs) {
    console.log(`\n🧪 Testing ${config.name}...`);
    
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    try {
      await transporter.verify();
      console.log(`✅ ${config.name} works!`);
      
      // Update .env.local with working config
      const envPath = path.join(process.cwd(), '.env.local');
      let envContent = fs.readFileSync(envPath, 'utf8');
      
      envContent = envContent.replace(/EMAIL_HOST=.*/, `EMAIL_HOST=${config.host}`);
      envContent = envContent.replace(/EMAIL_PORT=.*/, `EMAIL_PORT=${config.port}`);
      
      fs.writeFileSync(envPath, envContent);
      console.log('✅ Updated .env.local with working configuration');
      
      return true;
    } catch (error) {
      console.log(`❌ ${config.name} failed:`, error.message);
    }
  }
  
  return false;
}

// Main fix process
async function main() {
  // First, test current configuration
  const currentWorks = await testEmailConnection();
  
  if (currentWorks) {
    console.log('\n🎉 Email is already working!');
    return;
  }
  
  // Try to fix with different configurations
  const fixed = await fixEmailConfig();
  
  if (fixed) {
    console.log('\n🎉 Email configuration fixed!');
    console.log('\n📧 Now test the OTP API:');
    console.log('curl -X POST http://localhost:3000/api/auth/forgot-password-otp \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -d \'{"email": "swayam121july@gmail.com"}\'');
  } else {
    console.log('\n❌ Could not fix email configuration automatically.');
    console.log('\n🔧 Manual Fix Required:');
    console.log('1. Go to https://myaccount.google.com/');
    console.log('2. Security → 2-Step Verification (enable if not enabled)');
    console.log('3. App passwords → Generate password');
    console.log('4. Select "Mail" as the app');
    console.log('5. Copy the 16-character password');
    console.log('6. Update EMAIL_PASS in .env.local');
    console.log('\n📝 Example .env.local:');
    console.log('EMAIL_HOST=smtp.gmail.com');
    console.log('EMAIL_PORT=587');
    console.log('EMAIL_USER=swayam121july@gmail.com');
    console.log('EMAIL_PASS=your_16_character_app_password');
    console.log('EMAIL_FROM=swayam121july@gmail.com');
  }
}

main().catch(console.error);