// Simple test for delete media API
const testDeleteAPI = async () => {
  try {
    console.log('🧪 Testing DELETE /api/media/delete endpoint...');
    
    const response = await fetch('http://localhost:3000/api/media/delete?id=test123', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const result = await response.json();
    console.log('📋 Response Body:', JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.error('❌ Error testing delete API:', error.message);
    return null;
  }
};

// Test the API
testDeleteAPI().then(result => {
  if (result) {
    console.log('✅ Test completed successfully');
  } else {
    console.log('❌ Test failed');
  }
});

module.exports = { testDeleteAPI };
