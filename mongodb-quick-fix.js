const fs = require('fs');

console.log('🚀 MongoDB Quick Fix - Getting you up and running immediately!\n');

// Step 1: Create a working MongoDB Atlas connection
console.log('📋 Step 1: Setting up MongoDB Atlas connection...\n');

console.log('🔗 Go to: https://cloud.mongodb.com/');
console.log('1. Click "Try Free"');
console.log('2. Sign up with Google/GitHub (fastest)');
console.log('3. Create a new project: "R-GRAM"');
console.log('4. Click "Build a Database"');
console.log('5. Choose "FREE" tier (M0 Sandbox)');
console.log('6. Choose region: Asia Pacific (Mumbai)');
console.log('7. Cluster name: "rgram-cluster"');
console.log('8. Click "Create Cluster"\n');

console.log('🔐 Step 2: Database Access');
console.log('1. Go to "Database Access" in left menu');
console.log('2. Click "Add New Database User"');
console.log('3. Authentication Method: "Password"');
console.log('4. Username: "rgramuser"');
console.log('5. Password: "RgramPass123!" (or your choice)');
console.log('6. Database User Privileges: "Read and write to any database"');
console.log('7. Click "Add User"\n');

console.log('🌐 Step 3: Network Access');
console.log('1. Go to "Network Access" in left menu');
console.log('2. Click "Add IP Address"');
console.log('3. Click "Allow Access from Anywhere" (0.0.0.0/0)');
console.log('4. Click "Confirm"\n');

console.log('🔗 Step 4: Get Connection String');
console.log('1. Go to "Database" in left menu');
console.log('2. Click "Connect" on your cluster');
console.log('3. Choose "Connect your application"');
console.log('4. Driver: Node.js, Version: 4.1 or later');
console.log('5. Copy the connection string');
console.log('6. Replace <password> with "RgramPass123!"');
console.log('7. Replace <dbname> with "rgram"\n');

console.log('📝 Your connection string should look like:');
console.log('mongodb+srv://rgramuser:RgramPass123!@rgram-cluster.xxxxx.mongodb.net/rgram?retryWrites=true&w=majority\n');

console.log('⚡ Step 5: Update your app');
console.log('1. Copy your connection string');
console.log('2. Run: node update-mongodb-connection.js "YOUR_CONNECTION_STRING"');
console.log('3. Restart your server');
console.log('4. Test login API\n');

console.log('🎯 This will take about 3-5 minutes and your database will be ready!');
console.log('💡 The free tier gives you 512MB storage - perfect for development!');
