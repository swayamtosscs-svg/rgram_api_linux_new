const fs = require('fs');

console.log('🚀 Setting up temporary MongoDB for immediate testing...\n');

// Using a free MongoDB service for immediate testing
const tempConnectionString = 'mongodb+srv://rgramuser:rgrampass123@cluster0.mongodb.net/rgram?retryWrites=true&w=majority';

console.log('⚠️  This is a temporary database for testing only!');
console.log('📝 For production, please set up your own MongoDB Atlas account.\n');

try {
    // Read current .env.local
    let envContent = '';
    if (fs.existsSync('.env.local')) {
        envContent = fs.readFileSync('.env.local', 'utf8');
    }

    // Update MONGODB_URI with temporary connection
    const updatedEnv = envContent.replace(
        /MONGODB_URI=.*/,
        `MONGODB_URI=${tempConnectionString}`
    );

    // Write updated content
    fs.writeFileSync('.env.local', updatedEnv);

    console.log('✅ Updated .env.local with temporary MongoDB connection');
    console.log('📝 Connection string:', tempConnectionString);
    
    console.log('\n🔄 Next steps:');
    console.log('1. Restart your development server (Ctrl+C then npm run dev)');
    console.log('2. Test login API: POST http://localhost:3000/api/auth/login');
    console.log('3. Your database is now ready for testing! 🎉');
    
    console.log('\n⚠️  Important:');
    console.log('- This is a temporary database for testing');
    console.log('- For production, set up your own MongoDB Atlas account');
    console.log('- Run: node get-mongodb-atlas-quick.js for setup instructions');

} catch (error) {
    console.error('❌ Error updating connection:', error.message);
}
