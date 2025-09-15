#!/usr/bin/env node

const { spawn } = require('child_process');
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

function logStep(step, message) {
  log(`\n${step}. ${message}`, 'cyan');
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

// Check if MongoDB is running locally
async function checkMongoDB() {
  return new Promise((resolve) => {
    const { spawn } = require('child_process');
    
    // Try to connect to MongoDB
    const mongo = spawn('mongosh', ['--eval', 'db.runCommand("ping")'], {
      stdio: 'pipe',
      shell: true
    });
    
    let output = '';
    let errorOutput = '';
    
    mongo.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    mongo.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    mongo.on('close', (code) => {
      if (code === 0 || output.includes('ok')) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    
    mongo.on('error', () => {
      resolve(false);
    });
    
    // Timeout after 5 seconds
    setTimeout(() => {
      mongo.kill();
      resolve(false);
    }, 5000);
  });
}

// Check if required files exist
async function checkRequiredFiles() {
  const requiredFiles = [
    'setup-local-mongodb.js',
    'migrate-to-local-mongodb.js',
    'delete-media-and-data.js'
  ];
  
  const missingFiles = [];
  
  for (const file of requiredFiles) {
    try {
      await fs.access(file);
    } catch (error) {
      missingFiles.push(file);
    }
  }
  
  return missingFiles;
}

// Run command and wait for completion
function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    logInfo(`Running: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
    
    child.on('error', (error) => {
      reject(error);
    });
  });
}

// Main migration process
async function runMigration() {
  try {
    log('🚀 Starting Quick MongoDB Migration Process', 'bright');
    log('==========================================', 'bright');
    
    // Step 1: Check MongoDB
    logStep(1, 'Checking MongoDB connection...');
    const mongoRunning = await checkMongoDB();
    
    if (!mongoRunning) {
      logError('MongoDB is not running locally!');
      logInfo('Please start MongoDB first:');
      logInfo('  Windows: net start MongoDB');
      logInfo('  macOS: brew services start mongodb/brew/mongodb-community');
      logInfo('  Linux: sudo systemctl start mongodb');
      return;
    }
    
    logSuccess('MongoDB is running locally');
    
    // Step 2: Check required files
    logStep(2, 'Checking required files...');
    const missingFiles = await checkRequiredFiles();
    
    if (missingFiles.length > 0) {
      logError(`Missing required files: ${missingFiles.join(', ')}`);
      return;
    }
    
    logSuccess('All required files are present');
    
    // Step 3: Setup environment
    logStep(3, 'Setting up environment...');
    try {
      await runCommand('node', ['setup-local-mongodb.js']);
      logSuccess('Environment setup completed');
    } catch (error) {
      logWarning('Environment setup had issues, but continuing...');
    }
    
    // Step 4: Install dependencies
    logStep(4, 'Installing dependencies...');
    try {
      await runCommand('npm', ['install', 'uuid']);
      logSuccess('Dependencies installed');
    } catch (error) {
      logWarning('Dependency installation had issues, but continuing...');
    }
    
    // Step 5: Run migration
    logStep(5, 'Running data migration...');
    logWarning('This may take several minutes depending on your data size...');
    
    try {
      await runCommand('node', ['migrate-to-local-mongodb.js']);
      logSuccess('Data migration completed successfully!');
    } catch (error) {
      logError(`Migration failed: ${error.message}`);
      return;
    }
    
    // Step 6: Summary
    logStep(6, 'Migration Summary');
    logSuccess('✅ MongoDB data migrated from Atlas to local');
    logSuccess('✅ Media files downloaded and organized');
    logSuccess('✅ File paths updated in database');
    logSuccess('✅ Directory structure created');
    
    log('\n🎉 Migration completed successfully!', 'green');
    log('\n📋 Next steps:', 'cyan');
    log('1. Update your .env.local file with local MongoDB URI');
    log('2. Test your application with: npm run dev');
    log('3. Use delete scripts to manage data: npm run delete:user <userId>');
    log('4. Clean up orphaned files: npm run cleanup:orphaned');
    
  } catch (error) {
    logError(`Migration process failed: ${error.message}`);
    process.exit(1);
  }
}

// Interactive menu
async function showMenu() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    log('\n🔧 MongoDB Migration Options:', 'bright');
    log('1. Run complete migration (recommended)');
    log('2. Setup environment only');
    log('3. Run migration only');
    log('4. Check MongoDB connection');
    log('5. Exit');
    
    rl.question('\nSelect an option (1-5): ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--auto') || args.includes('-a')) {
    // Auto mode - run complete migration
    await runMigration();
  } else {
    // Interactive mode
    const choice = await showMenu();
    
    switch (choice) {
      case '1':
        await runMigration();
        break;
        
      case '2':
        logStep(1, 'Setting up environment...');
        try {
          await runCommand('node', ['setup-local-mongodb.js']);
          logSuccess('Environment setup completed');
        } catch (error) {
          logError(`Setup failed: ${error.message}`);
        }
        break;
        
      case '3':
        logStep(1, 'Running migration...');
        try {
          await runCommand('node', ['migrate-to-local-mongodb.js']);
          logSuccess('Migration completed');
        } catch (error) {
          logError(`Migration failed: ${error.message}`);
        }
        break;
        
      case '4':
        logStep(1, 'Checking MongoDB connection...');
        const mongoRunning = await checkMongoDB();
        if (mongoRunning) {
          logSuccess('MongoDB is running locally');
        } else {
          logError('MongoDB is not running locally');
        }
        break;
        
      case '5':
        log('👋 Goodbye!', 'cyan');
        break;
        
      default:
        logError('Invalid option selected');
    }
  }
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    logError(`Unexpected error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  runMigration,
  checkMongoDB,
  checkRequiredFiles
};
