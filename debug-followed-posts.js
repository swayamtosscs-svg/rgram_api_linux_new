const axios = require('axios');

// Configuration
const BASE_URL = 'https://api-rgram1.vercel.app';
const VALID_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGFlYjcxNTg3NjkxYmMxNjA0OTJiZDgiLCJpYXQiOjE3NTY4OTIzMjQsImV4cCI6MTc1OTQ4NDMyNH0.Feb3YRlfhw5ZbxNAU2wPC-TSVkh024wOVSsY363LbYc';

async function debugFollowedPosts() {
  console.log('🔍 Debugging Followed Users Posts API...\n');

  try {
    // Step 1: Test the followed users posts API
    console.log('📝 Step 1: Testing followed users posts API...');
    const postsResponse = await axios.get(`${BASE_URL}/api/posts/followed-users`, {
      headers: {
        'Authorization': `Bearer ${VALID_TOKEN}`,
        'Content-Type': 'application/json'
      },
      params: {
        page: 1,
        limit: 10
      }
    });

    console.log('✅ API Response Status:', postsResponse.status);
    console.log('📊 Full Response:', JSON.stringify(postsResponse.data, null, 2));

    // Step 2: Check user info
    console.log('\n📝 Step 2: Getting current user info...');
    const userResponse = await axios.get(`${BASE_URL}/api/auth/user`, {
      headers: {
        'Authorization': `Bearer ${VALID_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ User Info:', JSON.stringify(userResponse.data, null, 2));

    // Step 3: Check follow relationships (if there's an API for it)
    console.log('\n📝 Step 3: Checking follow relationships...');
    try {
      const followsResponse = await axios.get(`${BASE_URL}/api/user/following`, {
        headers: {
          'Authorization': `Bearer ${VALID_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Following List:', JSON.stringify(followsResponse.data, null, 2));
    } catch (followsError) {
      console.log('⚠️ No following API found or error:', followsError.response?.data || followsError.message);
    }

    // Step 4: Check if there are any posts in the system
    console.log('\n📝 Step 4: Checking general posts feed...');
    try {
      const feedResponse = await axios.get(`${BASE_URL}/api/posts/feed`, {
        headers: {
          'Authorization': `Bearer ${VALID_TOKEN}`,
          'Content-Type': 'application/json'
        },
        params: {
          page: 1,
          limit: 5
        }
      });
      console.log('✅ General Feed:', JSON.stringify(feedResponse.data, null, 2));
    } catch (feedError) {
      console.log('⚠️ No general feed API found or error:', feedError.response?.data || feedError.message);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the debug
if (require.main === module) {
  console.log('🔧 Debugging with your valid token...');
  console.log('👤 User: arjun (ID: 68aeb71587691bc160492bd8)');
  console.log('📊 Following Count: 5, Posts Count: 4\n');
  
  debugFollowedPosts();
}

module.exports = { debugFollowedPosts };
