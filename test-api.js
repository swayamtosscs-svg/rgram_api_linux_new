const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'password123',
  fullName: 'Test User',
  username: 'testuser'
};

let authToken = '';

async function testAPI() {
  console.log('🚀 Testing Instagram-like API...\n');

  try {
    // Test 1: User Signup
    console.log('1. Testing User Signup...');
    const signupResponse = await axios.post(`${BASE_URL}/auth/signup`, testUser);
    console.log('✅ Signup successful:', signupResponse.data.message);
    authToken = signupResponse.data.data.token;
    console.log('Token received:', authToken.substring(0, 20) + '...\n');

    // Test 2: User Login
    console.log('2. Testing User Login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Login successful:', loginResponse.data.message);
    authToken = loginResponse.data.data.token;
    console.log('Token received:', authToken.substring(0, 20) + '...\n');

    // Test 3: Get User Profile
    console.log('3. Testing Get User Profile...');
    const profileResponse = await axios.get(`${BASE_URL}/user/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Profile retrieved:', profileResponse.data.message);
    console.log('User:', profileResponse.data.data.user.username, '\n');

    // Test 4: Create Post
    console.log('4. Testing Create Post...');
    const postData = {
      content: 'This is a test post from the API!',
      images: ['https://example.com/image1.jpg'],
      type: 'post'
    };
    const postResponse = await axios.post(`${BASE_URL}/posts`, postData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Post created:', postResponse.data.message);
    const postId = postResponse.data.data.post._id;
    console.log('Post ID:', postId, '\n');

    // Test 5: Get Posts
    console.log('5. Testing Get Posts...');
    const postsResponse = await axios.get(`${BASE_URL}/posts`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Posts retrieved:', postsResponse.data.message);
    console.log('Posts count:', postsResponse.data.data.posts.length, '\n');

    // Test 6: Get Feed
    console.log('6. Testing Get Feed...');
    const feedResponse = await axios.get(`${BASE_URL}/posts/feed`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Feed retrieved:', feedResponse.data.message);
    console.log('Feed posts count:', feedResponse.data.data.posts.length, '\n');

    // Test 7: Search Users
    console.log('7. Testing Search Users...');
    const searchResponse = await axios.get(`${BASE_URL}/search?q=test&type=users`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Search successful:', searchResponse.data.message);
    console.log('Search results:', searchResponse.data.data.users.length, '\n');

    // Test 8: Get Notifications
    console.log('8. Testing Get Notifications...');
    const notificationsResponse = await axios.get(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Notifications retrieved:', notificationsResponse.data.message);
    console.log('Notifications count:', notificationsResponse.data.data.notifications.length, '\n');

    console.log('🎉 All API tests completed successfully!');
    console.log('\n📋 API Features Working:');
    console.log('✅ User Authentication (Signup/Login)');
    console.log('✅ User Profiles');
    console.log('✅ Posts (Create/Read)');
    console.log('✅ User Feed');
    console.log('✅ Search Functionality');
    console.log('✅ Notifications');
    console.log('✅ JWT Authentication');
    console.log('✅ MongoDB Integration');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the tests
testAPI();
