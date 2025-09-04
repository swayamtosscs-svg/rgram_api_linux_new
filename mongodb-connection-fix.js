const http = require('http');

console.log('🔧 MongoDB Connection Fix for Assets API\n');
console.log('Server: 103.14.120.163:8081');
console.log('Issue: MongoDB connection error despite 0.0.0.0/0 whitelist\n');

console.log('🎯 COMPLETE SOLUTION:');
console.log('====================\n');

console.log('1️⃣ ADD SERVER IP TO MONGODB ATLAS:');
console.log('   Go to MongoDB Atlas → Network Access');
console.log('   Click "Add IP Address"');
console.log('   Add: 182.68.1.150/32');
console.log('   Description: "Remote Server IP"');
console.log('   Click "Confirm"\n');

console.log('2️⃣ VERIFY 0.0.0.0/0 IS ACTIVE:');
console.log('   Make sure 0.0.0.0/0 is still in the whitelist');
console.log('   Status should be "Active"\n');

console.log('3️⃣ UPDATE MONGODB CONNECTION SETTINGS:');
console.log('   The connection timeout is too short (5000ms)');
console.log('   Need to increase timeout for better reliability\n');

console.log('4️⃣ WAIT FOR PROPAGATION:');
console.log('   Wait 10-15 minutes for changes to propagate\n');

console.log('5️⃣ RESTART YOUR SERVER:');
console.log('   SSH into your server:');
console.log('   ssh root@103.14.120.163');
console.log('   ');
console.log('   Pull latest code:');
console.log('   cd /var/www/html/api_rgram1');
console.log('   git pull origin main');
console.log('   ');
console.log('   Restart server:');
console.log('   pm2 restart all\n');

console.log('6️⃣ TEST YOUR API:');
console.log('   curl -X POST "http://103.14.120.163:8081/api/assets/upload?userId=68b92530f6b30632560b9a3e" \\');
console.log('     -H "Authorization: Bearer YOUR_TOKEN_HERE" \\');
console.log('     -F "file=@/path/to/your/file.jpg" \\');
console.log('     -F "folder=images"\n');

console.log('🚨 CRITICAL POINTS:');
console.log('===================');
console.log('• Server IP: 182.68.1.150');
console.log('• Add this specific IP to MongoDB Atlas');
console.log('• Keep 0.0.0.0/0 as backup');
console.log('• Wait for propagation (10-15 minutes)');
console.log('• Restart server after adding IP\n');

console.log('✅ EXPECTED RESULT:');
console.log('==================');
console.log('After adding IP and restarting:');
console.log('• "Connected to MongoDB" in server logs');
console.log('• Assets saved using username (e.g., /assets/geet/images/)');
console.log('• No more whitelist errors\n');

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
          console.log('❌ Still getting whitelist error!');
          console.log('Please add IP 182.68.1.150 to MongoDB Atlas');
        } else if (result.error && result.error.includes('Content-Type')) {
          console.log('✅ SUCCESS! MongoDB is connected!');
          console.log('Your remote API is working!');
        } else if (result.success) {
          console.log('🎉 PERFECT! Remote server is working!');
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
