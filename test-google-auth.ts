import axios from 'axios';

const API_BASE = 'http://localhost:3000';

async function testGoogleOAuth() {
  try {
    console.log('🧪 Testing Google OAuth fixes...\n');

    // 1. Test cleanup of undefined users
    console.log('1️⃣ Cleaning up users with undefined names...');
    try {
      const cleanupResponse = await axios.post(`${API_BASE}/api/auth/cleanup-undefined-users`);
      console.log('✅ Cleanup completed:', cleanupResponse.data);
    } catch (error: any) {
      console.log('❌ Cleanup failed:', error.response?.data || error.message);
    }

    // 2. Test Google OAuth initialization
    console.log('\n2️⃣ Testing Google OAuth initialization...');
    try {
      const initResponse = await axios.get(`${API_BASE}/api/auth/google/init`);
      console.log('✅ OAuth init successful:', initResponse.data);
    } catch (error: any) {
      console.log('❌ OAuth init failed:', error.response?.data || error.message);
    }

    // 3. Test mock Google OAuth callback
    console.log('\n3️⃣ Testing mock Google OAuth callback...');
    try {
      const callbackResponse = await axios.get(`${API_BASE}/api/auth/google/callback?test=true&format=json`);
      console.log('✅ Mock callback successful:', callbackResponse.data);
    } catch (error: any) {
      console.log('❌ Mock callback failed:', error.response?.data || error.message);
    }

    // 4. Test Google OAuth endpoint with mock data
    console.log('\n4️⃣ Testing Google OAuth endpoint with mock data...');
    try {
      const mockUserData = {
        email: 'test.user@example.com',
        name: 'Test User',
        googleId: 'test_google_id_123',
        avatar: 'https://via.placeholder.com/150'
      };

      const authResponse = await axios.post(`${API_BASE}/api/auth/google`, mockUserData);
      console.log('✅ Google auth successful:', authResponse.data);
    } catch (error: any) {
      console.log('❌ Google auth failed:', error.response?.data || error.message);
    }

    console.log('\n🎉 Google OAuth testing completed!');

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testGoogleOAuth();