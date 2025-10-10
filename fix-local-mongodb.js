const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');

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

// Check if MongoDB is installed
async function checkMongoDBInstallation() {
  return new Promise((resolve) => {
    const mongod = spawn('mongod', ['--version'], {
      stdio: 'pipe',
      shell: true
    });
    
    let output = '';
    let errorOutput = '';
    
    mongod.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    mongod.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    mongod.on('close', (code) => {
      if (code === 0 || output.includes('db version')) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    
    mongod.on('error', () => {
      resolve(false);
    });
    
    setTimeout(() => {
      mongod.kill();
      resolve(false);
    }, 5000);
  });
}

// Check if MongoDB service is running
async function checkMongoDBService() {
  return new Promise((resolve) => {
    const mongosh = spawn('mongosh', ['--eval', 'db.runCommand("ping")'], {
      stdio: 'pipe',
      shell: true
    });
    
    let output = '';
    let errorOutput = '';
    
    mongosh.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    mongosh.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    mongosh.on('close', (code) => {
      if (code === 0 || output.includes('ok')) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    
    mongosh.on('error', () => {
      resolve(false);
    });
    
    setTimeout(() => {
      mongosh.kill();
      resolve(false);
    }, 5000);
  });
}

// Start MongoDB service
async function startMongoDBService() {
  return new Promise((resolve) => {
    logInfo('Attempting to start MongoDB service...');
    
    const mongod = spawn('mongod', ['--dbpath', './data/db'], {
      stdio: 'pipe',
      shell: true,
      detached: true
    });
    
    let output = '';
    let errorOutput = '';
    
    mongod.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    mongod.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    mongod.on('close', (code) => {
      if (code === 0 || output.includes('waiting for connections')) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    
    mongod.on('error', () => {
      resolve(false);
    });
    
    // Wait for MongoDB to start
    setTimeout(() => {
      mongod.kill();
      resolve(false);
    }, 10000);
  });
}

// Create .env.local file with local MongoDB configuration
async function createLocalEnvFile() {
  try {
    const envPath = path.join(__dirname, '.env.local');
    
    const envContent = `# Local MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/api_rgram

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
    
    await fs.writeFile(envPath, envContent);
    logSuccess('Created .env.local file with local MongoDB configuration');
    return true;
  } catch (error) {
    logError(`Failed to create .env.local: ${error.message}`);
    return false;
  }
}

// Test MongoDB connection
async function testMongoDBConnection() {
  try {
    const MONGODB_URI = 'mongodb://localhost:27017/api_rgram';
    
    logInfo('Testing MongoDB connection...');
    
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
    
    logSuccess('MongoDB connection successful!');
    
    // Test a simple operation
    const admin = mongoose.connection.db.admin();
    const result = await admin.ping();
    logSuccess(`MongoDB ping successful: ${JSON.stringify(result)}`);
    
    await mongoose.disconnect();
    logSuccess('Disconnected from MongoDB');
    
    return true;
  } catch (error) {
    logError(`MongoDB connection failed: ${error.message}`);
    return false;
  }
}

// Create data directory
async function createDataDirectory() {
  try {
    const dataDir = path.join(__dirname, 'data', 'db');
    await fs.mkdir(dataDir, { recursive: true });
    logSuccess(`Created data directory: ${dataDir}`);
    return true;
  } catch (error) {
    logError(`Failed to create data directory: ${error.message}`);
    return false;
  }
}

// Install MongoDB locally using npm
async function installMongoDBLocally() {
  return new Promise((resolve) => {
    logInfo('Installing MongoDB locally...');
    
    const npm = spawn('npm', ['install', 'mongodb-memory-server'], {
      stdio: 'inherit',
      shell: true
    });
    
    npm.on('close', (code) => {
      if (code === 0) {
        logSuccess('MongoDB memory server installed');
        resolve(true);
      } else {
        logError('Failed to install MongoDB memory server');
        resolve(false);
      }
    });
    
    npm.on('error', () => {
      logError('Failed to install MongoDB memory server');
      resolve(false);
    });
  });
}

// Main fix function
async function fixLocalMongoDB() {
  log('🔧 Fixing Local MongoDB Setup', 'bright');
  log('==============================', 'bright');
  
  try {
    // Step 1: Check MongoDB installation
    logInfo('Step 1: Checking MongoDB installation...');
    const isInstalled = await checkMongoDBInstallation();
    
    if (!isInstalled) {
      logWarning('MongoDB is not installed locally');
      logInfo('Please install MongoDB:');
      logInfo('  Windows: Download from https://www.mongodb.com/try/download/community');
      logInfo('  macOS: brew install mongodb-community');
      logInfo('  Linux: sudo apt-get install mongodb');
      
      // Try to install MongoDB memory server as alternative
      logInfo('Installing MongoDB memory server as alternative...');
      await installMongoDBLocally();
    } else {
      logSuccess('MongoDB is installed');
    }
    
    // Step 2: Create data directory
    logInfo('Step 2: Creating data directory...');
    await createDataDirectory();
    
    // Step 3: Check MongoDB service
    logInfo('Step 3: Checking MongoDB service...');
    const isRunning = await checkMongoDBService();
    
    if (!isRunning) {
      logWarning('MongoDB service is not running');
      logInfo('Attempting to start MongoDB...');
      
      const started = await startMongoDBService();
      if (!started) {
        logError('Failed to start MongoDB service');
        logInfo('Please start MongoDB manually:');
        logInfo('  Windows: net start MongoDB');
        logInfo('  macOS: brew services start mongodb/brew/mongodb-community');
        logInfo('  Linux: sudo systemctl start mongodb');
        logInfo('  Or run: mongod --dbpath ./data/db');
      } else {
        logSuccess('MongoDB service started');
      }
    } else {
      logSuccess('MongoDB service is running');
    }
    
    // Step 4: Create .env.local file
    logInfo('Step 4: Creating .env.local file...');
    await createLocalEnvFile();
    
    // Step 5: Test connection
    logInfo('Step 5: Testing MongoDB connection...');
    const connectionOk = await testMongoDBConnection();
    
    if (connectionOk) {
      logSuccess('Local MongoDB setup completed successfully!');
      logInfo('You can now run your application with local MongoDB');
    } else {
      logError('MongoDB connection test failed');
      logInfo('Please check MongoDB installation and service status');
    }
    
  } catch (error) {
    logError(`Fix process failed: ${error.message}`);
  }
}

// Alternative: Use MongoDB memory server
async function setupMongoDBMemoryServer() {
  log('🧠 Setting up MongoDB Memory Server', 'bright');
  log('====================================', 'bright');
  
  try {
    // Install mongodb-memory-server
    await installMongoDBLocally();
    
    // Create memory server configuration
    const memoryServerConfig = `
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

async function startMemoryServer() {
  try {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Memory Server');
    
    return mongoUri;
  } catch (error) {
    console.error('❌ Failed to start MongoDB Memory Server:', error);
    throw error;
  }
}

async function stopMemoryServer() {
  if (mongoServer) {
    await mongoose.disconnect();
    await mongoServer.stop();
    console.log('✅ MongoDB Memory Server stopped');
  }
}

module.exports = { startMemoryServer, stopMemoryServer };
`;
    
    await fs.writeFile('mongodb-memory-server.js', memoryServerConfig);
    logSuccess('Created MongoDB Memory Server configuration');
    
    // Update .env.local for memory server
    const envContent = `# MongoDB Memory Server Configuration
MONGODB_URI=mongodb://127.0.0.1:27017/api_rgram

# Atlas MongoDB (for migration source)
ATLAS_MONGODB_URI=mongodb+srv://tossitswayam:Qwert123%23%24@cluster0.tpk0nle.mongodb.net/api_rgram?retryWrites=true&w=majority

# Other configurations...
NEXTAUTH_SECRET=your_random_secret_key_here
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
PORT=3000
`;
    
    await fs.writeFile('.env.local', envContent);
    logSuccess('Updated .env.local for memory server');
    
  } catch (error) {
    logError(`Memory server setup failed: ${error.message}`);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--memory') || args.includes('-m')) {
    await setupMongoDBMemoryServer();
  } else {
    await fixLocalMongoDB();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  fixLocalMongoDB,
  setupMongoDBMemoryServer,
  testMongoDBConnection,
  checkMongoDBService
};
