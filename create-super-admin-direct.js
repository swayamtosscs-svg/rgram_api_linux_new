#!/usr/bin/env node

/**
 * Direct Super Admin Creation Script
 * Creates a super admin without interactive input
 */

const axios = require('axios');

async function createSuperAdmin() {
  try {
    console.log('🔐 Creating Super Admin...\n');

    // Super admin details
    const adminData = {
      username: 'superadmin',
      email: 'admin@rgram.com',
      password: 'SuperAdmin123!',
      fullName: 'Super Administrator',
      secretKey: 'SuperAdminSecretKey2024!@'
    };

    console.log('📋 Admin Details:');
    console.log(`Username: ${adminData.username}`);
    console.log(`Email: ${adminData.email}`);
    console.log(`Full Name: ${adminData.fullName}`);
    console.log(`Password: ${adminData.password}`);
    console.log('');

    const response = await axios.post('http://localhost:3000/api/admin/create-super-admin', adminData);

    if (response.data.success) {
      console.log('✅ Super admin created successfully!');
      console.log('\n📋 Created Admin Details:');
      console.log(`Username: ${response.data.data.user.username}`);
      console.log(`Email: ${response.data.data.user.email}`);
      console.log(`Full Name: ${response.data.data.user.fullName}`);
      console.log(`Role: Super Admin`);
      console.log('\n🔑 Login Credentials:');
      console.log(`Username: ${adminData.username}`);
      console.log(`Password: ${adminData.password}`);
      console.log('\n⚠️  Please keep these credentials secure!');
      console.log('🔗 You can now login at: http://localhost:3000/api/auth/login');
    } else {
      console.log('❌ Failed to create super admin:', response.data.message);
    }

  } catch (error) {
    if (error.response) {
      console.log('❌ Error:', error.response.data.message);
      if (error.response.data.message === 'Super admin already exists') {
        console.log('ℹ️  A super admin already exists in the system.');
      }
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.post('http://localhost:3000/api/admin/create-super-admin', {});
    return true;
  } catch (error) {
    return error.response !== undefined;
  }
}

async function main() {
  console.log('🔍 Checking if server is running...');
  
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Server is not running on http://localhost:3000');
    console.log('Please start your Next.js server first:');
    console.log('npm run dev');
    process.exit(1);
  }

  console.log('✅ Server is running\n');
  
  await createSuperAdmin();
}

main();
