console.log('🔍 Checking OAuth Callback Redirect URL...\n');

const corsOrigin = process.env.CORS_ORIGIN;
const fallbackUrl = 'https://api-rgram1.vercel.app';

console.log('📋 Environment Variables:');
console.log(`   CORS_ORIGIN: ${corsOrigin || 'NOT SET'}`);
console.log(`   Fallback URL: ${fallbackUrl}`);

console.log('\n🎯 Redirect URL will be:');
if (corsOrigin) {
    console.log(`   ✅ ${corsOrigin}/google-oauth-demo.html?token=JWT_TOKEN`);
} else {
    console.log(`   ⚠️  ${fallbackUrl}/google-oauth-demo.html?token=JWT_TOKEN (using fallback)`);
}

console.log('\n💡 To fix localhost redirect:');
console.log('   1. Set CORS_ORIGIN=https://api-rgram1.vercel.app in Vercel');
console.log('   2. Or the callback will use the fallback URL automatically');

console.log('\n🔗 Test URLs:');
console.log(`   - Demo Page: ${fallbackUrl}/google-oauth-demo.html`);
console.log(`   - OAuth Init: ${fallbackUrl}/api/auth/google/init`);
console.log(`   - OAuth Callback: ${fallbackUrl}/api/auth/google/callback`);
