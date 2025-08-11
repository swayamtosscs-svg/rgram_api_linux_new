// Test script for religious reels API endpoints
const API_BASE = 'http://localhost:3000/api';

// Test religious reels endpoints
async function testReligiousReels() {
  console.log('🙏 Testing Religious Reels API...');
  
  try {
    // Test regular religious-reels endpoint
    console.log('\n1. Testing /api/videos/religious-reels endpoint');
    const response1 = await fetch(`${API_BASE}/videos/religious-reels?religion=all&page=1&limit=5`);
    const data1 = await response1.json();
    console.log('✅ Religious Reels Response:', data1);
    
    // Test fetch-religious-reels endpoint (should work after fix)
    console.log('\n2. Testing /api/videos/fetch-religious-reels endpoint');
    const response2 = await fetch(`${API_BASE}/videos/fetch-religious-reels?religion=all&page=1&limit=5`);
    const data2 = await response2.json();
    console.log('✅ Fetch Religious Reels Response:', data2);
    
    // Test [id] endpoint with fetch-religious-reels as ID (should work after fix)
    console.log('\n3. Testing /api/videos/fetch-religious-reels as ID parameter');
    const response3 = await fetch(`${API_BASE}/videos/fetch-religious-reels`);
    const data3 = await response3.json();
    console.log('✅ Videos ID Endpoint Response:', data3);
    
  } catch (error) {
    console.error('❌ Religious Reels Test Error:', error);
  }
}

// Run the test
async function runTests() {
  console.log('🚀 Starting Religious Reels API Tests...\n');
  await testReligiousReels();
  console.log('\n✨ Religious Reels API Tests Completed!');
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  runTests().catch(console.error);
}

module.exports = {
  testReligiousReels
};