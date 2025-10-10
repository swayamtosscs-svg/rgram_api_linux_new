const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000';
const JWT_TOKEN = 'YOUR_JWT_TOKEN_HERE'; // Replace with your actual token
const TARGET_USER_ID = 'DIFFERENT_USER_ID_HERE'; // Replace with a different user ID

async function createFollowRequest() {
  try {
    console.log('🚀 Creating test follow request...');
    console.log('Target User ID:', TARGET_USER_ID);
    
    const response = await axios.post(`${BASE_URL}/api/follow-request/send`, {
      targetUserId: TARGET_USER_ID
    }, {
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Follow request created successfully!');
    console.log('Response:', response.data);
    
    if (response.data.data && response.data.data.followRequest) {
      console.log('\n📋 Follow Request Details:');
      console.log('Follow Request ID:', response.data.data.followRequest._id);
      console.log('Status:', response.data.data.followRequest.status);
      console.log('Follower:', response.data.data.followRequest.follower.username);
      console.log('Following:', response.data.data.followRequest.following.username);
      
      console.log('\n💡 Now you can accept this follow request using:');
      console.log(`curl -X POST "${BASE_URL}/api/follow-request/accept" \\`);
      console.log(`  -H "Authorization: Bearer ${JWT_TOKEN}" \\`);
      console.log(`  -H "Content-Type: application/json" \\`);
      console.log(`  -d '{"followRequestId": "${response.data.data.followRequest._id}"}'`);
    }
    
  } catch (error) {
    console.error('❌ Error creating follow request:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.message);
      console.error('Full Response:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

async function checkExistingFollowRequests() {
  try {
    console.log('\n🔍 Checking existing follow requests...');
    
    const response = await axios.get(`${BASE_URL}/api/follow-request/sent`, {
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`
      }
    });
    
    console.log('✅ Existing follow requests:');
    console.log('Response:', response.data);
    
    if (response.data.data && response.data.data.sentRequests) {
      console.log('\n📋 Found follow requests:');
      response.data.data.sentRequests.forEach((req, index) => {
        console.log(`${index + 1}. ID: ${req._id}, Status: ${req.status}, Target: ${req.following.username}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking follow requests:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.message);
    } else {
      console.error('Error:', error.message);
    }
  }
}

async function checkPendingFollowRequests() {
  try {
    console.log('\n🔍 Checking pending follow requests...');
    
    const response = await axios.get(`${BASE_URL}/api/follow-request/pending`, {
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`
      }
    });
    
    console.log('✅ Pending follow requests:');
    console.log('Response:', response.data);
    
    if (response.data.data && response.data.data.pendingRequests) {
      console.log('\n📋 Found pending requests:');
      response.data.data.pendingRequests.forEach((req, index) => {
        console.log(`${index + 1}. ID: ${req._id}, From: ${req.follower.username}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking pending requests:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.message);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Main execution
async function main() {
  console.log('=== Follow Request Test Tool ===\n');
  
  // Check existing requests first
  await checkExistingFollowRequests();
  
  // Check pending requests
  await checkPendingFollowRequests();
  
  // Create new follow request
  await createFollowRequest();
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createFollowRequest, checkExistingFollowRequests, checkPendingFollowRequests };
