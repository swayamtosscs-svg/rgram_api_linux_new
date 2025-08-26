const fs = require('fs');
const FormData = require('form-data');

// Test configuration
const BASE_URL = 'http://localhost:3000/api/dp';
const TEST_IMAGE_PATH = './public/images/new.jpg'; // Adjust path as needed
const TEST_USER_ID = 'your_test_user_id_here'; // Replace with actual user ID

// Helper function to make requests (no authentication needed)
async function makeRequest(url, options = {}) {
  return fetch(url, options);
}

// Test 1: Upload Profile Picture
async function testUploadDP() {
  console.log('\n=== Testing DP Upload ===');
  
  try {
    if (!fs.existsSync(TEST_IMAGE_PATH)) {
      console.log('Test image not found. Skipping upload test.');
      return;
    }

    const formData = new FormData();
    formData.append('dp', fs.createReadStream(TEST_IMAGE_PATH));
    formData.append('userId', TEST_USER_ID);

    const response = await makeRequest(`${BASE_URL}/upload`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    console.log('Upload Response:', data);
    
    if (data.success) {
      console.log('✅ DP Upload successful');
      return data.data.publicId; // Return public ID for other tests
    } else {
      console.log('❌ DP Upload failed');
    }
  } catch (error) {
    console.error('Upload error:', error);
  }
}

// Test 2: Retrieve Profile Picture
async function testRetrieveDP() {
  console.log('\n=== Testing DP Retrieve ===');
  
  try {
    const response = await makeRequest(`${BASE_URL}/retrieve?userId=${TEST_USER_ID}`);
    const data = await response.json();
    
    console.log('Retrieve Response:', data);
    
    if (data.success) {
      console.log('✅ DP Retrieve successful');
      if (data.data.hasAvatar) {
        console.log(`Avatar URL: ${data.data.avatar}`);
      } else {
        console.log('No avatar found');
      }
    } else {
      console.log('❌ DP Retrieve failed');
    }
  } catch (error) {
    console.error('Retrieve error:', error);
  }
}

// Test 3: Retrieve DP by User ID
async function testRetrieveDPById() {
  console.log('\n=== Testing DP Retrieve by User ID ===');
  
  try {
    // You would need to replace this with an actual user ID
    const testUserId = 'test_user_id_here';
    
    const response = await makeRequest(`${BASE_URL}/retrieve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId: testUserId })
    });

    const data = await response.json();
    console.log('Retrieve by ID Response:', data);
    
    if (data.success) {
      console.log('✅ DP Retrieve by ID successful');
    } else {
      console.log('❌ DP Retrieve by ID failed');
    }
  } catch (error) {
    console.error('Retrieve by ID error:', error);
  }
}

// Test 4: Replace Profile Picture
async function testReplaceDP() {
  console.log('\n=== Testing DP Replace ===');
  
  try {
    if (!fs.existsSync(TEST_IMAGE_PATH)) {
      console.log('Test image not found. Skipping replace test.');
      return;
    }

    const formData = new FormData();
    formData.append('dp', fs.createReadStream(TEST_IMAGE_PATH));
    formData.append('userId', TEST_USER_ID);

    const response = await makeRequest(`${BASE_URL}/replace`, {
      method: 'PUT',
      body: formData
    });

    const data = await response.json();
    console.log('Replace Response:', data);
    
    if (data.success) {
      console.log('✅ DP Replace successful');
      console.log(`New Avatar URL: ${data.data.avatar}`);
    } else {
      console.log('❌ DP Replace failed');
    }
  } catch (error) {
    console.error('Replace error:', error);
  }
}

// Test 5: Delete Profile Picture
async function testDeleteDP() {
  console.log('\n=== Testing DP Delete ===');
  
  try {
    const response = await makeRequest(`${BASE_URL}/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId: TEST_USER_ID })
    });

    const data = await response.json();
    console.log('Delete Response:', data);
    
    if (data.success) {
      console.log('✅ DP Delete successful');
    } else {
      console.log('❌ DP Delete failed');
    }
  } catch (error) {
    console.error('Delete error:', error);
  }
}

// Main test function
async function runAllTests() {
  console.log('🚀 Starting DP API Tests...');
  console.log(`Base URL: ${BASE_URL}`);
  
  try {
    // Run tests in sequence
    await testUploadDP();
    await testRetrieveDP();
    await testRetrieveDPById();
    await testReplaceDP();
    await testDeleteDP();
    
    console.log('\n🎉 All tests completed!');
  } catch (error) {
    console.error('Test suite error:', error);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testUploadDP,
  testRetrieveDP,
  testRetrieveDPById,
  testReplaceDP,
  testDeleteDP,
  runAllTests
};

// Instructions for testing:
console.log('\n📝 Instructions:');
console.log('1. Replace TEST_USER_ID with an actual user ID from your database');
console.log('2. Ensure you have a test image at the specified path');
console.log('3. Make sure your server is running on localhost:3000');
console.log('4. Run: node test-dp-api.js');
