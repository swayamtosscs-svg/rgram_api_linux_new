const http = require('http');

console.log('🔧 MongoDB Atlas 0.0.0.0/0 Fix Solution\n');
console.log('Status: 0.0.0.0/0 is whitelisted ✅');
console.log('Goal: Make API work from anywhere 🌍\n');

console.log('🎯 COMPLETE SOLUTION FOR 0.0.0.0/0:');
console.log('=====================================\n');

console.log('1️⃣ MONGODB ATLAS SETUP (DONE ✅):');
console.log('   - 0.0.0.0/0 is already whitelisted');
console.log('   - Status: Active');
console.log('   - This allows access from ANY IP address\n');

console.log('2️⃣ SERVER RESTART (REQUIRED 🔄):');
console.log('   Your server MUST be restarted to pick up the new whitelist:');
console.log('   ');
console.log('   On your server (103.14.120.163), run:');
console.log('   ');
console.log('   # Option 1: PM2 restart');
console.log('   pm2 restart all');
console.log('   ');
console.log('   # Option 2: NPM restart');
console.log('   npm run dev');
console.log('   ');
console.log('   # Option 3: Direct node restart');
console.log('   node server.js\n');

console.log('3️⃣ ENVIRONMENT VERIFICATION:');
console.log('   Make sure your server has .env.local with:');
console.log('   MONGODB_URI=mongodb+srv://tossitswayam:Qwert123%23%24@cluster0.tpk0nle.mongodb.net/api_rgram?retryWrites=true&w=majority\n');

console.log('4️⃣ WAIT FOR PROPAGATION:');
console.log('   Wait 5-10 minutes after restarting\n');

console.log('5️⃣ TEST YOUR API:');
console.log('   After restart, test with:');
console.log('   ');
console.log('   curl -X POST "http://103.14.120.163:8081/api/assets/upload?userId=68b92530f6b30632560b9a3e" \\');
console.log('     -H "Authorization: Bearer YOUR_TOKEN_HERE" \\');
console.log('     -F "file=@/path/to/your/file.jpg" \\');
console.log('     -F "folder=images"\n');

console.log('6️⃣ CHECK SERVER LOGS:');
console.log('   Look for MongoDB connection success:');
console.log('   pm2 logs | grep -i mongo');
console.log('   OR');
console.log('   tail -f server.log | grep -i mongo\n');

console.log('🚨 CRITICAL POINTS:');
console.log('===================');
console.log('• 0.0.0.0/0 allows access from ANY IP address');
console.log('• Server MUST be restarted for changes to take effect');
console.log('• MongoDB connection is cached, so restart is required');
console.log('• Wait 5-10 minutes for full propagation\n');

console.log('✅ EXPECTED RESULT:');
console.log('==================');
console.log('After restart, you should see:');
console.log('• MongoDB connection successful in logs');
console.log('• Assets API working from any IP');
console.log('• No more whitelist errors');
console.log('• All APIs functioning normally\n');

// Test current status
async function testCurrentStatus() {
  console.log('Testing current server status...\n');
  
  const options = {
    hostname: '103.14.120.163',
    port: 8081,
    path: '/api/assets/upload?userId=68b92530f6b30632560b9a3e',
    method: 'POST',
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGEyYmE1MDNhOWY2NDE3YTE2OGFiYzkiLCJpYXQiOjE3NTY5NzQxMTIsImV4cCI6MTc1OTU2NjExMn0.s4gvCkQZFs0azP8WKlGccA7uB2rLuhCgeqIr2bAZ0cQ',
      'Content-Type': 'application/json'
    }
  };
  
  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        if (result.error && result.error.includes('whitelist')) {
          console.log('❌ Server still needs restart!');
          console.log('Please restart your server on 103.14.120.163');
          console.log('Run: pm2 restart all');
        } else if (result.error && result.error.includes('Content-Type')) {
          console.log('✅ SUCCESS! MongoDB is connected!');
          console.log('Your API is working with 0.0.0.0/0!');
        } else if (result.success) {
          console.log('🎉 PERFECT! Everything is working!');
        } else {
          console.log('📊 Response:', result.message);
        }
      } catch (e) {
        console.log('📄 Raw response:', data);
      }
    });
  });
  
  req.on('error', (error) => {
    console.log('❌ Connection error:', error.message);
  });
  
  req.write(JSON.stringify({ test: 'connection' }));
  req.end();
}

testCurrentStatus();
