const mongoose = require('mongoose');
require('dotenv').config();

async function testMongoDBConnection() {
  console.log('🔍 Testing MongoDB connection...');
  
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable is not set');
    return false;
  }
  
  console.log('📋 MongoDB URI:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials
  
  try {
    // Test connection with minimal options
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      maxPoolSize: 1,
      retryWrites: true,
      w: 1,
      retryReads: true,
    });
    
    console.log('✅ MongoDB connection successful!');
    
    // Test a simple operation
    const admin = mongoose.connection.db.admin();
    const result = await admin.ping();
    console.log('✅ MongoDB ping successful:', result);
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    
    return true;
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    if (error.message.includes('IP')) {
      console.log('\n🔧 Fix suggestions:');
      console.log('1. Add your server IP to MongoDB Atlas whitelist');
      console.log('2. Or add 0.0.0.0/0 to allow all IPs (less secure)');
      console.log('3. Check your MongoDB Atlas network access settings');
    }
    
    if (error.message.includes('authentication')) {
      console.log('\n🔧 Fix suggestions:');
      console.log('1. Check your MongoDB username and password');
      console.log('2. Verify the database name in the connection string');
      console.log('3. Check if the user has proper permissions');
    }
    
    return false;
  }
}

// Run the test
testMongoDBConnection().then(success => {
  process.exit(success ? 0 : 1);
});