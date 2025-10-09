const fs = require('fs');

// Get connection string from command line argument
const connectionString = process.argv[2];

if (!connectionString) {
    console.log('❌ Please provide MongoDB connection string');
    console.log('Usage: node update-mongodb-connection.js "mongodb+srv://username:password@cluster.mongodb.net/database"');
    process.exit(1);
}

console.log('🔧 Updating MongoDB connection...\n');

try {
    // Read current .env.local
    let envContent = '';
    if (fs.existsSync('.env.local')) {
        envContent = fs.readFileSync('.env.local', 'utf8');
    }

    // Update MONGODB_URI
    const updatedEnv = envContent.replace(
        /MONGODB_URI=.*/,
        `MONGODB_URI=${connectionString}`
    );

    // Write updated content
    fs.writeFileSync('.env.local', updatedEnv);

    console.log('✅ Updated .env.local with MongoDB Atlas connection');
    console.log('📝 Connection string:', connectionString);
    
    console.log('\n🔄 Next steps:');
    console.log('1. Restart your development server (Ctrl+C then npm run dev)');
    console.log('2. Test login API: POST http://localhost:3000/api/auth/login');
    console.log('3. Your database is now ready! 🎉');

} catch (error) {
    console.error('❌ Error updating connection:', error.message);
}
