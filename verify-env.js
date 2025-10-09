// Load environment variables
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Environment Variables Verification:');
console.log('=====================================');
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID || '❌ NOT SET');
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '✅ SET (length: ' + process.env.RAZORPAY_KEY_SECRET.length + ')' : '❌ NOT SET');
console.log('NEXT_PUBLIC_RAZORPAY_KEY_ID:', process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '❌ NOT SET');
console.log('NEXT_PUBLIC_RAZORPAY_KEY_SECRET:', process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET ? '✅ SET (length: ' + process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET.length + ')' : '❌ NOT SET');

console.log('\n📋 Next Steps:');
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    console.log('✅ Environment variables are properly set!');
    console.log('🔄 Now restart your server with: npm run dev');
} else {
    console.log('❌ Environment variables are missing!');
    console.log('🔧 Check your .env.local file');
}
