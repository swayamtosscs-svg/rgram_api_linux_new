const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_USER_ID = '507f1f77bcf86cd799439011'; // Replace with actual user ID
const TEST_STORY_ID = '507f1f77bcf86cd799439012'; // Replace with actual story ID

// Test data
const testImagePath = path.join(__dirname, 'public', 'images', 'religious', 'hinduism', '1.jpg');
const testVideoPath = path.join(__dirname, 'public', 'videos', 'religious', 'hinduism', 'video1.txt');

console.log('🧪 Story Media API Test Suite');
console.log('==============================\n');

// Helper function to make HTTP requests
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    return { status: 500, error: error.message };
  }
}

// Helper function to create form data for file upload
function createFormData(filePath, fields) {
  const FormData = require('form-data');
  const form = new FormData();
  
  // Add file if it exists
  if (fs.existsSync(filePath)) {
    form.append('file', fs.createReadStream(filePath));
  }
  
  // Add other fields
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      form.append(key, value);
    }
  });
  
  return form;
}

// Test 1: Upload Story Media (Image)
async function testUploadStoryImage() {
  console.log('📸 Test 1: Upload Story Image');
  console.log('--------------------------------');
  
  if (!fs.existsSync(testImagePath)) {
    console.log('⚠️  Test image not found, skipping upload test');
    console.log('   Expected path:', testImagePath);
    return;
  }

  try {
    const formData = createFormData(testImagePath, {
      userId: TEST_USER_ID,
      caption: 'Test story image upload',
      hashtags: JSON.stringify(['test', 'story', 'image']),
      location: 'Test Location'
    });

    const response = await fetch(`${BASE_URL}/api/story/upload`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Upload successful!');
      console.log('   Story ID:', data.data.storyId);
      console.log('   Public ID:', data.data.publicId);
      console.log('   Folder:', data.data.folderPath);
      console.log('   URL:', data.data.secureUrl);
    } else {
      console.log('❌ Upload failed:', data.error);
    }
  } catch (error) {
    console.log('❌ Upload test error:', error.message);
  }
  
  console.log('');
}

// Test 2: Upload Story Media (Video)
async function testUploadStoryVideo() {
  console.log('🎥 Test 2: Upload Story Video');
  console.log('--------------------------------');
  
  if (!fs.existsSync(testVideoPath)) {
    console.log('⚠️  Test video not found, skipping upload test');
    console.log('   Expected path:', testVideoPath);
    return;
  }

  try {
    const formData = createFormData(testVideoPath, {
      userId: TEST_USER_ID,
      caption: 'Test story video upload',
      hashtags: JSON.stringify(['test', 'story', 'video']),
      location: 'Test Location'
    });

    const response = await fetch(`${BASE_URL}/api/story/upload`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Upload successful!');
      console.log('   Story ID:', data.data.storyId);
      console.log('   Public ID:', data.data.publicId);
      console.log('   Folder:', data.data.folderPath);
      console.log('   URL:', data.data.secureUrl);
    } else {
      console.log('❌ Upload failed:', data.error);
    }
  } catch (error) {
    console.log('❌ Upload test error:', error.message);
  }
  
  console.log('');
}

// Test 3: Retrieve User Stories
async function testRetrieveUserStories() {
  console.log('📖 Test 3: Retrieve User Stories');
  console.log('----------------------------------');
  
  try {
    const response = await makeRequest(
      `${BASE_URL}/api/story/retrieve?userId=${TEST_USER_ID}&page=1&limit=5`
    );
    
    if (response.status === 200) {
      console.log('✅ Retrieve successful!');
      console.log('   User:', response.data.data.user.username);
      console.log('   Total stories:', response.data.data.pagination.totalItems);
      console.log('   Current page:', response.data.data.pagination.currentPage);
      console.log('   Stories found:', response.data.data.stories.length);
    } else {
      console.log('❌ Retrieve failed:', response.data.error);
    }
  } catch (error) {
    console.log('❌ Retrieve test error:', error.message);
  }
  
  console.log('');
}

// Test 4: Retrieve Specific Story
async function testRetrieveSpecificStory() {
  console.log('🔍 Test 4: Retrieve Specific Story');
  console.log('-----------------------------------');
  
  try {
    const response = await makeRequest(
      `${BASE_URL}/api/story/retrieve?storyId=${TEST_STORY_ID}`
    );
    
    if (response.status === 200) {
      console.log('✅ Retrieve successful!');
      console.log('   Story ID:', response.data.data.story.id);
      console.log('   Type:', response.data.data.story.type);
      console.log('   Caption:', response.data.data.story.caption);
      console.log('   Author:', response.data.data.story.author.username);
    } else {
      console.log('❌ Retrieve failed:', response.data.error);
    }
  } catch (error) {
    console.log('❌ Retrieve test error:', error.message);
  }
  
  console.log('');
}

