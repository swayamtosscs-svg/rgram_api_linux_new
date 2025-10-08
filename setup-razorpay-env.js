const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up Razorpay Environment Configuration...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envLocalPath = path.join(__dirname, '.env.local');

const envContent = `# Razorpay Payment Configuration
# Get these from your Razorpay Dashboard: https://dashboard.razorpay.com/app/keys

# Public key used on the client (safe to expose)
RAZORPAY_KEY_ID=rzp_test_your_key_id_here

# Secret key used ONLY on the server for signature verification (NEVER expose this)
RAZORPAY_KEY_SECRET=your_secret_key_here

# Optional: webhook secret for verifying Razorpay webhooks (if you add webhooks)
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here

# For client-side usage (optional, can use server-side keys)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id_here
NEXT_PUBLIC_RAZORPAY_KEY_SECRET=your_secret_key_here
`;

try {
    // Try to create .env.local first (Next.js preferred)
    if (!fs.existsSync(envLocalPath)) {
        fs.writeFileSync(envLocalPath, envContent);
        console.log('✅ Created .env.local file with Razorpay configuration template');
    } else {
        console.log('⚠️  .env.local already exists, skipping creation');
    }

    // Also create .env as backup
    if (!fs.existsSync(envPath)) {
        fs.writeFileSync(envPath, envContent);
        console.log('✅ Created .env file with Razorpay configuration template');
    } else {
        console.log('⚠️  .env already exists, skipping creation');
    }

    console.log('\n📋 Next Steps:');
    console.log('1. Go to https://dashboard.razorpay.com/app/keys');
    console.log('2. Copy your Test/Live Key ID and Secret');
    console.log('3. Replace the placeholder values in .env.local:');
    console.log('   - RAZORPAY_KEY_ID=rzp_test_your_actual_key_id');
    console.log('   - RAZORPAY_KEY_SECRET=your_actual_secret_key');
    console.log('   - NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_actual_key_id');
    console.log('   - NEXT_PUBLIC_RAZORPAY_KEY_SECRET=your_actual_secret_key');
    console.log('\n4. Restart your development server');
    console.log('5. Test the payment API again\n');

    console.log('🔍 Current environment status:');
    console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? '✅ SET' : '❌ NOT SET');
    console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '✅ SET' : '❌ NOT SET');
    console.log('NEXT_PUBLIC_RAZORPAY_KEY_ID:', process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ? '✅ SET' : '❌ NOT SET');
    console.log('NEXT_PUBLIC_RAZORPAY_KEY_SECRET:', process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET ? '✅ SET' : '❌ NOT SET');

} catch (error) {
    console.error('❌ Error creating environment files:', error.message);
    console.log('\n📝 Manual Setup Instructions:');
    console.log('1. Create a file named .env.local in your project root');
    console.log('2. Add the following content:');
    console.log(envContent);
}
