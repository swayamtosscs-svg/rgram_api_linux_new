const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function debugVideoAPI() {
  try {
    console.log('🔍 Debugging Video API...\n');

    // First create a page
    const createPageResponse = await fetch('http://localhost:3000/api/baba-pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Debug Test ' + Date.now(),
        description: 'Debug test page'
      })
    });
    const pageData = await createPageResponse.json();
    console.log('Page created:', pageData.success);
    
    if (!pageData.success) {
      console.log('Failed to create page:', pageData.message);
      return;
    }

    const pageId = pageData.data.id;
    console.log('Page ID:', pageId);

    // Now try to create a video
    console.log('\nCreating video...');
    const createVideoResponse = await fetch(`http://localhost:3000/api/baba-pages/${pageId}/videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test Video',
        description: 'Test video description',
        category: 'video'
      })
    });

    console.log('Video response status:', createVideoResponse.status);
    const videoData = await createVideoResponse.json();
    console.log('Video response:', JSON.stringify(videoData, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugVideoAPI();
