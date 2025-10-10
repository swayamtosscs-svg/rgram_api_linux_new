#!/usr/bin/env node

/**
 * Debug Enhanced Messaging API
 * Simple test to identify ObjectId issues
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

// Configuration - UPDATE THESE VALUES
const BASE_URL = 'http://localhost:3000'; // Note: using port 3000 as per your error
const JWT_TOKEN = 'your_jwt_token_here'; // Replace with actual JWT token
const TEST_USER_1 = '68ad57cdceb840899bef3404'; // Replace with actual user ID
const TEST_USER_2 = '68ad57cdceb840899bef3405'; // Replace with actual user ID

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Authorization': `Bearer ${JWT_TOKEN}`,
      ...options.headers
    }
  };

  console.log(`\n📡 ${options.method || 'GET'} ${endpoint}`);
  console.log(`URL: ${url}`);
  
  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(data, null, 2));
    
    return { response, data };
  } catch (error) {
    console.error(`❌ Request failed:`, error.message);
    return { response: null, data: { success: false, error: error.message } };
  }
}

// Test 1: Check JWT token and get user info
async function testAuth() {
  console.log('\n🧪 Test 1: Check Authentication');
  
  const { data } = await apiCall('/api/auth/user');
  
  if (data.success) {
    console.log('✅ Authentication successful');
    console.log(`User ID: ${data.user._id}`);
    console.log(`Username: ${data.user.username}`);
    return data.user._id;
  } else {
    console.log('❌ Authentication failed');
    console.log('Please check your JWT token');
    return null;
  }
}

// Test 2: Send simple text message
async function testSendTextMessage(userId) {
  console.log('\n🧪 Test 2: Send Text Message');
  
  const { data } = await apiCall('/api/chat/enhanced-message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      toUserId: TEST_USER_2,
      content: 'Hello! This is a test text message.',
      messageType: 'text'
    })
  });

  if (data.success) {
    console.log('✅ Text message sent successfully');
    return data.data.threadId;
  } else {
    console.log('❌ Failed to send text message');
    if (data.debug) {
      console.log('Debug info:', data.debug);
    }
    return null;
  }
}

// Test 3: Send message with image (using the same approach as your request)
async function testSendImageMessage(userId) {
  console.log('\n🧪 Test 3: Send Image Message');
  
  // Create a test image file if it doesn't exist
  const testImagePath = path.join(__dirname, 'RGRAM logo.png');
  if (!fs.existsSync(testImagePath)) {
    console.log('⚠️ Test image not found, creating a dummy file...');
    // Create a simple PNG file (1x1 pixel)
    const pngData = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
      0x42, 0x60, 0x82
    ]);
    fs.writeFileSync(testImagePath, pngData);
  }

  const form = new FormData();
  form.append('toUserId', TEST_USER_2);
  form.append('content', 'Check out this RGRAM logo!');
  form.append('messageType', 'image');
  form.append('file', fs.createReadStream(testImagePath));

  const { data } = await apiCall('/api/chat/enhanced-message', {
    method: 'POST',
    body: form
  });

  if (data.success) {
    console.log('✅ Image message sent successfully');
    console.log(`📁 Media URL: ${data.data.message.mediaUrl}`);
    return data.data.message._id;
  } else {
    console.log('❌ Failed to send image message');
    if (data.debug) {
      console.log('Debug info:', data.debug);
    }
    return null;
  }
}

// Test 4: Test with legacy API for comparison
async function testLegacyAPI(userId) {
  console.log('\n🧪 Test 4: Test Legacy API');
  
  const { data } = await apiCall('/api/chat/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      toUserId: TEST_USER_2,
      content: 'Hello! This is a legacy message.',
      messageType: 'text'
    })
  });

  if (data.success) {
    console.log('✅ Legacy message sent successfully');
  } else {
    console.log('❌ Failed to send legacy message');
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Enhanced Messaging API Debug Tests');
  console.log('===============================================');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`JWT Token: ${JWT_TOKEN.substring(0, 20)}...`);
  console.log(`Test User 1: ${TEST_USER_1}`);
  console.log(`Test User 2: ${TEST_USER_2}`);
  
  try {
    // Test authentication first
    const userId = await testAuth();
    if (!userId) {
      console.log('\n❌ Authentication failed. Please check your JWT token.');
      return;
    }

    // Update TEST_USER_1 with actual user ID from auth
    const actualUserId = userId;
    console.log(`\n📝 Using actual user ID: ${actualUserId}`);

    // Run tests
    await testSendTextMessage(actualUserId);
    await testSendImageMessage(actualUserId);
    await testLegacyAPI(actualUserId);
    
    console.log('\n🎉 All tests completed!');
    console.log('===============================================');
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
  testAuth,
  testSendTextMessage,
  testSendImageMessage,
  testLegacyAPI
};
