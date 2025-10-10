#!/usr/bin/env node

/**
 * Complete Gmail App Password Fix
 * This script provides step-by-step instructions to fix the Gmail authentication issue
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 Complete Gmail App Password Fix');
console.log('===================================\n');

console.log('🚨 CURRENT ISSUE:');
console.log('==================');
console.log('Your forgot password API is failing with "Email service error"');
console.log('because the Gmail App Password is invalid or expired.\n');

console.log('📧 STEP-BY-STEP SOLUTION:');
console.log('===========================');
console.log('1. Go to: https://myaccount.google.com/');
console.log('2. Click "Security" in the left sidebar');
console.log('3. Under "Signing in to Google", click "2-Step Verification"');
console.log('4. Make sure 2-Step Verification is ENABLED');
console.log('5. Go back to Security page');
console.log('6. Under "Signing in to Google", click "App passwords"');
console.log('7. Delete ALL existing "Mail" app passwords');
console.log('8. Click "Select app" → Choose "Mail"');
console.log('9. Click "Generate"');
console.log('10. Copy the NEW 16-character password\n');

console.log('⚠️  IMPORTANT NOTES:');
console.log('====================');
console.log('- App passwords are case-sensitive');
console.log('- They must be exactly 16 characters');
console.log('- Remove spaces when using in EMAIL_PASS');
console.log('- Each app password can only be used once');
console.log('- If you generate a new one, the old one becomes invalid\n');

rl.question('Do you want to update the password now? (y/n): ', (answer) => {
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    console.log('\n📝 Please enter your NEW Gmail App Password:');
    console.log('(16 characters, e.g., "abcd efgh ijkl mnop")');
    
    rl.question('New App Password: ', (newPassword) => {
      if (!newPassword || newPassword.length < 16) {
        console.log('❌ Invalid password. Must be 16 characters long.');
        rl.close();
        return;
      }

      try {
        // Update .env.local file
        const envPath = path.join(process.cwd(), '.env.local');
        let envContent = fs.readFileSync(envPath, 'utf8');
        
        // Remove spaces from password
        const cleanPassword = newPassword.replace(/\s/g, '');
        
        // Update EMAIL_PASS
        envContent = envContent.replace(
          /EMAIL_PASS=.*/g,
          `EMAIL_PASS=${cleanPassword}`
        );
        
        // Write updated content
        fs.writeFileSync(envPath, envContent);
        
        console.log('✅ EMAIL_PASS updated successfully!');
        console.log(`📧 Password: ${cleanPassword.length} characters`);
        
        console.log('\n🧪 Testing the new configuration...');
        
        // Test the configuration
        require('dotenv').config({ path: '.env.local' });
        
        if (process.env.EMAIL_PASS === cleanPassword) {
          console.log('✅ Configuration verified!');
          console.log('\n🚀 Next steps:');
          console.log('1. Test Gmail authentication: node test-gmail-simple.js');
          console.log('2. Test forgot password API:');
          console.log('   curl -X POST "http://localhost:3000/api/auth/forgot-password" \\');
          console.log('     -H "Content-Type: application/json" \\');
          console.log('     -d \'{"email":"swayam121july@gmail.com"}\'');
          console.log('3. Or test with Postman using the same request');
        } else {
          console.log('❌ Configuration update failed');
        }
        
      } catch (error) {
        console.log('❌ Error updating configuration:', error.message);
      }
      
      rl.close();
    });
  } else {
    console.log('\n📋 Manual Update Instructions:');
    console.log('==============================');
    console.log('1. Generate new Gmail App Password (see steps above)');
    console.log('2. Open .env.local file');
    console.log('3. Replace EMAIL_PASS=current_password');
    console.log('   with EMAIL_PASS=your_new_16_character_password');
    console.log('4. Save the file');
    console.log('5. Test with: node test-gmail-simple.js');
    console.log('6. Test API with your Postman request');
    
    rl.close();
  }
});

rl.on('close', () => {
  console.log('\n🎉 Fix Complete!');
  console.log('================');
  console.log('After updating the Gmail App Password, your forgot password API should work correctly.');
  console.log('The API will be able to send password reset emails successfully.');
});
