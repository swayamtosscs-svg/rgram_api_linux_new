#!/usr/bin/env node

/**
 * Quick Gmail App Password Update Script
 * Helps you quickly update the EMAIL_PASS in .env.local
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 Quick Gmail App Password Update');
console.log('===================================\n');

const envPath = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found!');
  console.log('💡 Run: node fix-gmail-auth.js first');
  process.exit(1);
}

console.log('📧 Gmail App Password Setup:');
console.log('============================');
console.log('1. Go to: https://myaccount.google.com/');
console.log('2. Security → 2-Step Verification → App passwords');
console.log('3. Generate app password for "Mail"');
console.log('4. Copy the 16-character password\n');

rl.question('Enter your Gmail App Password (16 characters): ', (appPassword) => {
  if (!appPassword || appPassword.length < 16) {
    console.log('❌ Invalid app password. Must be 16 characters long.');
    rl.close();
    return;
  }

  try {
    // Read current .env.local
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update EMAIL_PASS
    envContent = envContent.replace(
      /EMAIL_PASS=.*/g,
      `EMAIL_PASS=${appPassword}`
    );
    
    // Write updated content
    fs.writeFileSync(envPath, envContent);
    
    console.log('✅ EMAIL_PASS updated successfully!');
    console.log('\n🧪 Testing the configuration...');
    
    // Test the configuration
    require('dotenv').config({ path: '.env.local' });
    
    if (process.env.EMAIL_PASS === appPassword) {
      console.log('✅ Configuration verified!');
      console.log('\n🚀 Next steps:');
      console.log('1. Restart your server: npm run dev');
      console.log('2. Test the API: node test-forgot-password-fix.js');
      console.log('3. Or test with curl:');
      console.log('   curl -X POST "http://localhost:3000/api/auth/forgot-password" \\');
      console.log('     -H "Content-Type: application/json" \\');
      console.log('     -d \'{"email":"swayam121july@gmail.com"}\'');
    } else {
      console.log('❌ Configuration update failed');
    }
    
  } catch (error) {
    console.log('❌ Error updating configuration:', error.message);
  }
  
  rl.close();
});
