const fs = require('fs');
const path = require('path');

console.log('🔍 Checking DP API Environment Setup...\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  console.log('✅ .env.local file found');
  
  // Read and check environment variables
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  
  console.log('\n📋 Environment Variables:');
  envVars.forEach(line => {
    const [key] = line.split('=');
    if (key) {
      console.log(`  ${key.trim()}`);
    }
  });
  
  // Check specific required variables
  const requiredVars = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY', 
    'CLOUDINARY_API_SECRET',
    'MONGODB_URI'
  ];
  
  console.log('\n🔑 Required Variables Check:');
  requiredVars.forEach(varName => {
    if (envContent.includes(varName)) {
      console.log(`  ✅ ${varName} - Found`);
    } else {
      console.log(`  ❌ ${varName} - Missing`);
    }
  });
  
} else {
  console.log('❌ .env.local file not found');
  console.log('Please create .env.local file with required environment variables');
}

// Check package.json for dependencies
console.log('\n📦 Checking Dependencies:');
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  const requiredDeps = ['cloudinary', 'mongoose', 'next'];
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
      console.log(`  ✅ ${dep} - Installed`);
    } else {
      console.log(`  ❌ ${dep} - Missing`);
    }
  });
} else {
  console.log('❌ package.json not found');
}

// Check if utils/cloudinary.ts exists
const cloudinaryPath = path.join(__dirname, 'utils', 'cloudinary.ts');
if (fs.existsSync(cloudinaryPath)) {
  console.log('\n✅ Cloudinary utility file found');
} else {
  console.log('\n❌ Cloudinary utility file missing');
}

// Check if lib/database.ts exists
const dbPath = path.join(__dirname, 'lib', 'database.ts');
if (fs.existsSync(dbPath)) {
  console.log('✅ Database utility file found');
} else {
  console.log('❌ Database utility file missing');
}

console.log('\n🚀 Next Steps:');
console.log('1. Ensure all environment variables are set in .env.local');
console.log('2. Install missing dependencies: npm install');
console.log('3. Test the API endpoint: GET /api/dp/test');
console.log('4. Check server logs for detailed error messages');
console.log('5. Verify MongoDB connection and Cloudinary credentials');
