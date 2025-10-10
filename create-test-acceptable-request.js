const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000';
const CURRENT_USER_JWT = 'YOUR_CURRENT_JWT_TOKEN_HERE'; // Replace with sumit's token
const CURRENT_USER_ID = '68b12c75d38c9af3cbcb41b3'; // sumit's user ID
const OTHER_USER_ID = '68b1655f0000d8f1f33a5e03'; // suuumit's user ID

async function checkCurrentUser() {
  try {
    console.log('🔍 Checking current user...');
    
    const response = await axios.get(`${BASE_URL}/api/debug-token`, {
      headers: {
        'Authorization': `Bearer ${CURRENT_USER_JWT}`
      }
    });
    
    console.log('✅ Current user info:', response.data.data);
    return response.data.data.userId;
    
  } catch (error) {
    console.error('❌ Error checking current user:', error.response?.data || error.message);
    return null;
  }
}

async function createFollowRequestToCurrentUser() {
  try {
    console.log('\n🚀 Creating follow request TO current user...');
    console.log('This will allow you to test accepting a follow request');
    
    // Note: This would normally be done by another user, but for testing we'll simulate it
    // In a real scenario, user 'suuumit' would send this request to 'sumit'
    
    const response = await axios.post(`${BASE_URL}/api/follow-request/send`, {
      targetUserId: CURRENT_USER_ID
    }, {
      headers: {
        'Authorization': `Bearer ${CURRENT_USER_JWT}`,
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
      console.log(`  -H "Authorization: Bearer ${CURRENT_USER_JWT}" \\`);
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

async function checkPendingRequests() {
  try {
    console.log('\n🔍 Checking pending follow requests for current user...');
    
    const response = await axios.get(`${BASE_URL}/api/follow-request/pending`, {
      headers: {
        'Authorization': `Bearer ${CURRENT_USER_JWT}`
      }
    });
    
    console.log('✅ Pending follow requests:');
    console.log('Response:', response.data);
    
    if (response.data.data && response.data.data.pendingRequests) {
      console.log('\n📋 Found pending requests:');
      response.data.data.pendingRequests.forEach((req, index) => {
        console.log(`${index + 1}. ID: ${req._id}, From: ${req.follower.username}, Status: ${req.status}`);
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

async function checkSentRequests() {
  try {
    console.log('\n🔍 Checking sent follow requests...');
    
    const response = await axios.get(`${BASE_URL}/api/follow-request/sent`, {
      headers: {
        'Authorization': `Bearer ${CURRENT_USER_JWT}`
      }
    });
    
    console.log('✅ Sent follow requests:');
    console.log('Response:', response.data);
    
    if (response.data.data && response.data.data.sentRequests) {
      console.log('\n📋 Found sent requests:');
      response.data.data.sentRequests.forEach((req, index) => {
        console.log(`${index + 1}. ID: ${req._id}, To: ${req.following.username}, Status: ${req.status}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking sent requests:');
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
  console.log('=== Follow Request Acceptance Test Tool ===\n');
  
  // Check current user
  const currentUserId = await checkCurrentUser();
  if (!currentUserId) {
    console.log('❌ Could not determine current user. Check your JWT token.');
    return;
  }
  
  console.log(`\n👤 Current user ID: ${currentUserId}`);
  
  // Check existing requests
  await checkPendingRequests();
  await checkSentRequests();
  
  // Create a follow request TO current user (for testing acceptance)
  await createFollowRequestToCurrentUser();
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { 
  checkCurrentUser, 
  createFollowRequestToCurrentUser, 
  checkPendingRequests, 
  checkSentRequests 
};
