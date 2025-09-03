const axios = require('axios');

// Configuration
const BASE_URL = 'https://api-rgram1.vercel.app';
const VALID_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGFlYjcxNTg3NjkxYmMxNjA0OTJiZDgiLCJpYXQiOjE3NTY4OTIzMjQsImV4cCI6MTc1OTQ4NDMyNH0.Feb3YRlfhw5ZbxNAU2wPC-TSVkh024wOVSsY363LbYc';
const USER_ID = '68aeb71587691bc160492bd8';

// User who has posts (from the debug output)
const USER_WITH_POSTS_ID = '68b53b03f09b98a6dcded481'; // This is the "dfg" user who has posts

async function followUserWithPosts() {
  console.log('🔧 Following a user who has posts...\n');

  try {
    // Step 1: Follow the user who has posts
    console.log('📝 Step 1: Following user with posts...');
    const followResponse = await axios.post(`${BASE_URL}/api/follow/${USER_WITH_POSTS_ID}`, {}, {
      headers: {
        'Authorization': `Bearer ${VALID_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Follow Response:', JSON.stringify(followResponse.data, null, 2));

    // Step 2: Wait a moment for the follow to be processed
    console.log('\n⏳ Waiting 2 seconds for follow to be processed...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 3: Test the followed users posts API again
    console.log('\n📝 Step 2: Testing followed users posts API...');
    const postsResponse = await axios.get(`${BASE_URL}/api/posts/followed-users`, {
      headers: {
        'Authorization': `Bearer ${VALID_TOKEN}`,
        'Content-Type': 'application/json'
      },
      params: {
        page: 1,
        limit: 10
      }
    });

    console.log('✅ Posts Response:', JSON.stringify(postsResponse.data, null, 2));

    if (postsResponse.data.data.posts.length > 0) {
      console.log('\n🎉 SUCCESS! You now have posts from followed users!');
      console.log(`📊 Found ${postsResponse.data.data.posts.length} posts`);
      
      // Show details of the posts
      postsResponse.data.data.posts.forEach((post, index) => {
        console.log(`\nPost ${index + 1}:`);
        console.log(`- Author: ${post.author.username} (${post.author.fullName})`);
        console.log(`- Content: ${post.content}`);
        console.log(`- Images: ${post.images?.length || 0}`);
        console.log(`- Videos: ${post.videos?.length || 0}`);
        console.log(`- Likes: ${post.likesCount}`);
        console.log(`- Comments: ${post.commentsCount}`);
        console.log(`- Created: ${new Date(post.createdAt).toLocaleString()}`);
      });
    } else {
      console.log('\n⚠️ Still no posts found. This could mean:');
      console.log('   - The follow request is pending (user has private account)');
      console.log('   - The follow was not successful');
      console.log('   - There was an error in the follow process');
    }

  } catch (error) {
    console.error('❌ Follow failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the follow
if (require.main === module) {
  console.log('🚀 Following user with posts...');
  console.log('👤 Current User: arjun (ID: 68aeb71587691bc160492bd8)');
  console.log('👤 Following User: dfg (ID: 68b53b03f09b98a6dcded481)');
  console.log('📊 This user has 5 posts in the system\n');
  
  followUserWithPosts();
}

module.exports = { followUserWithPosts };
