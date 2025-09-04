const axios = require('axios');

// Configuration
const BASE_URL = 'https://api-rgram1.vercel.app';
const VALID_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGFlYjcxNTg3NjkxYmMxNjA0OTJiZDgiLCJpYXQiOjE3NTY4OTIzMjQsImV4cCI6MTc1OTQ4NDMyNH0.Feb3YRlfhw5ZbxNAU2wPC-TSVkh024wOVSsY363LbYc';
const USER_ID = '68aeb71587691bc160492bd8';

async function setupTestData() {
  console.log('🔧 Setting up test data for followed users posts...\n');

  try {
    // Step 1: Get list of all users to follow
    console.log('📝 Step 1: Getting list of users to follow...');
    try {
      const usersResponse = await axios.get(`${BASE_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${VALID_TOKEN}`,
          'Content-Type': 'application/json'
        },
        params: {
          page: 1,
          limit: 10
        }
      });
      console.log('✅ Users found:', usersResponse.data);
    } catch (usersError) {
      console.log('⚠️ Users API not available:', usersError.response?.data || usersError.message);
    }

    // Step 2: Create a test post for yourself
    console.log('\n📝 Step 2: Creating a test post...');
    try {
      const testPost = {
        content: 'This is a test post to verify the API is working!',
        type: 'post',
        category: 'general'
      };

      const createPostResponse = await axios.post(`${BASE_URL}/api/posts/create`, testPost, {
        headers: {
          'Authorization': `Bearer ${VALID_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Test post created:', JSON.stringify(createPostResponse.data, null, 2));
    } catch (createPostError) {
      console.log('⚠️ Create post error:', createPostError.response?.data || createPostError.message);
    }

    // Step 3: Check if there are any other users to follow
    console.log('\n📝 Step 3: Looking for users to follow...');
    console.log('💡 To test the followed users posts API, you need to:');
    console.log('   1. Find other users in the system');
    console.log('   2. Follow them (send follow requests)');
    console.log('   3. Make sure they accept your follow requests');
    console.log('   4. Ensure they have posts');

    // Step 4: Test the current state
    console.log('\n📝 Step 4: Testing current state...');
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

    console.log('✅ Current followed users posts:', JSON.stringify(postsResponse.data, null, 2));

    if (postsResponse.data.data.posts.length === 0) {
      console.log('\n💡 No posts found from followed users. This means:');
      console.log('   - You might not be following anyone');
      console.log('   - The users you follow might not have posts');
      console.log('   - The follow requests might not be accepted');
      
      console.log('\n🔧 To fix this:');
      console.log('   1. Use the follow API to follow other users');
      console.log('   2. Make sure they accept your follow requests');
      console.log('   3. Ask them to create some posts');
    }

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the setup
if (require.main === module) {
  console.log('🚀 Setting up test data...');
  console.log('👤 User: arjun (ID: 68aeb71587691bc160492bd8)\n');
  
  setupTestData();
}

module.exports = { setupTestData };

