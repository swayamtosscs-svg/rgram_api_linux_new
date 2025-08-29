const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Base URL for the API
const BASE_URL = 'http://localhost:3000/api/dp';

// Test user ID (replace with actual user ID from your database)
const TEST_USER_ID = 'your_test_user_id_here';

// Test functions
async function testDPInfo() {
  try {
    console.log('🔍 Testing DP API Info...');
    const response = await axios.get(BASE_URL);
    console.log('✅ DP API Info:', response.data);
  } catch (error) {
    console.error('❌ Error getting DP API info:', error.response?.data || error.message);
  }
}

async function testRetrieveDP() {
  try {
    console.log('\n📸 Testing Retrieve DP...');
    const response = await axios.get(`${BASE_URL}/retrieve?userId=${TEST_USER_ID}`);
    console.log('✅ Retrieve DP Response:', response.data);
  } catch (error) {
    console.error('❌ Error retrieving DP:', error.response?.data || error.message);
  }
}

async function testRetrieveDPPost() {
  try {
    console.log('\n📸 Testing Retrieve DP (POST method)...');
    const response = await axios.post(`${BASE_URL}/retrieve`, {
      userId: TEST_USER_ID
    });
    console.log('✅ Retrieve DP POST Response:', response.data);
  } catch (error) {
    console.error('❌ Error retrieving DP (POST):', error.response?.data || error.message);
  }
}

async function testUploadDP() {
  try {
    console.log('\n⬆️ Testing Upload DP...');
    
    // Create a simple test image (you can replace this with an actual image file)
    const formData = new FormData();
    
    // If you have a test image file, uncomment and modify this:
    // formData.append('dp', fs.createReadStream('./test-image.jpg'));
    
    // For testing without actual file, we'll just show the structure
    console.log('📁 FormData structure for upload:');
    console.log('- dp: image file (JPEG, PNG, GIF, etc.)');
    console.log('- userId:', TEST_USER_ID);
    
    console.log('⚠️ Note: Actual file upload test requires a real image file');
    
  } catch (error) {
    console.error('❌ Error in upload test:', error.message);
  }
}

async function testReplaceDP() {
  try {
    console.log('\n🔄 Testing Replace DP...');
    
    console.log('📁 FormData structure for replace:');
    console.log('- dp: new image file (JPEG, PNG, GIF, etc.)');
    console.log('- userId:', TEST_USER_ID);
    
    console.log('⚠️ Note: Actual file replace test requires a real image file');
    
  } catch (error) {
    console.error('❌ Error in replace test:', error.message);
  }
}

async function testDeleteDP() {
  try {
    console.log('\n🗑️ Testing Delete DP...');
    const response = await axios.delete(`${BASE_URL}/delete`, {
      data: { userId: TEST_USER_ID }
    });
    console.log('✅ Delete DP Response:', response.data);
  } catch (error) {
    console.error('❌ Error deleting DP:', error.response?.data || error.message);
  }
}

// Main test function
async function runAllTests() {
  console.log('🚀 Starting DP API Tests...\n');
  
  await testDPInfo();
  await testRetrieveDP();
  await testRetrieveDPPost();
  await testUploadDP();
  await testReplaceDP();
  await testDeleteDP();
  
  console.log('\n✨ All tests completed!');
  console.log('\n📝 To test file uploads, you need to:');
  console.log('1. Replace TEST_USER_ID with an actual user ID from your database');
  console.log('2. Uncomment the file upload lines in testUploadDP() and testReplaceDP()');
  console.log('3. Provide actual image files for testing');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testDPInfo,
  testRetrieveDP,
  testRetrieveDPPost,
  testUploadDP,
  testReplaceDP,
  testDeleteDP,
  runAllTests
};
