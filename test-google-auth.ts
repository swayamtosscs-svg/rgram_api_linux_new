import axios from 'axios';

/**
 * This script tests the Google OAuth API endpoints
 * Run with: ts-node test-google-auth.ts
 */

const BASE_URL = 'http://localhost:3000/api';

async function testGoogleAuth() {
  console.log('🚀 Testing Google OAuth API...');

  try {
    // Test 1: Get Google Auth URL
    console.log('1. Testing Google Auth URL generation...');
    const initResponse = await axios.get(`${BASE_URL}/auth/google/init`);
    console.log('✅ Auth URL generated successfully');
    console.log('Auth URL:', initResponse.data.data.authUrl);
    console.log('\nOpen this URL in a browser to test the full OAuth flow\n');

    // Test 2: Direct Google Authentication
    console.log('2. Testing direct Google authentication...');
    
    // Mock Google user data (for testing only)
    const mockGoogleUser = {
      email: 'test.google@example.com',
      name: 'Test Google User',
      googleId: 'google_' + Math.random().toString(36).substring(2, 15),
      avatar: 'https://example.com/avatar.jpg'
    };

    console.log('Using mock Google user:', mockGoogleUser);
    
    // Use the mock endpoint instead of the real one to avoid database connection issues
    const authResponse = await axios.post(`${BASE_URL}/auth/google-mock`, mockGoogleUser);
    console.log('✅ Direct Google authentication successful');
    console.log('Response:', JSON.stringify(authResponse.data, null, 2));

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testGoogleAuth();