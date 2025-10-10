const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Environment Configuration for Ubuntu Server...');
console.log('📍 Server IP: 103.14.120.163');
console.log('📁 Current directory:', process.cwd());

// Check for .env files
const envFiles = ['.env', '.env.local', '.env.production', '.env.development'];
console.log('\n📄 Checking for environment files:');

envFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ Found: ${file}`);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
      console.log(`   Contains ${lines.length} environment variables`);
      
      // Check for MongoDB URI
      const mongoLine = lines.find(line => line.startsWith('MONGODB_URI'));
      if (mongoLine) {
        const uri = mongoLine.split('=')[1];
        if (uri) {
          console.log(`   MongoDB URI: ${uri.replace(/\/\/.*@/, '//***:***@')}`);
        } else {
          console.log('   ⚠️ MONGODB_URI is empty');
        }
      } else {
        console.log('   ❌ MONGODB_URI not found');
      }
      
      // Check for base URL
      const baseUrlLine = lines.find(line => line.startsWith('NEXT_PUBLIC_BASE_URL'));
      if (baseUrlLine) {
        const baseUrl = baseUrlLine.split('=')[1];
        console.log(`   Base URL: ${baseUrl}`);
      } else {
        console.log('   ⚠️ NEXT_PUBLIC_BASE_URL not found');
      }
      
    } catch (error) {
      console.log(`   ❌ Error reading ${file}:`, error.message);
    }
  } else {
    console.log(`❌ Not found: ${file}`);
  }
});

// Check current environment variables
console.log('\n🌍 Current Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'set' : 'not set');
console.log('NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL || 'not set');

// Check if we're running on the correct server
const os = require('os');
console.log('\n💻 System Information:');
console.log('Platform:', os.platform());
console.log('Architecture:', os.arch());
console.log('Hostname:', os.hostname());
console.log('Network interfaces:', Object.keys(os.networkInterfaces()));

// Check network interfaces for the expected IP
const networkInterfaces = os.networkInterfaces();
let foundExpectedIP = false;
Object.keys(networkInterfaces).forEach(interfaceName => {
  const interfaces = networkInterfaces[interfaceName];
  interfaces.forEach(iface => {
    if (iface.address === '103.14.120.163') {
      foundExpectedIP = true;
      console.log(`✅ Found expected IP on interface ${interfaceName}: ${iface.address}`);
    }
  });
});

if (!foundExpectedIP) {
  console.log('⚠️ Expected IP 103.14.120.163 not found in network interfaces');
  console.log('Available IPs:');
  Object.keys(networkInterfaces).forEach(interfaceName => {
    const interfaces = networkInterfaces[interfaceName];
    interfaces.forEach(iface => {
      console.log(`  ${interfaceName}: ${iface.address} (${iface.family})`);
    });
  });
}

console.log('\n🔧 Recommendations:');
console.log('1. Ensure MONGODB_URI is set correctly');
console.log('2. Verify MongoDB Atlas IP whitelist includes 103.14.120.163');
console.log('3. Check if the server can access the internet');
console.log('4. Verify the MongoDB cluster is running');
console.log('5. Test connection with: node test-mongodb-connection.js');
