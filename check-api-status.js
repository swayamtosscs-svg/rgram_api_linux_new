const axios = require('axios');

async function checkAPIStatus() {
  console.log('🔍 Checking API Status...\n');
  
  // Test Local API
  try {
    console.log('🏠 Testing Local API (localhost:3000)...');
    const localResponse = await axios.get('http://localhost:3000/api/debug-env', { timeout: 3000 });
    console.log('✅ Local API: RUNNING');
    console.log('   Status:', localResponse.status);
    console.log('   Database:', localResponse.data.environmentVariables.MONGODB_URI ? 'Connected' : 'Not Connected');
  } catch (error) {
    console.log('❌ Local API: NOT RUNNING');
    console.log('   Error:', error.message);
  }
  
  console.log('');
  
  // Test Remote API
  try {
    console.log('🌐 Testing Remote API (103.14.120.163:8081)...');
    const remoteResponse = await axios.get('http://103.14.120.163:8081/api/debug-env', { timeout: 5000 });
    console.log('✅ Remote API: RUNNING');
    console.log('   Status:', remoteResponse.status);
    console.log('   Database:', remoteResponse.data.environmentVariables.MONGODB_URI ? 'Connected' : 'Not Connected');
  } catch (error) {
    console.log('❌ Remote API: NOT RUNNING');
    console.log('   Error:', error.message);
  }
  
  console.log('\n📋 Quick Commands:');
  console.log('🏠 Start Local API: npm run dev');
  console.log('🌐 Test Remote API: curl http://103.14.120.163:8081/api/debug-env');
  console.log('🔧 Deploy to Remote: Upload files to server and run start-server.sh');
}

checkAPIStatus();
