const axios = require('axios');

// Configuration
const BASE_URL = 'https://api-rgram1.vercel.app';
const VALID_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGFlYjcxNTg3NjkxYmMxNjA0OTJiZDgiLCJpYXQiOjE3NTY4OTIzMjQsImV4cCI6MTc1OTQ4NDMyNH0.Feb3YRlfhw5ZbxNAU2wPC-TSVkh024wOVSsY363LbYc';
const USER_ID = '68aeb71587691bc160492bd8';

async function debugFollowRelationships() {
  console.log('🔍 Debugging Follow Relationships...\n');

  try {
    // Step 1: Check who you are following
    console.log('📝 Step 1: Checking who you are following...');
    const followingResponse = await axios.get(`${BASE_URL}/api/following/${USER_ID}`, {
      headers: {
        'Authorization': `Bearer ${VALID_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Following Response:', JSON.stringify(followingResponse.data, null, 2));

    // Step 2: Test the followed users posts API
    console.log('\n📝 Step 2: Testing followed users posts API...');
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

    console.log('✅ Posts Response:', JSON.stringify(postsResponse.data, null, 2));

    // Step 3: Check if there are any posts in the system
    console.log('\n📝 Step 3: Checking general posts...');
    try {
      const allPostsResponse = await axios.get(`${BASE_URL}/api/posts`, {
        headers: {
          'Authorization': `Bearer ${VALID_TOKEN}`,
          'Content-Type': 'application/json'
        },
        params: {
          page: 1,
          limit: 5
        }
      });
      console.log('✅ All Posts Response:', JSON.stringify(allPostsResponse.data, null, 2));
    } catch (allPostsError) {
      console.log('⚠️ All Posts API Error:', allPostsError.response?.data || allPostsError.message);
    }

    // Step 4: Check your own posts
    console.log('\n📝 Step 4: Checking your own posts...');
    try {
      const myPostsResponse = await axios.get(`${BASE_URL}/api/posts/user/${USER_ID}`, {
        headers: {
          'Authorization': `Bearer ${VALID_TOKEN}`,
          'Content-Type': 'application/json'
        },
        params: {
          page: 1,
          limit: 5
        }
      });
      console.log('✅ My Posts Response:', JSON.stringify(myPostsResponse.data, null, 2));
    } catch (myPostsError) {
      console.log('⚠️ My Posts API Error:', myPostsError.response?.data || myPostsError.message);
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
  console.log('🔧 Debugging follow relationships...');
  console.log('👤 User: arjun (ID: 68aeb71587691bc160492bd8)');
  console.log('📊 Following Count: 5, Posts Count: 4\n');
  
  debugFollowRelationships();
}

module.exports = { debugFollowRelationships };
