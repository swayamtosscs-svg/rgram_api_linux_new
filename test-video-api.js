// Test Video API endpoints
const API_BASE = 'http://localhost:3000/api';

// Test video upload
async function testVideoUpload() {
  console.log('🎬 Testing Video Upload API...');
  
  try {
    const response = await fetch(`${API_BASE}/upload/video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with actual token
      },
      body: JSON.stringify({
        content: 'This is a test video post',
        video: 'data:video/mp4;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT...', // Base64 video data
        thumbnail: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=', // Base64 thumbnail
        title: 'Test Video Title',
        description: 'This is a test video description',
        duration: 120, // 2 minutes in seconds
        category: 'entertainment'
      })
    });

    const data = await response.json();
    console.log('✅ Video Upload Response:', data);
    return data.data?.post?._id;
  } catch (error) {
    console.error('❌ Video Upload Error:', error);
  }
}

// Test video feed
async function testVideoFeed() {
  console.log('\n📺 Testing Video Feed API...');
  
  try {
    const response = await fetch(`${API_BASE}/feed/videos?page=1&limit=5`);
    const data = await response.json();
    console.log('✅ Video Feed Response:', data);
  } catch (error) {
    console.error('❌ Video Feed Error:', error);
  }
}

// Test video categories
async function testVideoCategories() {
  console.log('\n📂 Testing Video Categories API...');
  
  try {
    const response = await fetch(`${API_BASE}/videos/categories`);
    const data = await response.json();
    console.log('✅ Video Categories Response:', data);
  } catch (error) {
    console.error('❌ Video Categories Error:', error);
  }
}

// Test video details
async function testVideoDetails(videoId) {
  if (!videoId) {
    console.log('\n⚠️  Skipping video details test - no video ID available');
    return;
  }
  
  console.log('\n🎥 Testing Video Details API...');
  
  try {
    const response = await fetch(`${API_BASE}/videos/${videoId}`);
    const data = await response.json();
    console.log('✅ Video Details Response:', data);
  } catch (error) {
    console.error('❌ Video Details Error:', error);
  }
}

// Test religion videos
async function testReligionVideos() {
  console.log('\n🙏 Testing Religion Videos API...');
  
  try {
    const response = await fetch(`${API_BASE}/videos/religion?religion=Islam&page=1&limit=5`);
    const data = await response.json();
    console.log('✅ Religion Videos Response:', data);
  } catch (error) {
    console.error('❌ Religion Videos Error:', error);
  }
}

// Test add video links
async function testAddVideoLinks() {
  console.log('\n🔗 Testing Add Video Links API...');
  
  try {
    const response = await fetch(`${API_BASE}/videos/add-links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with actual token
      },
      body: JSON.stringify({
        links: [
          'https://youtube.com/shorts/wRBtJzi2n6I?si=Qfgi-eFWu01fdiz5',
          'https://youtube.com/shorts/xmGz85ST7Qk?si=0DwCnvwLtdN7J6VY'
        ],
        title: 'Islamic Videos Collection',
        description: 'A collection of Islamic videos',
        category: 'education',
        religion: 'Islam'
      })
    });

    const data = await response.json();
    console.log('✅ Add Video Links Response:', data);
  } catch (error) {
    console.error('❌ Add Video Links Error:', error);
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Video API Tests...\n');
  
  const videoId = await testVideoUpload();
  await testVideoFeed();
  await testVideoCategories();
  await testVideoDetails(videoId);
  await testReligionVideos();
  await testAddVideoLinks();
  
  console.log('\n✨ Video API Tests Completed!');
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  runTests().catch(console.error);
}

module.exports = {
  testVideoUpload,
  testVideoFeed,
  testVideoCategories,
  testVideoDetails,
  testReligionVideos,
  testAddVideoLinks
};
