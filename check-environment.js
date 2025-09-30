#!/usr/bin/env node

console.log('🔍 Environment Detection for Password Reset URLs\n');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

console.log('📋 Current Environment Variables:');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
console.log(`NEXT_PUBLIC_APP_URL: ${process.env.NEXT_PUBLIC_APP_URL || 'undefined'}`);
console.log(`VERCEL: ${process.env.VERCEL || 'undefined'}`);
console.log(`VERCEL_URL: ${process.env.VERCEL_URL || 'undefined'}\n`);

// Determine URL logic
let baseUrl = process.env.NEXT_PUBLIC_APP_URL;

if (!baseUrl) {
  if (process.env.VERCEL || process.env.VERCEL_URL) {
    baseUrl = 'https://api-rgram1.vercel.app';
    console.log('🌐 Environment: Vercel Production');
  } else if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
    baseUrl = 'http://103.14.120.163:8081';
    console.log('🖥️  Environment: Server Production');
  } else {
    baseUrl = 'http://localhost:3000';
    console.log('💻 Environment: Local Development');
  }
}

// Additional checks
if (process.env.VERCEL_URL) {
  baseUrl = `https://${process.env.VERCEL_URL}`;
  console.log('🌐 Environment: Vercel (Dynamic URL)');
}

// Force localhost for development
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined) {
  baseUrl = 'http://localhost:3000';
  console.log('💻 Environment: Forced to Local Development');
}

console.log(`\n🔗 Password Reset URLs will use: ${baseUrl}`);
console.log(`📧 Example reset link: ${baseUrl}/reset-password?token=abc123&email=test@example.com\n`);

console.log('✅ Environment Detection Complete!');
console.log('\n📋 Summary:');
console.log('- Local Development: Uses localhost:3000');
console.log('- Server Production: Uses 103.14.120.163:8081');
console.log('- Vercel Production: Uses Vercel domain');
