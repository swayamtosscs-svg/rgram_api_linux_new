/**
 * Script to test the authentication and logout functionality
 */

const fetch = require('node-fetch');

// Configuration
const API_BASE_URL = 'http://localhost:3001/api';

// Test user credentials
const testUser = {
  email: 'test@example.com',
  password: 'password123'
};

async function testAuthFlow() {
  console.log('Starting authentication flow test...');
  
  try {
    // Step 1: Login
    console.log('\n1. Testing login...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (!loginData.success) {
      console.error('Login failed:', loginData.message);
      return;
    }
    
    const token = loginData.data.token;
    console.log('Login successful, received token');
    
    // Step 2: Test authenticated endpoint
    console.log('\n2. Testing authenticated endpoint...');
    const userResponse = await fetch(`${API_BASE_URL}/auth/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const userData = await userResponse.json();
    console.log('User data response:', userData);
    
    // Step 3: Logout
    console.log('\n3. Testing logout...');
    const logoutResponse = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const logoutData = await logoutResponse.json();
    console.log('Logout response:', logoutData);
    
    // Step 4: Test authenticated endpoint after logout (should fail)
    console.log('\n4. Testing authenticated endpoint after logout (should fail)...');
    const afterLogoutResponse = await fetch(`${API_BASE_URL}/auth/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const afterLogoutData = await afterLogoutResponse.json();
    console.log('After logout response:', afterLogoutData);
    
    if (!afterLogoutData.success) {
      console.log('✅ Test passed: Token was properly invalidated');
    } else {
      console.log('❌ Test failed: Token is still valid after logout');
    }
    
  } catch (error) {
    console.error('Error during test:', error);
  }
}

// Run the test
testAuthFlow();