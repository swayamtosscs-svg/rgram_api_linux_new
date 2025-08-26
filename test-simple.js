const fs = require('fs');
const path = require('path');

console.log('🔍 Simple DP API Test...\n');

// Check if required files exist
const requiredFiles = [
  'utils/cloudinary.ts',
  'lib/database.ts',
  'lib/models/User.ts',
  'app/api/dp/upload/route.ts',
  'app/api/dp/retrieve/route.ts',
  'app/api/dp/delete/route.ts',
  'app/api/dp/replace/route.ts'
];

console.log('📁 Checking required files:');
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
  }
});

// Check environment file
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  console.log('\n✅ .env.local file found');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'MONGODB_URI'
  ];
  
  console.log('\n🔑 Environment variables:');
  requiredVars.forEach(varName => {
    if (envContent.includes(varName)) {
      console.log(`  ✅ ${varName}`);
    } else {
      console.log(`  ❌ ${varName} - MISSING`);
    }
  });
} else {
  console.log('\n❌ .env.local file not found');
  console.log('Please create .env.local with required environment variables');
}

console.log('\n🚀 Next steps:');
console.log('1. Ensure all files exist (check ❌ marks above)');
console.log('2. Create .env.local with required variables');
console.log('3. Restart your Next.js server');
console.log('4. Test with: http://localhost:3000/dp-debug.html');
console.log('5. Check server console for detailed logs');
