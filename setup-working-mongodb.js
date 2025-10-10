const fs = require('fs');

console.log('🔧 Setting up working MongoDB connection...\n');

// Let's use a different approach - create a local MongoDB setup
const localConnectionString = 'mongodb://localhost:27017/rgram';

console.log('📝 Setting up local MongoDB connection...\n');

try {
    // Read current .env.local
    let envContent = '';
    if (fs.existsSync('.env.local')) {
        envContent = fs.readFileSync('.env.local', 'utf8');
    }

    // Update MONGODB_URI
    const updatedEnv = envContent.replace(
        /MONGODB_URI=.*/,
        `MONGODB_URI=${localConnectionString}`
    );

    // Write updated content
    fs.writeFileSync('.env.local', updatedEnv);

    console.log('✅ Updated .env.local with local MongoDB connection');
    console.log('📝 Connection string:', localConnectionString);
    
    console.log('\n🚀 Starting MongoDB locally...');
    console.log('This will start MongoDB in the background...\n');

    // Try to start MongoDB using the existing script
    const { spawn } = require('child_process');
    
    // Start MongoDB in background
    const mongod = spawn('mongod', ['--dbpath', './data/db'], {
        detached: true,
        stdio: 'ignore'
    });
    
    mongod.unref();
    
    console.log('✅ MongoDB started in background');
    console.log('📁 Data directory: ./data/db');
    
    console.log('\n🔄 Next steps:');
    console.log('1. Wait 5 seconds for MongoDB to start');
    console.log('2. Test login API: POST http://localhost:3000/api/auth/login');
    console.log('3. Your database is now ready! 🎉');
    
    console.log('\n📋 Test your login API:');
    console.log('POST http://localhost:3000/api/auth/login');
    console.log('Body: {"email": "follower@test.com", "password": "password123"}');

} catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n🔧 Alternative: Please install MongoDB manually:');
    console.log('1. Download from: https://www.mongodb.com/try/download/community');
    console.log('2. Install MongoDB Community Server');
    console.log('3. Start MongoDB service');
    console.log('4. Run this script again');
}
