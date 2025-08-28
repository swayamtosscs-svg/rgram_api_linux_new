const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000';
const TEST_VIEWER_DATA = {
  name: 'Test Viewer',
  email: 'viewer@test.com',
  password: 'test123456',
  username: 'testviewer'
};

async function createTestViewer() {
  try {
    console.log('👤 Creating test viewer user...');
    
    // Try to create user (you'll need to adjust this based on your signup API)
    const response = await axios.post(`${BASE_URL}/api/auth/signup`, TEST_VIEWER_DATA, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success) {
      console.log('✅ Test viewer created successfully!');
      console.log('📋 Viewer Details:');
      console.log(`   User ID: ${response.data.user?._id || 'Check response'}`);
      console.log(`   Name: ${TEST_VIEWER_DATA.name}`);
      console.log(`   Email: ${TEST_VIEWER_DATA.email}`);
      console.log(`   Username: ${TEST_VIEWER_DATA.username}`);
      
      console.log('\n🔧 Next Steps:');
      console.log('1. Copy the User ID above');
      console.log('2. Update your Postman collection variable "viewer_user_id"');
      console.log('3. Or update the test script with this ID');
      
      return response.data.user?._id;
    } else {
      console.log('❌ Failed to create viewer:', response.data.error);
      return null;
    }
    
  } catch (error) {
    console.log('❌ Error creating test viewer:');
    
    if (error.response?.status === 409) {
      console.log('   User already exists with this email/username');
      console.log('   You can use the existing user ID or try a different email');
    } else if (error.response?.data?.error) {
      console.log(`   ${error.response.data.error}`);
    } else {
      console.log(`   ${error.message}`);
    }
    
    console.log('\n🔧 Alternative Solutions:');
    console.log('1. Use an existing user ID from your database');
    console.log('2. Manually create a user through your app');
    console.log('3. Check if your signup API endpoint is correct');
    
    return null;
  }
}

async function checkExistingUsers() {
  try {
    console.log('\n🔍 Checking for existing users...');
    
    // Try to get users (adjust endpoint based on your API)
    const response = await axios.get(`${BASE_URL}/api/users`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success && response.data.users) {
      console.log('✅ Found existing users:');
      response.data.users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name || user.username} (ID: ${user._id})`);
      });
      
      console.log('\n💡 You can use any of these user IDs as viewer_user_id');
    } else {
      console.log('❌ Could not fetch existing users');
    }
    
  } catch (error) {
    console.log('❌ Could not check existing users:', error.message);
  }
}

async function main() {
  console.log('🚀 Live Streaming API - Test Viewer Setup');
  console.log('==========================================');
  
  // Try to create a test viewer
  const viewerId = await createTestViewer();
  
  // Check for existing users as alternative
  await checkExistingUsers();
  
  if (viewerId) {
    console.log('\n🎉 Setup complete!');
    console.log(`Use this viewer ID: ${viewerId}`);
  } else {
    console.log('\n⚠️  Setup incomplete. Please use an existing user ID.');
  }
  
  console.log('\n📚 Usage Instructions:');
  console.log('1. Import the fixed Postman collection: live-streaming-postman-collection-fixed.json');
  console.log('2. Update the "viewer_user_id" variable with a real user ID');
  console.log('3. Follow the numbered sequence in the collection');
  console.log('4. Start with "1. Start Live Stream" and work through the list');
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  });
}

module.exports = { createTestViewer, checkExistingUsers };
