const { MongoClient } = require('mongodb');

async function setupMongoDBUser() {
  const adminUri = 'mongodb://localhost:27017/admin';
  const client = new MongoClient(adminUri);
  
  try {
    console.log('🔄 Connecting to MongoDB admin database...');
    await client.connect();
    
    const adminDb = client.db('admin');
    
    // Check if user already exists
    const users = await adminDb.command({ usersInfo: "swayamUser" });
    
    if (users.users && users.users.length > 0) {
      console.log('👤 User swayamUser already exists');
      
      // Update user password
      await adminDb.command({
        updateUser: "swayamUser",
        pwd: "swayamPass",
        roles: [
          { role: "readWrite", db: "swayam" },
          { role: "dbAdmin", db: "swayam" }
        ]
      });
      console.log('✅ Updated swayamUser password and permissions');
    } else {
      // Create new user
      await adminDb.command({
        createUser: "swayamUser",
        pwd: "swayamPass",
        roles: [
          { role: "readWrite", db: "swayam" },
          { role: "dbAdmin", db: "swayam" }
        ]
      });
      console.log('✅ Created swayamUser with password swayamPass');
    }
    
    // Create the swayam database if it doesn't exist
    const swayamClient = new MongoClient('mongodb://swayamUser:swayamPass@localhost:27017/swayam?authSource=admin');
    await swayamClient.connect();
    const swayamDb = swayamClient.db('swayam');
    
    // Create a test collection to ensure database exists
    await swayamDb.createCollection('test');
    await swayamDb.collection('test').insertOne({ message: 'Database setup successful', timestamp: new Date() });
    console.log('✅ Created swayam database and test collection');
    
    await swayamClient.close();
    
  } catch (error) {
    console.error('❌ Error setting up MongoDB user:');
    console.error(error.message);
    
    if (error.message.includes('Authentication failed')) {
      console.log('\n💡 Trying to connect without authentication...');
      try {
        const noAuthClient = new MongoClient('mongodb://localhost:27017/admin');
        await noAuthClient.connect();
        console.log('✅ Connected without authentication - MongoDB has no auth enabled');
        
        // Create user without auth
        const adminDb = noAuthClient.db('admin');
        await adminDb.command({
          createUser: "swayamUser",
          pwd: "swayamPass",
          roles: [
            { role: "readWrite", db: "swayam" },
            { role: "dbAdmin", db: "swayam" }
          ]
        });
        console.log('✅ Created swayamUser successfully');
        
        await noAuthClient.close();
      } catch (noAuthError) {
        console.error('❌ Failed to connect even without authentication:', noAuthError.message);
      }
    }
  } finally {
    await client.close();
  }
}

setupMongoDBUser();
