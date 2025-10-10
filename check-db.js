const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Database Setup...\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  console.log('✅ .env.local file found');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check MongoDB URI
  if (envContent.includes('MONGODB_URI=')) {
    const mongoLine = envContent.split('\n').find(line => line.startsWith('MONGODB_URI='));
    const mongoUri = mongoLine.split('=')[1];
    
    if (mongoUri && mongoUri.trim() !== '') {
      console.log('✅ MONGODB_URI is set');
      
      // Check if it's a valid MongoDB URI format
      if (mongoUri.includes('mongodb://') || mongoUri.includes('mongodb+srv://')) {
        console.log('✅ MongoDB URI format looks valid');
      } else {
        console.log('⚠️  MongoDB URI format may be invalid');
      }
    } else {
      console.log('❌ MONGODB_URI is empty');
    }
  } else {
    console.log('❌ MONGODB_URI not found in .env.local');
  }
  
  // Check other required variables
  const requiredVars = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ];
  
  console.log('\n🔑 Other required variables:');
  requiredVars.forEach(varName => {
    if (envContent.includes(varName + '=')) {
      const line = envContent.split('\n').find(l => l.startsWith(varName + '='));
      const value = line.split('=')[1];
      if (value && value.trim() !== '') {
        console.log(`  ✅ ${varName} - Set`);
      } else {
        console.log(`  ❌ ${varName} - Empty`);
      }
    } else {
      console.log(`  ❌ ${varName} - Missing`);
    }
  });
  
} else {
  console.log('❌ .env.local file not found');
  console.log('Please create .env.local with required environment variables');
}

// Check if MongoDB is running locally
console.log('\n🌐 Checking MongoDB connection...');
console.log('If you have MongoDB running locally, you can test with:');
console.log('mongodb://localhost:27017/your_database_name');

console.log('\n🚀 Next steps:');
console.log('1. Ensure MongoDB is running (local or Atlas)');
console.log('2. Check your .env.local file has correct MONGODB_URI');
console.log('3. Test database connection: GET /api/dp/test-db');
console.log('4. Check server console for connection logs');
console.log('5. If using MongoDB Atlas, ensure IP whitelist includes your IP');
