#!/usr/bin/env node

/**
 * Server Upload Diagnostic Script
 * Diagnoses common issues with server upload
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Diagnosing server upload issues...\n');

// 1. Check environment
console.log('1️⃣ Checking environment...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Current directory:', process.cwd());
console.log('MongoDB URI exists:', !!process.env.MONGODB_URI);

// 2. Check file structure
console.log('\n2️⃣ Checking file structure...');
const requiredFiles = [
  'pages/api/assets/upload.ts',
  'lib/models/User.ts',
  '.env.local',
  'public/assets'
];

requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// 3. Check permissions
console.log('\n3️⃣ Checking permissions...');
const assetsDir = path.join(process.cwd(), 'public', 'assets');
try {
  const testFile = path.join(assetsDir, 'test-permissions.txt');
  fs.writeFileSync(testFile, 'test');
  fs.unlinkSync(testFile);
  console.log('✅ Write permissions OK');
} catch (error) {
  console.log('❌ Write permission error:', error.message);
}

// 4. Check MongoDB connection
console.log('\n4️⃣ Testing MongoDB connection...');
try {
  const mongoose = require('mongoose');
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://tossitswayam:Qwert123%23%24@cluster0.tpk0nle.mongodb.net/api_rgram?retryWrites=true&w=majority';
  
  mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000
  }).then(() => {
    console.log('✅ MongoDB connection successful');
    mongoose.disconnect();
  }).catch(error => {
    console.log('❌ MongoDB connection failed:', error.message);
  });
} catch (error) {
  console.log('❌ MongoDB test failed:', error.message);
}

// 5. Check server status
console.log('\n5️⃣ Checking server status...');
try {
  const pm2Status = execSync('pm2 status', { encoding: 'utf8' });
  console.log('PM2 Status:');
  console.log(pm2Status);
} catch (error) {
  console.log('❌ PM2 not available or no processes running');
}

// 6. Check port availability
console.log('\n6️⃣ Checking port availability...');
try {
  const netstat = execSync('netstat -tulpn | grep :3000', { encoding: 'utf8' });
  console.log('Port 3000 status:');
  console.log(netstat || 'Port 3000 not in use');
} catch (error) {
  console.log('⚠️  Could not check port status');
}

// 7. Check disk space
console.log('\n7️⃣ Checking disk space...');
try {
  const df = execSync('df -h', { encoding: 'utf8' });
  console.log('Disk space:');
  console.log(df);
} catch (error) {
  console.log('⚠️  Could not check disk space');
}

console.log('\n🎯 Diagnostic complete!');
console.log('\n💡 Common fixes:');
console.log('1. Ensure MongoDB Atlas IP is whitelisted');
console.log('2. Check file permissions: chmod -R 755 public/assets');
console.log('3. Restart server: pm2 restart all');
console.log('4. Check server logs: pm2 logs');
