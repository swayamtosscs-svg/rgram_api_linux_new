require('dotenv').config({ path: '.env.local' });

console.log('🔍 Environment Variables Debug:');
console.log('=====================================');
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID || '❌ NOT SET');
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '✅ SET (length: ' + process.env.RAZORPAY_KEY_SECRET.length + ')' : '❌ NOT SET');
console.log('NEXT_PUBLIC_RAZORPAY_KEY_ID:', process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '❌ NOT SET');
console.log('NEXT_PUBLIC_RAZORPAY_KEY_SECRET:', process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET ? '✅ SET (length: ' + process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET.length + ')' : '❌ NOT SET');

console.log('\n🔍 All environment variables containing RAZORPAY:');
Object.keys(process.env).forEach(key => {
    if (key.includes('RAZORPAY')) {
        console.log(`${key}: ${process.env[key]}`);
    }
});
