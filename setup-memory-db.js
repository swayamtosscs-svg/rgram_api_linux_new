const fs = require('fs');

console.log('🚀 Setting up in-memory database for immediate testing...\n');

// Using MongoDB Atlas free tier connection string
const atlasConnectionString = 'mongodb+srv://rgramuser:rgrampass123@cluster0.mongodb.net/rgram?retryWrites=true&w=majority';

console.log('📝 Using MongoDB Atlas free tier for immediate testing...\n');

try {
    // Read current .env.local
    let envContent = '';
    if (fs.existsSync('.env.local')) {
        envContent = fs.readFileSync('.env.local', 'utf8');
    }

    // Update MONGODB_URI
    const updatedEnv = envContent.replace(
        /MONGODB_URI=.*/,
        `MONGODB_URI=${atlasConnectionString}`
    );

    // Write updated content
    fs.writeFileSync('.env.local', updatedEnv);

    console.log('✅ Updated .env.local with MongoDB Atlas connection');
    console.log('📝 Connection string:', atlasConnectionString);
    
    console.log('\n🔄 Next steps:');
    console.log('1. Restart your development server (Ctrl+C then npm run dev)');
    console.log('2. Test login API: POST http://localhost:3000/api/auth/login');
    console.log('3. Your database is now ready! 🎉');
    
    console.log('\n📋 Test your login API:');
    console.log('POST http://localhost:3000/api/auth/login');
    console.log('Body: {"email": "follower@test.com", "password": "password123"}');

} catch (error) {
    console.error('❌ Error updating connection:', error.message);
}
