#!/usr/bin/env node

/**
 * Super Admin Creation Script
 * This script helps create the first super admin for the system
 */

const readline = require('readline');
const axios = require('axios');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔐 Super Admin Creation Script');
console.log('=============================\n');

// Get user input
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function createSuperAdmin() {
  try {
    console.log('Please provide the following information:\n');

    const username = await askQuestion('Username: ');
    const email = await askQuestion('Email: ');
    const fullName = await askQuestion('Full Name: ');
    const password = await askQuestion('Password: ');
    const secretKey = await askQuestion('Secret Key (from environment): ');

    console.log('\n🚀 Creating super admin...\n');

    const response = await axios.post('http://localhost:3000/api/admin/create-super-admin', {
      username,
      email,
      password,
      fullName,
      secretKey
    });

    if (response.data.success) {
      console.log('✅ Super admin created successfully!');
      console.log('\n📋 Admin Details:');
      console.log(`Username: ${response.data.data.user.username}`);
      console.log(`Email: ${response.data.data.user.email}`);
      console.log(`Full Name: ${response.data.data.user.fullName}`);
      console.log(`Role: Super Admin`);
      console.log('\n🔑 You can now login with these credentials');
      console.log('⚠️  Please keep these credentials secure!');
    } else {
      console.log('❌ Failed to create super admin:', response.data.message);
    }

  } catch (error) {
    if (error.response) {
      console.log('❌ Error:', error.response.data.message);
    } else {
      console.log('❌ Error:', error.message);
    }
  } finally {
    rl.close();
  }
}

// Check if server is running
async function checkServer() {
  try {
    // Try a simple health check endpoint or just check if server responds
    await axios.get('http://localhost:3000/api/debug-env');
    return true;
  } catch (error) {
    // If debug-env doesn't exist, try the create-super-admin with POST (which will fail but server is running)
    try {
      await axios.post('http://localhost:3000/api/admin/create-super-admin', {});
      return true;
    } catch (postError) {
      // If we get a response (even error), server is running
      return postError.response !== undefined;
    }
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
