#!/usr/bin/env node

const axios = require('axios');

async function getSuperAdminToken() {
  try {
    console.log('🔑 Getting Super Admin Bearer Token...\n');

    const loginData = {
      email: 'admin@rgram.com',
      password: 'SuperAdmin123!'
    };

    console.log('📋 Login Details:');
    console.log(`Email: ${loginData.email}`);
    console.log(`Password: ${loginData.password}\n`);

    const response = await axios.post('http://localhost:3000/api/auth/login', loginData);

    if (response.data.success) {
      console.log('✅ LOGIN SUCCESSFUL!');
      console.log('\n📋 Super Admin Details:');
      console.log(`Username: ${response.data.data.user.username}`);
      console.log(`Email: ${response.data.data.user.email}`);
      console.log(`Full Name: ${response.data.data.user.fullName}`);
      console.log(`Role: ${response.data.data.user.role}`);
      console.log(`ID: ${response.data.data.user.id}`);
      
      console.log('\n🔑 BEARER TOKEN:');
      console.log('='.repeat(80));
      console.log(response.data.data.token);
      console.log('='.repeat(80));
      
      console.log('\n📝 Usage Examples:');
      console.log('1. Postman/API Testing:');
      console.log('   Authorization: Bearer ' + response.data.data.token);
      
      console.log('\n2. cURL Command:');
      console.log('   curl -H "Authorization: Bearer ' + response.data.data.token + '" http://localhost:3000/api/admin/dashboard/stats');
      
      console.log('\n3. JavaScript/Axios:');
      console.log('   headers: { "Authorization": "Bearer ' + response.data.data.token + '" }');
      
      console.log('\n4. Full Authorization Header:');
      console.log('   Authorization: Bearer ' + response.data.data.token);
      
      console.log('\n⚠️  Keep this token secure! It provides full admin access.');
      console.log('🔗 Token expires based on your JWT configuration.');
      
    } else {
      console.log('❌ Login failed:', response.data.message);
    }

  } catch (error) {
    console.log('❌ Login failed:', error.response?.data?.message || error.message);
    console.log('\n💡 Make sure the server is running on http://localhost:3000');
  }
}

getSuperAdminToken();
