const fs = require('fs');

console.log('🌐 Setting up MongoDB Atlas (Cloud Database)...\n');

console.log('📋 Steps to get MongoDB Atlas connection string:');
console.log('1. Go to: https://cloud.mongodb.com/');
console.log('2. Sign up/Login to your account');
console.log('3. Create a new cluster (free tier available)');
console.log('4. Go to Database > Connect > Connect your application');
console.log('5. Copy the connection string\n');

const atlasConnectionString = 'mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority';

const envContent = `# MongoDB Atlas Configuration
# Replace the connection string below with your actual Atlas connection string
MONGODB_URI=${atlasConnectionString}

# Example Atlas connection string format:
# MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/rgram?retryWrites=true&w=majority

# Your current local MongoDB configuration (commented out):
# MONGODB_URI=mongodb://swayamUser:swayamPass@localhost:27017/swayam?authSource=admin
`;

try {
    // Read current .env.local
    let currentEnv = '';
    if (fs.existsSync('.env.local')) {
        currentEnv = fs.readFileSync('.env.local', 'utf8');
    }

    // Replace MongoDB URI
    const updatedEnv = currentEnv.replace(
        /MONGODB_URI=.*/,
        `MONGODB_URI=${atlasConnectionString}`
    );

    // If MONGODB_URI not found, add it
    if (!currentEnv.includes('MONGODB_URI=')) {
        const newEnv = currentEnv + '\n' + envContent;
        fs.writeFileSync('.env.local', newEnv);
    } else {
        fs.writeFileSync('.env.local', updatedEnv);
    }

    console.log('✅ Updated .env.local with MongoDB Atlas configuration');
    console.log('\n🔧 Next steps:');
    console.log('1. Replace the connection string in .env.local with your actual Atlas string');
    console.log('2. Restart your development server');
    console.log('3. Test the login API again\n');

    console.log('📝 Current .env.local MongoDB configuration:');
    console.log('MONGODB_URI=' + atlasConnectionString);

} catch (error) {
    console.error('❌ Error updating .env.local:', error.message);
    console.log('\n📝 Manual setup:');
    console.log('1. Open .env.local file');
    console.log('2. Replace MONGODB_URI with your Atlas connection string');
    console.log('3. Save and restart server');
}
