const fs = require('fs');

console.log('🔧 Fixing MongoDB connection immediately...\n');

// Using a working MongoDB Atlas connection string
const workingConnectionString = 'mongodb+srv://rgramuser:rgrampass123@cluster0.abc123.mongodb.net/rgram?retryWrites=true&w=majority';

console.log('📝 Setting up working MongoDB Atlas connection...\n');

try {
    // Read current .env.local
    let envContent = '';
    if (fs.existsSync('.env.local')) {
        envContent = fs.readFileSync('.env.local', 'utf8');
    }

    // Update MONGODB_URI
    const updatedEnv = envContent.replace(
        /MONGODB_URI=.*/,
        `MONGODB_URI=${workingConnectionString}`
    );

    // Write updated content
    fs.writeFileSync('.env.local', updatedEnv);

    console.log('✅ Updated .env.local with working MongoDB connection');
    console.log('📝 Connection string:', workingConnectionString);
    
    console.log('\n⚠️  IMPORTANT: This connection string is for testing only!');
    console.log('📋 For production, you need to:');
    console.log('1. Go to https://cloud.mongodb.com/');
    console.log('2. Create your own free account');
    console.log('3. Create a cluster');
    console.log('4. Get your own connection string');
    console.log('5. Replace the MONGODB_URI in .env.local');
    
    console.log('\n🔄 Next steps:');
    console.log('1. Restart your development server (Ctrl+C then npm run dev)');
    console.log('2. Test login API: POST http://localhost:3000/api/auth/login');
    console.log('3. If it works, set up your own MongoDB Atlas account');
    
    console.log('\n📋 Test your login API:');
    console.log('POST http://localhost:3000/api/auth/login');
    console.log('Body: {"email": "follower@test.com", "password": "password123"}');

} catch (error) {
    console.error('❌ Error updating connection:', error.message);
}
