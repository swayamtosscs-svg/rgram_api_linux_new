const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️ ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️ ${message}`, 'blue');
}

// Test different MongoDB connection strings
async function testMongoDBConnections() {
  const connections = [
    'mongodb://localhost:27017/api_rgram',
    'mongodb://localhost:27017/apigram', 
    'mongodb://localhost:27017/test',
    'mongodb://localhost:27017/',
    'mongodb://127.0.0.1:27017/api_rgram',
    'mongodb://127.0.0.1:27017/apigram'
  ];
  
  log('🔍 Testing MongoDB Connection Strings', 'bright');
  log('=====================================', 'bright');
  
  for (const uri of connections) {
    logInfo(`Testing: ${uri}`);
    
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 5000,
        socketTimeoutMS: 10000,
        bufferCommands: false,
        maxPoolSize: 1,
      });
      
      logSuccess('✅ Connection successful!');
      
      // Test database operations
      const db = mongoose.connection.db;
      const dbName = db.databaseName;
      logInfo(`📋 Database name: ${dbName}`);
      
      // List collections
      const collections = await db.listCollections().toArray();
      logInfo(`📋 Collections: ${collections.map(c => c.name).join(', ')}`);
      
      // Test creating a document
      const testCollection = db.collection('connection_test');
      await testCollection.insertOne({ 
        test: true, 
        timestamp: new Date(),
        uri: uri
      });
      
      const testDoc = await testCollection.findOne({ test: true });
      logSuccess(`✅ Test document created: ${testDoc._id}`);
      
      // Clean up
      await testCollection.deleteOne({ test: true });
      logSuccess('✅ Test document cleaned up');
      
      await mongoose.disconnect();
      logSuccess('✅ Disconnected');
      
      // Return the working URI
      return uri;
      
    } catch (error) {
      logError(`❌ Connection failed: ${error.message}`);
      await mongoose.disconnect().catch(() => {});
    }
    
    log(''); // Empty line for readability
  }
  
  return null;
}

// Create database if it doesn't exist
async function createDatabase(dbName) {
  const uri = `mongodb://localhost:27017/${dbName}`;
  
  try {
    logInfo(`Creating database: ${dbName}`);
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      maxPoolSize: 1,
    });
    
    const db = mongoose.connection.db;
    
    // Create a test collection to ensure database exists
    const testCollection = db.collection('test_collection');
    await testCollection.insertOne({ 
      created: new Date(),
      purpose: 'Database creation test'
    });
    
    logSuccess(`✅ Database '${dbName}' created successfully`);
    
    // List all collections
    const collections = await db.listCollections().toArray();
    logInfo(`📋 Collections in '${dbName}': ${collections.map(c => c.name).join(', ')}`);
    
    await mongoose.disconnect();
    return true;
    
  } catch (error) {
    logError(`❌ Failed to create database '${dbName}': ${error.message}`);
    await mongoose.disconnect().catch(() => {});
    return false;
  }
}

// Update .env.local with working MongoDB URI
async function updateEnvFile(workingUri) {
  try {
    logInfo('Updating .env.local with working MongoDB URI...');
    
    const envContent = `# Local MongoDB Configuration
MONGODB_URI=${workingUri}

# Atlas MongoDB (for migration source)
ATLAS_MONGODB_URI=mongodb+srv://tossitswayam:Qwert123%23%24@cluster0.tpk0nle.mongodb.net/api_rgram?retryWrites=true&w=majority

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Next.js Configuration
NEXTAUTH_SECRET=your_random_secret_key_here
NEXTAUTH_URL=http://localhost:3000

# Development Configuration
NODE_ENV=development
PORT=3000
`;
    
    await fs.writeFile('.env.local', envContent);
    logSuccess(`✅ Updated .env.local with: ${workingUri}`);
    
  } catch (error) {
    logError(`❌ Failed to update .env.local: ${error.message}`);
  }
}

// Test current application connection
async function testApplicationConnection() {
  try {
    logInfo('Testing application connection...');
    
    // Load environment variables
    require('dotenv').config({ path: '.env.local' });
    
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      logError('❌ MONGODB_URI not found in .env.local');
      return false;
    }
    
    logInfo(`Using URI: ${MONGODB_URI}`);
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      maxPoolSize: 1,
    });
    
    logSuccess('✅ Application connection successful!');
    
    const db = mongoose.connection.db;
    const dbName = db.databaseName;
    logInfo(`📋 Connected to database: ${dbName}`);
    
    // Test with your existing models
    const collections = await db.listCollections().toArray();
    logInfo(`📋 Available collections: ${collections.map(c => c.name).join(', ')}`);
    
    await mongoose.disconnect();
    return true;
    
  } catch (error) {
    logError(`❌ Application connection failed: ${error.message}`);
    await mongoose.disconnect().catch(() => {});
    return false;
  }
}

// Main fix function
async function fixMongoDBDatabase() {
  log('🔧 Fixing MongoDB Database Connection', 'bright');
  log('======================================', 'bright');
  
  try {
    // Step 1: Test different connection strings
    logInfo('Step 1: Testing different MongoDB connection strings...');
    const workingUri = await testMongoDBConnections();
    
    if (!workingUri) {
      logError('❌ No working MongoDB connection found');
      logInfo('Please ensure MongoDB is running:');
      logInfo('  Windows: net start MongoDB');
      logInfo('  macOS: brew services start mongodb/brew/mongodb-community');
      logInfo('  Linux: sudo systemctl start mongodb');
      logInfo('  Or run: mongod --dbpath ./data/db');
      return;
    }
    
    logSuccess(`✅ Found working connection: ${workingUri}`);
    
    // Step 2: Create database if needed
    const dbName = workingUri.split('/').pop();
    if (dbName && dbName !== '') {
      logInfo(`Step 2: Ensuring database '${dbName}' exists...`);
      await createDatabase(dbName);
    }
    
    // Step 3: Update .env.local
    logInfo('Step 3: Updating .env.local...');
    await updateEnvFile(workingUri);
    
    // Step 4: Test application connection
    logInfo('Step 4: Testing application connection...');
    const appConnectionOk = await testApplicationConnection();
    
    if (appConnectionOk) {
      logSuccess('🎉 MongoDB database connection fixed successfully!');
      logInfo('Your application should now work with local MongoDB');
    } else {
      logWarning('⚠️ Application connection test failed');
      logInfo('Please check your application code');
    }
    
  } catch (error) {
    logError(`❌ Fix process failed: ${error.message}`);
  }
}

// Quick test function
async function quickTest() {
  log('🚀 Quick MongoDB Test', 'bright');
  log('=====================', 'bright');
  
  const testUris = [
    'mongodb://localhost:27017/api_rgram',
    'mongodb://localhost:27017/apigram',
    'mongodb://localhost:27017/test'
  ];
  
  for (const uri of testUris) {
    logInfo(`Testing: ${uri}`);
    
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 2000,
        connectTimeoutMS: 5000,
        socketTimeoutMS: 10000,
      });
      
      const db = mongoose.connection.db;
      logSuccess(`✅ Connected to database: ${db.databaseName}`);
      
      const collections = await db.listCollections().toArray();
      logInfo(`📋 Collections: ${collections.map(c => c.name).join(', ')}`);
      
      await mongoose.disconnect();
      logSuccess('✅ Disconnected');
      
    } catch (error) {
      logError(`❌ Failed: ${error.message}`);
      await mongoose.disconnect().catch(() => {});
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--test')) {
    await quickTest();
  } else {
    await fixMongoDBDatabase();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  fixMongoDBDatabase,
  testMongoDBConnections,
  createDatabase,
  testApplicationConnection
};
