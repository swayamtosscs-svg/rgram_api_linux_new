const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing SMTP Configuration...\n');

const envPath = path.join(__dirname, '.env.local');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found!');
  return;
}

// Read current content
let content = fs.readFileSync(envPath, 'utf8');

// Check if SMTP variables already exist
if (content.includes('SMTP_USER=') && content.includes('SMTP_PASS=')) {
  console.log('✅ SMTP configuration already exists!');
  console.log('Current SMTP settings:');
  
  const smtpUserMatch = content.match(/SMTP_USER=(.+)/);
  const smtpPassMatch = content.match(/SMTP_PASS=(.+)/);
  
  if (smtpUserMatch) console.log(`SMTP_USER: ${smtpUserMatch[1]}`);
  if (smtpPassMatch) console.log(`SMTP_PASS: ${smtpPassMatch[1].substring(0, 4)}...`);
  
  return;
}

// Add missing SMTP configuration
const smtpConfig = `

# SMTP Configuration for Forgot Password API
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=swayam.toss.cs@gmail.com
SMTP_PASS=ozncdubcwsunrkbz
`;

// Add to the end of the file
content += smtpConfig;

// Write back to file
fs.writeFileSync(envPath, content);

console.log('✅ Added missing SMTP configuration to .env.local!');
console.log('\n📧 SMTP Settings Added:');
console.log('SMTP_HOST=smtp.gmail.com');
console.log('SMTP_PORT=587');
console.log('SMTP_USER=swayam.toss.cs@gmail.com');
console.log('SMTP_PASS=ozncdubcwsunrkbz');

console.log('\n🚀 Now restart your development server:');
console.log('npm run dev');

console.log('\n🧪 Then test the forgot password API:');
console.log('node test-forgot-password.js');
