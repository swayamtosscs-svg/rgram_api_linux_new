const mongoose = require('mongoose');

// VPS MongoDB Connection Test and Setup
async function fixVPSMongoDB() {
  console.log('🔧 Fixing VPS MongoDB Connection...\n');
  
  // Test VPS MongoDB connection
  const vpsUri = 'mongodb://Toss:Toss%40123@103.14.120.163:27017/admin';
  
  try {
    console.log('🔄 Testing VPS MongoDB connection...');
    console.log('📍 URI:', vpsUri.replace(/\/\/.*@/, '//***:***@'));
    
    await mongoose.connect(vpsUri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log('✅ VPS MongoDB connection successful!');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    console.log('🔗 Connection State:', mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected');
    
    // Test database operations
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Available Collections:', collections.map(c => c.name));
    
    await mongoose.connection.close();
    console.log('🔒 Connection closed\n');
    
    console.log('✅ VPS MongoDB is working correctly!');
    console.log('\n📋 Next Steps for VPS Deployment:');
    console.log('1. Set NODE_ENV=production on your VPS');
    console.log('2. Restart your API server on VPS');
    console.log('3. Test the signup endpoint again');
    
  } catch (error) {
    console.error('❌ VPS MongoDB connection failed:');
    console.error('Error:', error.message);
    
    console.log('\n💡 Possible solutions:');
    console.log('1. Check if MongoDB is running on 103.14.120.163:27017');
    console.log('2. Verify username: Toss');
    console.log('3. Verify password: Toss@123');
    console.log('4. Ensure MongoDB allows connections from external IPs');
    console.log('5. Check firewall settings on VPS');
    console.log('6. Verify MongoDB is bound to 0.0.0.0 not just 127.0.0.1');
  }
}

fixVPSMongoDB();
