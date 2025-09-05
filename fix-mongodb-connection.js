const mongoose = require('mongoose');
require('dotenv').config();

// Enhanced MongoDB connection with better error handling
async function connectToMongoDB() {
  console.log('🔧 Fixing MongoDB Connection for Ubuntu Server...');
  
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables');
    console.log('💡 Please create a .env file with:');
    console.log('MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority');
    return false;
  }
  
  // Parse the MongoDB URI to check for issues
  const uri = process.env.MONGODB_URI;
  console.log('🔗 MongoDB URI format:', uri.includes('mongodb+srv://') ? 'Atlas (SRV)' : 'Standard');
  
  // Enhanced connection options for Ubuntu server
  const connectionOptions = {
    bufferCommands: false,
    maxPoolSize: 5, // Reduced for better stability
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    family: 4, // Force IPv4
    retryWrites: true,
    w: 1,
    retryReads: true,
    maxIdleTimeMS: 10000,
    heartbeatFrequencyMS: 10000,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // Additional options for better connection stability
    keepAlive: true,
    keepAliveInitialDelay: 300000,
    maxIdleTimeMS: 10000,
    serverSelectionRetryDelayMS: 2000,
    bufferMaxEntries: 0
  };
  
  try {
    console.log('🔄 Attempting connection with enhanced options...');
    
    // Clear any existing connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    // Set up event listeners
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB Error:', err.message);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB Disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB Reconnected');
    });
    
    // Attempt connection
    await mongoose.connect(uri, connectionOptions);
    
    console.log('✅ Successfully connected to MongoDB!');
    console.log('📊 Connection state:', mongoose.connection.readyState);
    console.log('🏷️ Database name:', mongoose.connection.name);
    
    // Test the connection with a simple operation
    const admin = mongoose.connection.db.admin();
    const result = await admin.ping();
    console.log('🏓 Ping result:', result);
    
    return true;
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    // Provide specific solutions based on error type
    if (error.message.includes('IP')) {
      console.log('\n🔧 IP Whitelist Solution:');
      console.log('1. Go to MongoDB Atlas → Network Access');
      console.log('2. Add IP Address: 103.14.120.163/32');
      console.log('3. Or add 0.0.0.0/0 for all IPs (less secure)');
      console.log('4. Wait 2-3 minutes for changes to take effect');
    }
    
    if (error.message.includes('authentication')) {
      console.log('\n🔧 Authentication Solution:');
      console.log('1. Check username and password in MONGODB_URI');
      console.log('2. Ensure user has read/write permissions');
      console.log('3. Verify database name is correct');
    }
    
    if (error.message.includes('network') || error.message.includes('timeout')) {
      console.log('\n🔧 Network Solution:');
      console.log('1. Check server internet connection');
      console.log('2. Verify firewall settings allow MongoDB ports');
      console.log('3. Try connecting from a different network');
    }
    
    return false;
  }
}

// Test function
async function testConnection() {
  const connected = await connectToMongoDB();
  
  if (connected) {
    console.log('\n🎉 MongoDB connection is working!');
    console.log('✅ Your Images API should work now');
    
    // Test a simple query
    try {
      const User = mongoose.model('User', new mongoose.Schema({
        username: String,
        email: String
      }));
      
      const userCount = await User.countDocuments();
      console.log(`👥 Found ${userCount} users in database`);
      
    } catch (queryError) {
      console.log('⚠️ Query test failed:', queryError.message);
    }
    
  } else {
    console.log('\n❌ MongoDB connection failed');
    console.log('🔧 Please fix the issues above and try again');
  }
  
  // Close connection
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the test
testConnection().catch(console.error);
