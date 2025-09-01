console.log('🔍 Checking Google OAuth Environment Configuration...\n');

// Check required environment variables
const requiredVars = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET', 
    'GOOGLE_CALLBACK_URL',
    'JWT_SECRET',
    'MONGODB_URI'
];

console.log('📋 Required Environment Variables:');
requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        // Mask sensitive values
        const maskedValue = varName.includes('SECRET') || varName.includes('SECRET') 
            ? value.substring(0, 8) + '...' 
            : value;
        console.log(`   ✅ ${varName}: ${maskedValue}`);
    } else {
        console.log(`   ❌ ${varName}: NOT SET`);
    }
});

console.log('');

// Check optional variables
const optionalVars = [
    'NODE_ENV',
    'CORS_ORIGIN',
    'MOCK_GOOGLE_AUTH'
];

console.log('📋 Optional Environment Variables:');
optionalVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        console.log(`   ℹ️  ${varName}: ${value}`);
    } else {
        console.log(`   ⚠️  ${varName}: NOT SET (using defaults)`);
    }
});

console.log('');

// Check current configuration
console.log('🔧 Current Configuration:');
console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`   Mock Mode: ${process.env.MOCK_GOOGLE_AUTH === 'true' ? 'ENABLED' : 'DISABLED'}`);

if (process.env.MOCK_GOOGLE_AUTH === 'true') {
    console.log('   ⚠️  WARNING: Mock mode is enabled. Real Google OAuth will not work.');
    console.log('   💡 To enable real Google OAuth, set MOCK_GOOGLE_AUTH=false');
}

console.log('');

// Check if we can connect to the API
console.log('🌐 Testing API Connectivity...');
const API_BASE = 'https://api-rgram1.vercel.app';

async function testAPI() {
    try {
        const response = await fetch(`${API_BASE}/api/auth/google/init`);
        const data = await response.json();
        
        if (data.success) {
            console.log('   ✅ API is accessible');
            console.log(`   📍 Base URL: ${API_BASE}`);
            console.log(`   🔐 Mock Mode: ${data.data.isMock ? 'ENABLED' : 'DISABLED'}`);
        } else {
            console.log('   ❌ API returned error:', data.message);
        }
    } catch (error) {
        console.log('   ❌ Cannot connect to API:', error.message);
    }
}

// Run the test
testAPI().then(() => {
    console.log('\n🎯 Next Steps:');
    console.log('   1. Set up Google Cloud Console OAuth credentials');
    console.log('   2. Configure environment variables in Vercel dashboard');
    console.log('   3. Test with: https://api-rgram1.vercel.app/google-oauth-demo.html');
    console.log('   4. Run: node test-google-oauth.js');
});
