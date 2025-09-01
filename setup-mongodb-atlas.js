const fs = require('fs');
const path = require('path');

console.log('☁️  Setting up MongoDB Atlas (Cloud Database)...\n');

console.log('📋 Steps to get MongoDB Atlas connection string:\n');

console.log('1️⃣  Go to MongoDB Atlas: https://cloud.mongodb.com/');
console.log('2️⃣  Sign up for a free account');
console.log('3️⃣  Create a new cluster (free tier)');
console.log('4️⃣  Create a database user with password');
console.log('5️⃣  Get your connection string');
console.log('6️⃣  Replace the MONGODB_URI in .env.local\n');

console.log('🔗 Your connection string will look like this:');
console.log('mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/rgram?retryWrites=true&w=majority\n');

console.log('📝 Update your .env.local file with the new MONGODB_URI\n');

// Check if .env.local exists and show current content
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  console.log('📄 Current .env.local content:');
  const currentContent = fs.readFileSync(envPath, 'utf8');
  console.log(currentContent);
  
  console.log('\n⚠️  Replace the MONGODB_URI line with your Atlas connection string');
} else {
  console.log('❌ .env.local file not found. Run: node create-env-file.js');
}

console.log('\n🚀 After updating, test the connection with:');
console.log('node test-db-connection.js');
