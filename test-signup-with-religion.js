/**
 * Test script for the updated Signup API with Religion Selection
 * This script demonstrates how to use the new signup functionality
 */

const fetch = require('node-fetch');

// Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Test scenarios
async function testSignupWithReligion() {
  console.log('🚀 Testing Signup API with Religion Selection...\n');

  try {
    // Step 1: Get available religions
    console.log('1️⃣ Getting available religions...');
    const religionsResponse = await fetch(`${API_BASE_URL}/religions?format=simple`);
    const religionsData = await religionsResponse.json();
    
    if (religionsData.success) {
      console.log('✅ Religions retrieved successfully!');
      console.log(`   Available religions: ${religionsData.data.religions.length}`);
      religionsData.data.religions.forEach(religion => {
        console.log(`   - ${religion.name} (${religion.id})`);
      });
      console.log('');
    } else {
      console.error('❌ Failed to get religions:', religionsData.message);
      return;
    }

    // Step 2: Test signup with Hinduism
    console.log('2️⃣ Testing signup with Hinduism...');
    const hinduSignupResponse = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: `hindu_${Date.now()}@example.com`,
        password: 'HinduPass123!',
        fullName: 'Hindu Test User',
        religion: 'hinduism'
      })
    });

    const hinduSignupData = await hinduSignupResponse.json();
    console.log('Response:', hinduSignupData);

    if (hinduSignupData.success) {
      console.log('✅ Hindu user signup successful!');
      console.log(`   User ID: ${hinduSignupData.data.user.id}`);
      console.log(`   Religion: ${hinduSignupData.data.user.religion}`);
      console.log(`   Token: ${hinduSignupData.data.token.substring(0, 20)}...\n`);
    } else {
      console.log('❌ Hindu signup failed:', hinduSignupData.message);
      return;
    }

    // Step 3: Test signup with Islam
    console.log('3️⃣ Testing signup with Islam...');
    const islamSignupResponse = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: `islam_${Date.now()}@example.com`,
        password: 'IslamPass123!',
        fullName: 'Islam Test User',
        religion: 'islam'
      })
    });

    const islamSignupData = await islamSignupResponse.json();
    console.log('Response:', islamSignupData);

    if (islamSignupData.success) {
      console.log('✅ Islam user signup successful!');
      console.log(`   User ID: ${islamSignupData.data.user.id}`);
      console.log(`   Religion: ${islamSignupData.data.user.religion}\n`);
    } else {
      console.log('❌ Islam signup failed:', islamSignupData.message);
    }

    // Step 4: Test signup with Buddhism
    console.log('4️⃣ Testing signup with Buddhism...');
    const buddhistSignupResponse = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: `buddhist_${Date.now()}@example.com`,
        password: 'BuddhistPass123!',
        fullName: 'Buddhist Test User',
        religion: 'buddhism'
      })
    });

    const buddhistSignupData = await buddhistSignupResponse.json();
    console.log('Response:', buddhistSignupData);

    if (buddhistSignupData.success) {
      console.log('✅ Buddhist user signup successful!');
      console.log(`   User ID: ${buddhistSignupData.data.user.id}`);
      console.log(`   Religion: ${buddhistSignupData.data.user.religion}\n`);
    } else {
      console.log('❌ Buddhist signup failed:', buddhistSignupData.message);
    }

    // Step 5: Test signup with no religion
    console.log('5️⃣ Testing signup with no religion...');
    const noReligionSignupResponse = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: `atheist_${Date.now()}@example.com`,
        password: 'AtheistPass123!',
        fullName: 'Atheist Test User',
        religion: 'none'
      })
    });

    const noReligionSignupData = await noReligionSignupResponse.json();
    console.log('Response:', noReligionSignupData);

    if (noReligionSignupData.success) {
      console.log('✅ No religion user signup successful!');
      console.log(`   User ID: ${noReligionSignupData.data.user.id}`);
      console.log(`   Religion: ${noReligionSignupData.data.user.religion}\n`);
    } else {
      console.log('❌ No religion signup failed:', noReligionSignupData.message);
    }

    // Step 6: Test signup with custom username
    console.log('6️⃣ Testing signup with custom username...');
    const customUsernameSignupResponse = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: `custom_${Date.now()}@example.com`,
        password: 'CustomPass123!',
        fullName: 'Custom Username User',
        username: 'customuser123',
        religion: 'christianity'
      })
    });

    const customUsernameSignupData = await customUsernameSignupResponse.json();
    console.log('Response:', customUsernameSignupData);

    if (customUsernameSignupData.success) {
      console.log('✅ Custom username signup successful!');
      console.log(`   User ID: ${customUsernameSignupData.data.user.id}`);
      console.log(`   Username: ${customUsernameSignupData.data.user.username}`);
      console.log(`   Religion: ${customUsernameSignupData.data.user.religion}\n`);
    } else {
      console.log('❌ Custom username signup failed:', customUsernameSignupData.message);
    }

    // Step 7: Test error cases
    console.log('7️⃣ Testing error cases...');

    // Test missing religion
    console.log('   Testing missing religion...');
    const missingReligionResponse = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: `error_${Date.now()}@example.com`,
        password: 'ErrorPass123!',
        fullName: 'Error Test User'
        // Missing religion
      })
    });

    const missingReligionData = await missingReligionResponse.json();
    if (!missingReligionData.success) {
      console.log('   ✅ Missing religion correctly rejected:', missingReligionData.message);
    }

    // Test invalid religion
    console.log('   Testing invalid religion...');
    const invalidReligionResponse = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: `error2_${Date.now()}@example.com`,
        password: 'ErrorPass123!',
        fullName: 'Error Test User 2',
        religion: 'invalid_religion'
      })
    });

    const invalidReligionData = await invalidReligionResponse.json();
    if (!invalidReligionData.success) {
      console.log('   ✅ Invalid religion correctly rejected:', invalidReligionData.message);
    }

    // Test weak password
    console.log('   Testing weak password...');
    const weakPasswordResponse = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: `error3_${Date.now()}@example.com`,
        password: '123',
        fullName: 'Error Test User 3',
        religion: 'hinduism'
      })
    });

    const weakPasswordData = await weakPasswordResponse.json();
    if (!weakPasswordData.success) {
      console.log('   ✅ Weak password correctly rejected:', weakPasswordData.message);
    }

    console.log('\n🎉 Signup API with Religion Selection testing completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testSignupWithReligion();
