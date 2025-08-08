const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testOTP() {
  try {
    console.log('🧪 Testing OTP functionality...\n');

    // Test 1: Send OTP to phone
    console.log('1️⃣ Sending OTP to phone...');
    const sendResponse = await axios.post(`${BASE_URL}/test-otp`, {
      phone: '9555363996'
    });
    
    console.log('✅ Send Response:', JSON.stringify(sendResponse.data, null, 2));
    
    if (sendResponse.data.success && sendResponse.data.data.otp) {
      const otpCode = sendResponse.data.data.otp;
      console.log(`\n📱 OTP Code: ${otpCode}\n`);
      
      // Test 2: Verify OTP
      console.log('2️⃣ Verifying OTP...');
      const verifyResponse = await axios.post(`${BASE_URL}/auth/verify-otp`, {
        phone: '9555363996',
        phoneCode: otpCode,
        purpose: 'login'
      });
      
      console.log('✅ Verify Response:', JSON.stringify(verifyResponse.data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testOTP();
