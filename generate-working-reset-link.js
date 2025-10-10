// Generate Working Reset Link Test
const axios = require('axios');

async function generateWorkingResetLink() {
  console.log('🔗 Generating Working Reset Link...\n');
  
  try {
    const response = await axios.post('http://103.14.120.163:8081/api/auth/forgot-password', {
      email: 'swayam121july@gmail.com'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ API Response:', response.data);
    console.log('📊 Status Code:', response.status);
    
    if (response.data.success) {
      console.log('\n🎉 SUCCESS! Forgot password API is working on server!');
      console.log('📧 Check the server console for the reset link');
      console.log('🔗 The reset link should now point to: http://103.14.120.163:8081/reset-password?token=...');
      console.log('\n💡 You can now:');
      console.log('1. Check the server console for the reset link');
      console.log('2. Use that link to reset the password');
      console.log('3. The link will work because the server is responding');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

generateWorkingResetLink();