// Test 5: Add Story View
async function testAddStoryView() {
  console.log('👁️  Test 5: Add Story View');
  console.log('----------------------------');
  
  try {
    const response = await makeRequest(
      `${BASE_URL}/api/story/retrieve?storyId=${TEST_STORY_ID}&userId=${TEST_USER_ID}`,
      { method: 'POST' }
    );
    
    if (response.status === 200) {
      console.log('✅ View added successfully!');
      console.log('   Story ID:', response.data.data.storyId);
      console.log('   Views count:', response.data.data.viewsCount);
    } else {
      console.log('❌ Add view failed:', response.data.error);
    }
  } catch (error) {
    console.log('❌ Add view test error:', error.message);
  }
  
  console.log('');
}

// Test 6: Delete Story
async function testDeleteStory() {
  console.log('🗑️  Test 6: Delete Story');
  console.log('-------------------------');
  
  try {
    const response = await makeRequest(
      `${BASE_URL}/api/story/delete?storyId=${TEST_STORY_ID}&userId=${TEST_USER_ID}`,
      { method: 'DELETE' }
    );
    
    if (response.status === 200) {
      console.log('✅ Delete successful!');
      console.log('   Story ID:', response.data.data.storyId);
      console.log('   Deleted from Cloudinary:', response.data.data.deletedFromCloudinary);
      console.log('   Deleted from Database:', response.data.data.deletedFromDatabase);
    } else {
      console.log('❌ Delete failed:', response.data.error);
    }
  } catch (error) {
    console.log('❌ Delete test error:', error.message);
  }
  
  console.log('');
}

// Test 7: Bulk Delete Stories
async function testBulkDeleteStories() {
  console.log('🗑️  Test 7: Bulk Delete Stories');
  console.log('---------------------------------');
  
  try {
    const response = await makeRequest(
      `${BASE_URL}/api/story/delete?userId=${TEST_USER_ID}&deleteExpired=true`,
      { method: 'POST' }
    );
    
    if (response.status === 200) {
      console.log('✅ Bulk delete successful!');
      console.log('   Total stories:', response.data.data.totalStories);
      console.log('   Deleted from Cloudinary:', response.data.data.deletedFromCloudinary);
      console.log('   Deleted from Database:', response.data.data.deletedFromDatabase);
    } else {
      console.log('❌ Bulk delete failed:', response.data.error);
    }
  } catch (error) {
    console.log('❌ Bulk delete test error:', error.message);
  }
  
  console.log('');
}

// Test 8: Error Handling Tests
async function testErrorHandling() {
  console.log('⚠️  Test 8: Error Handling');
  console.log('----------------------------');
  
  // Test invalid user ID
  console.log('Testing invalid user ID...');
  const invalidUserResponse = await makeRequest(
    `${BASE_URL}/api/story/retrieve?userId=invalid-id`
  );
  console.log('   Status:', invalidUserResponse.status);
  console.log('   Error:', invalidUserResponse.data.error);
  
  // Test missing parameters
  console.log('Testing missing parameters...');
  const missingParamsResponse = await makeRequest(
    `${BASE_URL}/api/story/retrieve`
  );
  console.log('   Status:', missingParamsResponse.status);
  console.log('   Error:', missingParamsResponse.data.error);
  
  console.log('');
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Story Media API Tests...\n');
  
  try {
    await testUploadStoryImage();
    await testUploadStoryVideo();
    await testRetrieveUserStories();
    await testRetrieveSpecificStory();
    await testAddStoryView();
    await testDeleteStory();
    await testBulkDeleteStories();
    await testErrorHandling();
    
    console.log('✨ All tests completed!');
  } catch (error) {
    console.error('💥 Test suite failed:', error.message);
  }
}

// Check if running directly
if (require.main === module) {
  // Check if fetch is available (Node 18+)
  if (typeof fetch === 'undefined') {
    console.log('⚠️  Fetch not available. Installing node-fetch...');
    try {
      require('node-fetch');
    } catch (error) {
      console.log('❌ Please install node-fetch: npm install node-fetch');
      process.exit(1);
    }
  }
  
  runAllTests();
}

module.exports = {
  testUploadStoryImage,
  testUploadStoryVideo,
  testRetrieveUserStories,
  testRetrieveSpecificStory,
  testAddStoryView,
  testDeleteStory,
  testBulkDeleteStories,
  testErrorHandling,
  runAllTests
};
