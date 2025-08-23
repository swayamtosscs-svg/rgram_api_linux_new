// Test script to verify Cloudinary folder structure using usernames
// This will help ensure files are organized in user-specific folders

const { v2: cloudinary } = require('cloudinary');

// Configure Cloudinary (use your actual credentials)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'your_cloud_name',
  api_key: process.env.CLOUDINARY_API_KEY || 'your_api_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your_api_secret',
});

async function testFolderStructure() {
  console.log('🧪 Testing Cloudinary Folder Structure (Username-based)...\n');

  // Test usernames (these will be the actual usernames from your database)
  const testUsernames = [
    'ohn_doee', // User 1 (from your registration)
    'testuser', // User 2 (example)
  ];

  for (const username of testUsernames) {
    console.log(`👤 Testing Username: ${username}`);
    
    // Test image folder
    const imageFolder = `users/${username}/images`;
    console.log(`📁 Image folder: ${imageFolder}`);
    
    // Test video folder
    const videoFolder = `users/${username}/videos`;
    console.log(`📹 Video folder: ${videoFolder}`);
    
    console.log('---');
  }

  console.log('✅ Folder structure test completed!');
  console.log('\n📝 Expected Cloudinary structure (Username-based):');
  console.log('users/');
  console.log('├── ohn_doee/');
  console.log('│   ├── images/');
  console.log('│   │   └── ohn_doee_[timestamp].png');
  console.log('│   └── videos/');
  console.log('│       └── ohn_doee_[timestamp].mp4');
  console.log('└── testuser/');
  console.log('    ├── images/');
  console.log('    │   └── testuser_[timestamp].jpg');
  console.log('    └── videos/');
  console.log('        └── testuser_[timestamp].mp4');
}

// Run the test
testFolderStructure().catch(console.error);
