#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Server IP Configuration...\n');

// Files to update
const filesToUpdate = [
  'server-env.txt',
  'lib/utils/email.ts',
  '.env.local'
];

// Old and new IP addresses
const oldIP = '103.14.120.163';
const newIP = '103.14.120.160';

console.log(`📝 Updating IP from ${oldIP} to ${newIP}...\n`);

filesToUpdate.forEach(filePath => {
  try {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      
      // Replace the IP address
      content = content.replace(new RegExp(oldIP, 'g'), newIP);
      
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Updated: ${filePath}`);
      } else {
        console.log(`ℹ️  No changes needed: ${filePath}`);
      }
    } else {
      console.log(`⚠️  File not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
});

console.log('\n🎉 Server IP configuration updated!');
console.log('\n📋 Next steps:');
console.log('1. Restart your server');
console.log('2. Test the password reset functionality');
console.log('3. Check if emails are being sent correctly');
