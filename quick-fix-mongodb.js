#!/usr/bin/env node

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

// Quick fix for local MongoDB
async function quickFixMongoDB() {
  log('🚀 Quick MongoDB Fix', 'bright');
  log('===================', 'bright');
  
  try {
    // Step 1: Create .env.local with local MongoDB
    logInfo('Step 1: Creating .env.local with local MongoDB...');
    
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
    
    await fs.writeFile('.env.local', envContent);
    logSuccess('Created .env.local with local MongoDB configuration');
    
    // Step 2: Create data directory
    logInfo('Step 2: Creating data directory...');
    await fs.mkdir('data/db', { recursive: true });
    logSuccess('Created data directory: data/db');
    
    // Step 3: Create public/assets directory
    logInfo('Step 3: Creating public/assets directory...');
    await fs.mkdir('public/assets', { recursive: true });
    logSuccess('Created public/assets directory');
    
    // Step 4: Test MongoDB connection
    logInfo('Step 4: Testing MongoDB connection...');
    
    const mongoose = require('mongoose');
    
    try {
      await mongoose.connect('mongodb://localhost:27017/api_rgram', {
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
      
      // Test database operations
      const db = mongoose.connection.db;
      const collections = await db.listCollections().toArray();
      logInfo(`Available collections: ${collections.map(c => c.name).join(', ')}`);
      
      await mongoose.disconnect();
      logSuccess('Disconnected from MongoDB');
      
    } catch (error) {
      logWarning(`MongoDB connection failed: ${error.message}`);
      
      if (error.message.includes('ECONNREFUSED')) {
        logInfo('MongoDB is not running. Please start it:');
        logInfo('  Windows: net start MongoDB');
        logInfo('  macOS: brew services start mongodb/brew/mongodb-community');
        logInfo('  Linux: sudo systemctl start mongodb');
        logInfo('  Or run: mongod --dbpath ./data/db');
      }
    }
    
    // Step 5: Create startup script
    logInfo('Step 5: Creating startup script...');
    
    const startupScript = `#!/bin/bash
# MongoDB Startup Script

echo "🚀 Starting MongoDB..."

# Check if MongoDB is already running
if pgrep -x "mongod" > /dev/null; then
    echo "✅ MongoDB is already running"
else
    echo "📡 Starting MongoDB..."
    mongod --dbpath ./data/db --logpath ./data/mongodb.log --fork
    echo "✅ MongoDB started"
fi

echo "🔍 Testing connection..."
mongosh --eval "db.runCommand('ping')" api_rgram

echo "🎉 MongoDB is ready!"
`;
    
    await fs.writeFile('start-mongodb.sh', startupScript);
    await fs.chmod('start-mongodb.sh', '755');
    logSuccess('Created startup script: start-mongodb.sh');
    
    // Step 6: Create Windows batch file
    const windowsScript = `@echo off
echo 🚀 Starting MongoDB...

net start MongoDB >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ MongoDB service started
) else (
    echo 📡 Starting MongoDB manually...
    mongod --dbpath ./data/db --logpath ./data/mongodb.log --fork
)

echo 🔍 Testing connection...
mongosh --eval "db.runCommand('ping')" api_rgram

echo 🎉 MongoDB is ready!
pause
`;
    
    await fs.writeFile('start-mongodb.bat', windowsScript);
    logSuccess('Created Windows startup script: start-mongodb.bat');
    
    // Step 7: Summary
    logSuccess('Quick fix completed!');
    logInfo('Next steps:');
    logInfo('1. Start MongoDB: ./start-mongodb.sh (Linux/Mac) or start-mongodb.bat (Windows)');
    logInfo('2. Test connection: npm run test:local-mongodb');
    logInfo('3. Run migration: npm run migrate:quick');
    
  } catch (error) {
    logError(`Quick fix failed: ${error.message}`);
  }
}

// Check if MongoDB is running
async function checkMongoDBStatus() {
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
async function startMongoDB() {
  return new Promise((resolve) => {
    logInfo('Starting MongoDB...');
    
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
    
    setTimeout(() => {
      mongod.kill();
      resolve(false);
    }, 10000);
  });
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--check')) {
    logInfo('Checking MongoDB status...');
    const isRunning = await checkMongoDBStatus();
    if (isRunning) {
      logSuccess('MongoDB is running');
    } else {
      logWarning('MongoDB is not running');
    }
  } else if (args.includes('--start')) {
    logInfo('Starting MongoDB...');
    const started = await startMongoDB();
    if (started) {
      logSuccess('MongoDB started successfully');
    } else {
      logError('Failed to start MongoDB');
    }
  } else {
    await quickFixMongoDB();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  quickFixMongoDB,
  checkMongoDBStatus,
  startMongoDB
};
