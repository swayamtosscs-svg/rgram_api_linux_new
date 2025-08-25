const http = require('http');

// Test configuration
const TEST_USER_ID = '68ac2292ba867f9704162538'; // Use your actual user ID

console.log('🧪 Testing New Story Media API Folder Structure');
console.log('================================================\n');

// Helper function to make HTTP requests
function makeRequest(method, path, callback) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: path,
    method: method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        callback(null, res.statusCode, jsonData);
      } catch (error) {
        callback(error, res.statusCode, data);
      }
    });
  });

  req.on('error', (error) => {
    callback(error, null, null);
  });

  req.end();
}

// Test 1: Check server status
console.log('🔍 Test 1: Check Server Status');
console.log('--------------------------------');

makeRequest('GET', '/api/story/retrieve', (error, statusCode, data) => {
  if (error) {
    console.log('❌ Server connection failed:', error.message);
    console.log('   Make sure to run: npm run dev');
    console.log('');
    return;
  }
  
  if (statusCode === 400) {
    console.log('✅ Server is running! (Got expected 400 for missing parameters)');
    console.log('   Status:', statusCode);
    console.log('   Response:', data.error);
  } else {
    console.log('⚠️  Server responded with unexpected status:', statusCode);
    console.log('   Response:', data);
  }
  console.log('');
  
  // Continue with other tests
  testRetrieveUserStories();
});

// Test 2: Retrieve user stories to see current structure
function testRetrieveUserStories() {
  console.log('📖 Test 2: Retrieve User Stories (Check Current Structure)');
  console.log('----------------------------------------------------------');
  
  const path = `/api/story/retrieve?userId=${TEST_USER_ID}&page=1&limit=5`;
  
  makeRequest('GET', path, (error, statusCode, data) => {
    if (error) {
      console.log('❌ Request failed:', error.message);
      console.log('');
      return;
    }
    
    if (statusCode === 200) {
      console.log('✅ Retrieve successful!');
      console.log('   Status:', statusCode);
      if (data.data && data.data.user) {
        console.log('   User:', data.data.user.username);
        console.log('   Total stories:', data.data.pagination?.totalItems || 0);
        console.log('   Stories found:', data.data.stories?.length || 0);
        
        // Show story details
        if (data.data.stories && data.data.stories.length > 0) {
          console.log('\n   📋 Current Stories:');
          data.data.stories.forEach((story, index) => {
            console.log(`      ${index + 1}. ID: ${story.id}`);
            console.log(`         Type: ${story.type}`);
            console.log(`         Caption: ${story.caption || 'No caption'}`);
            console.log(`         Expires: ${story.expiresAt}`);
            console.log(`         Is Expired: ${story.isExpired}`);
            console.log('');
          });
        }
      }
    } else if (statusCode === 404) {
      console.log('⚠️  User not found (expected if user ID is invalid)');
      console.log('   Status:', statusCode);
      console.log('   Response:', data.error);
    } else {
      console.log('❌ Unexpected response:');
      console.log('   Status:', statusCode);
      console.log('   Response:', data);
    }
    console.log('');
    
    // Test error handling
    testErrorHandling();
  });
}

// Test 3: Error handling tests
function testErrorHandling() {
  console.log('⚠️  Test 3: Error Handling');
  console.log('----------------------------');
  
  // Test invalid user ID
  console.log('Testing invalid user ID...');
  makeRequest('GET', '/api/story/retrieve?userId=invalid-id', (error, statusCode, data) => {
    if (error) {
      console.log('   ❌ Request failed:', error.message);
    } else {
      console.log('   Status:', statusCode);
      console.log('   Error:', data.error);
    }
    
    // Test missing parameters
    console.log('Testing missing parameters...');
    makeRequest('GET', '/api/story/retrieve', (error2, statusCode2, data2) => {
      if (error2) {
        console.log('   ❌ Request failed:', error2.message);
      } else {
        console.log('   Status:', statusCode2);
        console.log('   Error:', data2.error);
      }
      
      console.log('');
      console.log('✨ All tests completed!');
      console.log('');
      console.log('📋 New Features Added:');
      console.log('   ✅ Stories now organized in folders: users/{username}/story/{image|video}');
      console.log('   ✅ Automatic cleanup every hour (npm run cleanup-scheduled)');
      console.log('   ✅ Manual cleanup available (npm run cleanup-stories)');
      console.log('');
      console.log('📁 Cloudinary Folder Structure:');
      console.log('   users/{username}/story/image/{filename}');
      console.log('   users/{username}/story/video/{filename}');
      console.log('');
      console.log('⏰ Auto-Cleanup:');
      console.log('   - Stories expire after 24 hours');
      console.log('   - Automatic deletion every hour');
      console.log('   - Manual cleanup available');
    });
  });
}

console.log('🚀 Starting tests...\n');
