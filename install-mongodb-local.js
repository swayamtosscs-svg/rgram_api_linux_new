const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('💻 Installing MongoDB Locally on Windows...\n');

console.log('📋 Option 1: Download MongoDB Community Server');
console.log('1️⃣  Go to: https://www.mongodb.com/try/download/community');
console.log('2️⃣  Download MongoDB Community Server for Windows');
console.log('3️⃣  Run the installer and follow the setup wizard');
console.log('4️⃣  Make sure to install MongoDB as a service\n');

console.log('📋 Option 2: Use Chocolatey (if you have it installed)');
console.log('choco install mongodb\n');

console.log('📋 Option 3: Use Docker (if you have Docker installed)');
console.log('docker run -d -p 27017:27017 --name mongodb mongo:latest\n');

console.log('🔍 After installation, check if MongoDB is running:');
console.log('1. Open Services (services.msc)');
console.log('2. Look for "MongoDB" service');
console.log('3. Make sure it\'s running and set to "Automatic"\n');

console.log('🧪 Test MongoDB connection:');
console.log('node test-db-connection.js\n');

console.log('⚠️  Note: Local MongoDB requires more setup and maintenance.');
console.log('☁️  MongoDB Atlas (cloud) is recommended for easier setup.');
