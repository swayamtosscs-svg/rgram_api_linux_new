// Test file for Media Upload API with User-Specific Folders
// This demonstrates how to use the new API endpoint

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Configuration
const BASE_URL = 'http://localhost:3000'; // Change this to your actual API URL
const USER_ID = '507f1f77bcf86cd799439011'; // Replace with actual user ID
const TEST_IMAGE_PATH = './test-image.jpg'; // Replace with actual test image path

// Test the media upload API
async function testMediaUpload() {
  try {
    console.log('🚀 Testing Media Upload API with User-Specific Folders...');
    
    // Create form data
    const form = new FormData();
    
    // Add file (you need to have a test image file)
    if (fs.existsSync(TEST_IMAGE_PATH)) {
      form.append('file', fs.createReadStream(TEST_IMAGE_PATH));
      console.log('✅ Using test image file');
    } else {
      console.log('⚠️  Test image not found, using dummy file data');
      form.append('file', Buffer.from('dummy image data'), {
        filename: 'test.jpg',
        contentType: 'image/jpeg'
      });
    }
    
    // Add required fields
    form.append('userId', USER_ID);
    form.append('type', 'image');
    form.append('title', 'Test Image Upload');
    form.append('description', 'This is a test image upload with user-specific folder');
    form.append('tags', JSON.stringify(['test', 'user-upload', 'folder-structure']));
    
    // Make the request
    const response = await axios.post(
      `${BASE_URL}/api/media/upload`,
      form,
      {
        headers: {
          ...form.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );
    
    console.log('✅ Upload successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    // Extract important information
    const { secureUrl, folderPath, fileName } = response.data.data;
    console.log('\n📁 File uploaded to Cloudinary folder:', folderPath);
    console.log('🔗 Secure URL:', secureUrl);
    console.log('📄 File name:', fileName);
    
  } catch (error) {
    console.error('❌ Upload failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Test the GET endpoint to retrieve user's media
async function testGetUserMedia() {
  try {
    console.log('\n📥 Testing GET user media API...');
    
    const response = await axios.get(
      `${BASE_URL}/api/media/upload`,
      {
        params: {
          userId: USER_ID,
          page: 1,
          limit: 5,
          type: 'image',
          sortBy: 'createdAt',
          sortOrder: 'desc'
        }
      }
    );
    
    console.log('✅ GET successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ GET failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Test error handling - missing userId
async function testErrorHandling() {
  try {
    console.log('\n🧪 Testing Error Handling - Missing User ID...');
    
    const form = new FormData();
    form.append('file', Buffer.from('test data'), {
      filename: 'test.jpg',
      contentType: 'image/jpeg'
    });
    form.append('type', 'image');
    // Note: userId is missing intentionally
    
    const response = await axios.post(
      `${BASE_URL}/api/media/upload`,
      form,
      {
        headers: {
          ...form.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );
    
    console.log('❌ This should have failed!');
    
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✅ Error handling working correctly!');
      console.log('Error:', error.response.data.error);
    } else {
      console.error('❌ Unexpected error:', error.message);
    }
  }
}

// Test with cURL equivalent
function showCurlExamples() {
  console.log('\n📋 cURL Examples:');
  
  console.log('\n1. Upload image for specific user:');
  console.log(`curl --location '${BASE_URL}/api/media/upload' \\`);
  console.log('  --form "file=@\"path/to/your/image.jpg\"" \\');
  console.log('  --form "userId=\"' + USER_ID + '\"" \\');
  console.log('  --form "type=\"image\"" \\');
  console.log('  --form "title=\"My Image\"" \\');
  console.log('  --form "description=\"Image description\"" \\');
  console.log('  --form "tags=\"[\\\"tag1\\\",\\\"tag2\\\"]\""');
  
  console.log('\n2. Get user media:');
  console.log(`curl '${BASE_URL}/api/media/upload?userId=${USER_ID}&page=1&limit=10&type=image'`);
  
  console.log('\n3. Upload video for specific user:');
  console.log(`curl --location '${BASE_URL}/api/media/upload' \\`);
  console.log('  --form "file=@\"path/to/your/video.mp4\"" \\');
  console.log('  --form "userId=\"' + USER_ID + '\"" \\');
  console.log('  --form "type=\"video\"" \\');
  console.log('  --form "title=\"My Video\""');
  
  console.log('\n4. Test with Postman:');
  console.log(`URL: ${BASE_URL}/api/media/upload`);
  console.log('Method: POST');
  console.log('Body (form-data):');
  console.log('  - file: [select your file]');
  console.log('  - userId: ' + USER_ID);
  console.log('  - type: image');
  console.log('  - title: My Image');
  console.log('  - description: Image description');
  console.log('  - tags: ["tag1", "tag2"]');
}

// Show API features
function showAPIFeatures() {
  console.log('\n🌟 API Features:');
  console.log('✅ Automatic user folder creation in Cloudinary');
  console.log('✅ User-specific file organization (users/{userId}/images/)');
  console.log('✅ Automatic folder structure creation');
  console.log('✅ User ID validation and error handling');
  console.log('✅ File type validation (image/video)');
  console.log('✅ MongoDB integration with user association');
  console.log('✅ User statistics updates');
  console.log('✅ Comprehensive error handling');
  console.log('✅ Response includes secure_url and folder path');
  console.log('✅ Pagination and filtering support');
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Media Upload API Tests...\n');
  
  await testMediaUpload();
  await testGetUserMedia();
  await testErrorHandling();
  
  showAPIFeatures();
  showCurlExamples();
  
  console.log('\n✨ All tests completed!');
}

// Run if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testMediaUpload,
  testGetUserMedia,
  testErrorHandling,
  showCurlExamples,
  showAPIFeatures
};
