console.log('🚀 Quick MongoDB Atlas Setup\n');

console.log('📋 Follow these steps to get your database working in 5 minutes:\n');

console.log('1️⃣ Go to: https://cloud.mongodb.com/');
console.log('2️⃣ Click "Try Free" or "Sign In"');
console.log('3️⃣ Create a new project (or use existing)');
console.log('4️⃣ Click "Build a Database"');
console.log('5️⃣ Choose "FREE" tier (M0 Sandbox)');
console.log('6️⃣ Choose a region close to you');
console.log('7️⃣ Name your cluster (e.g., "rgram-cluster")');
console.log('8️⃣ Click "Create Cluster"\n');

console.log('🔐 Database Access:');
console.log('1️⃣ Go to "Database Access" in left menu');
console.log('2️⃣ Click "Add New Database User"');
console.log('3️⃣ Choose "Password" authentication');
console.log('4️⃣ Username: rgramuser');
console.log('5️⃣ Password: (create a strong password)');
console.log('6️⃣ Database User Privileges: "Read and write to any database"');
console.log('7️⃣ Click "Add User"\n');

console.log('🌐 Network Access:');
console.log('1️⃣ Go to "Network Access" in left menu');
console.log('2️⃣ Click "Add IP Address"');
console.log('3️⃣ Click "Allow Access from Anywhere" (0.0.0.0/0)');
console.log('4️⃣ Click "Confirm"\n');

console.log('🔗 Get Connection String:');
console.log('1️⃣ Go to "Database" in left menu');
console.log('2️⃣ Click "Connect" on your cluster');
console.log('3️⃣ Choose "Connect your application"');
console.log('4️⃣ Driver: Node.js, Version: 4.1 or later');
console.log('5️⃣ Copy the connection string');
console.log('6️⃣ Replace <password> with your actual password');
console.log('7️⃣ Replace <dbname> with "rgram"\n');

console.log('📝 Example connection string:');
console.log('mongodb+srv://rgramuser:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/rgram?retryWrites=true&w=majority\n');

console.log('⚡ Quick Test:');
console.log('1. Copy your connection string');
console.log('2. Run: node update-mongodb-connection.js "YOUR_CONNECTION_STRING"');
console.log('3. Restart your server');
console.log('4. Test login API\n');

console.log('🎯 This will take about 5 minutes and your database will be ready!');
