const mongoose = require('mongoose');

async function fixMongoDBConnection() {
  console.log('🔧 Fixing MongoDB Atlas connection...');
  console.log('🌐 Server IP: 103.14.120.163');
  
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://tossitswayam:Qwert123%23%24@cluster0.tpk0nle.mongodb.net/api_rgram?retryWrites=true&w=majority';
  
  // Enhanced connection options for server environment
  const connectionOptions = {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 20000,
    socketTimeoutMS: 45000,
    bufferCommands: false,
    maxPoolSize: 10,
    retryWrites: true,
    w: 1,
    retryReads: true,
    family: 4, // Force IPv4
    // Additional options for server stability
    maxIdleTimeMS: 30000,
    heartbeatFrequencyMS: 10000,
    // Connection pool options
    minPoolSize: 1,
    maxConnecting: 2,
  };
  
  try {
    console.log('📡 Attempting to connect to MongoDB Atlas...');
    
    await mongoose.connect(MONGODB_URI, connectionOptions);
    
    console.log('✅ Successfully connected to MongoDB Atlas!');
    
    // Test database operations
    const admin = mongoose.connection.db.admin();
    const pingResult = await admin.ping();
    console.log('✅ Database ping successful:', pingResult);
    
    // Test UserAssets model
    const UserAssets = require('./models/UserAssets');
    const userAssetsCount = await UserAssets.countDocuments();
    console.log('✅ UserAssets model working, documents:', userAssetsCount);
    
    // Test User model
    const User = require('./lib/models/User');
    const userCount = await User.countDocuments();
    console.log('✅ User model working, users:', userCount);
    
    console.log('🎉 All database operations successful!');
    
    // Keep connection alive for testing
    console.log('⏳ Keeping connection alive for 30 seconds...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    await mongoose.disconnect();
    console.log('✅ Disconnected successfully');
    
    return true;
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('IP') || error.message.includes('whitelist')) {
      console.log('\n🚨 IP WHITELIST ISSUE DETECTED');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔧 IMMEDIATE FIX REQUIRED:');
      console.log('');
      console.log('1. Go to: https://cloud.mongodb.com/');
      console.log('2. Login to your MongoDB Atlas account');
      console.log('3. Select your project');
      console.log('4. Click "Network Access" in the left sidebar');
      console.log('5. Click "Add IP Address"');
      console.log('6. Add this IP: 103.14.120.163');
      console.log('7. Add comment: "Production Server"');
      console.log('8. Click "Confirm"');
      console.log('9. Wait 2-3 minutes for changes to take effect');
      console.log('');
      console.log('🔒 ALTERNATIVE (Less Secure):');
      console.log('Add 0.0.0.0/0 to allow all IPs temporarily');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
    
    if (error.message.includes('authentication')) {
      console.log('\n🔐 AUTHENTICATION ISSUE:');
      console.log('1. Check username: tossitswayam');
      console.log('2. Verify password is correct');
      console.log('3. Check database name: api_rgram');
      console.log('4. Ensure user has read/write permissions');
    }
    
    if (error.message.includes('timeout')) {
      console.log('\n⏱️ TIMEOUT ISSUE:');
      console.log('1. Check server internet connection');
      console.log('2. Verify MongoDB Atlas cluster is running');
      console.log('3. Check firewall settings on server');
    }
    
    return false;
  }
}

// Run the fix
fixMongoDBConnection().then(success => {
  if (success) {
    console.log('\n🎉 MongoDB connection fixed successfully!');
    console.log('✅ Your User Assets API should now work properly.');
  } else {
    console.log('\n❌ MongoDB connection fix failed.');
    console.log('Please follow the steps above to whitelist your IP address.');
  }
  process.exit(success ? 0 : 1);
});
