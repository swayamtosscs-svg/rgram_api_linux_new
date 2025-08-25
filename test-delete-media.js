// Test script for delete media API
const testDeleteMedia = async (mediaId) => {
  try {
    const response = await fetch(`http://localhost:3000/api/media/delete?id=${mediaId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.error('Error testing delete API:', error);
  }
};

// Example usage:
// testDeleteMedia('68abed19a28e1fa778af9848');

module.exports = { testDeleteMedia };
