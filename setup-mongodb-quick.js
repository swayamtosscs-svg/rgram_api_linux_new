const { MongoClient } = require('mongodb');

async function setupMongoDBQuick() {
  console.log('🚀 Quick MongoDB Setup for R-GRAM API');
  console.log('=====================================');
  
  // Try different connection strings
  const connectionStrings = [
    'mongodb://localhost:27017/rgram_test',
    'mongodb://127.0.0.1:27017/rgram_test',
    'mongodb://localhost:27017',
    'mongodb://127.0.0.1:27017'
  ];
  
  let workingConnection = null;
  
  for (const uri of connectionStrings) {
    console.log(`\n🔍 Trying connection: ${uri}`);
    const client = new MongoClient(uri);
    
    try {
      await client.connect();
      console.log('✅ Connection successful!');
      
      // Test the connection
      await client.db('admin').command({ ping: 1 });
      console.log('✅ Database ping successful!');
      
      workingConnection = uri;
      await client.close();
      break;
    } catch (error) {
      console.log(`❌ Connection failed: ${error.message}`);
      await client.close();
    }
  }
  
  if (workingConnection) {
    console.log('\n🎉 MongoDB is working!');
    console.log(`📝 Use this connection string: ${workingConnection}`);
    console.log('\n📋 Next steps:');
    console.log('1. Create a .env.local file in your project root');
    console.log(`2. Add this line: MONGODB_URI=${workingConnection}`);
    console.log('3. Restart your Next.js development server');
    
    // Create a sample .env.local content
    const envContent = `# R-GRAM API Environment Variables
MONGODB_URI=${workingConnection}

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
APP_NAME=R-GRAM
NODE_ENV=development

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_gmail@gmail.com

# Cloudinary Configuration (Optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here

# OTP Configuration
OTP_EXPIRE_MINUTES=10
`;
    
    console.log('\n📄 Sample .env.local content:');
    console.log('================================');
    console.log(envContent);
    
  } else {
    console.log('\n❌ MongoDB is not running or not installed');
    console.log('\n🔧 To fix this:');
    console.log('1. Install MongoDB Community Edition:');
    console.log('   https://www.mongodb.com/try/download/community');
    console.log('2. Start MongoDB service:');
    console.log('   Windows: net start MongoDB');
    console.log('   macOS: brew services start mongodb-community');
    console.log('   Linux: sudo systemctl start mongod');
    console.log('3. Run this script again');
  }
}

setupMongoDBQuick().catch(console.error);

