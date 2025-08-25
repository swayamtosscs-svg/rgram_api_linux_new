/**
 * Test script for the Logout API
 * This script demonstrates how to use the logout API to logout users by ID
 */

const fetch = require('node-fetch');

// Configuration
const API_BASE_URL = 'http://localhost:3000/api';
const TEST_USER_EMAIL = 'test@example.com';
const TEST_USER_PASSWORD = 'password123';

// Test scenarios
async function testLogoutAPI() {
  console.log('🚀 Testing Logout API with User ID functionality...\n');

  try {
    // Step 1: Login to get a token
    console.log('1️⃣ Logging in to get authentication token...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      console.error('❌ Login failed:', loginData.message);
      return;
    }

    const token = loginData.data.token;
    const userId = loginData.data.user.id;
    console.log('✅ Login successful!');
    console.log(`   User ID: ${userId}`);
    console.log(`   Token: ${token.substring(0, 20)}...\n`);

    // Step 2: Test regular logout (logout self)
    console.log('2️⃣ Testing regular logout (logout self)...');
    const selfLogoutResponse = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const selfLogoutData = await selfLogoutResponse.json();
    console.log('Response:', selfLogoutData);

    if (selfLogoutData.success) {
      console.log('✅ Self logout successful!\n');
    } else {
      console.log('❌ Self logout failed:', selfLogoutData.message);
      return;
    }

    // Step 3: Test logout by user ID (requires admin privileges)
    console.log('3️⃣ Testing logout by user ID (requires admin privileges)...');
    
    // First, we need to login again since we just logged out
    const reloginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD
      })
    });

    const reloginData = await reloginResponse.json();
    if (!reloginData.success) {
      console.log('❌ Relogin failed, cannot test logout by ID');
      return;
    }

    const newToken = reloginData.data.token;
    
    // Try to logout another user by ID
    const logoutByIdResponse = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${newToken}`
      },
      body: JSON.stringify({
        userId: '507f1f77bcf86cd799439011' // Example user ID
      })
    });

    const logoutByIdData = await logoutByIdResponse.json();
    console.log('Response:', logoutByIdData);

    if (logoutByIdData.success) {
      console.log('✅ Logout by user ID successful!');
      console.log(`   Logged out user: ${logoutByIdData.data.loggedOutUserId}`);
      console.log(`   Logged out by: ${logoutByIdData.data.loggedOutBy}`);
    } else {
      console.log('❌ Logout by user ID failed:', logoutByIdData.message);
      
      if (logoutByIdData.message.includes('Access denied')) {
        console.log('   This is expected for non-admin users');
      }
    }

    // Step 4: Test logout with invalid user ID
    console.log('\n4️⃣ Testing logout with invalid user ID...');
    const invalidLogoutResponse = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${newToken}`
      },
      body: JSON.stringify({
        userId: 'invalid-user-id'
      })
    });

    const invalidLogoutData = await invalidLogoutResponse.json();
    console.log('Response:', invalidLogoutData);

    if (!invalidLogoutData.success) {
      console.log('✅ Invalid user ID correctly rejected');
    }

    console.log('\n🎉 Logout API testing completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testLogoutAPI();
