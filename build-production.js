const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting production build...');

// Set environment variables for build
process.env.NODE_ENV = 'production';
process.env.NEXT_TELEMETRY_DISABLED = '1';

// Create a temporary .env.local for build
const envContent = `
# MongoDB Configuration
MONGODB_URI=${process.env.MONGODB_URI || 'mongodb://localhost:27017/api_rgram1'}

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=${process.env.CLOUDINARY_CLOUD_NAME || ''}
CLOUDINARY_API_KEY=${process.env.CLOUDINARY_API_KEY || ''}
CLOUDINARY_API_SECRET=${process.env.CLOUDINARY_API_SECRET || ''}

# Next.js Configuration
NEXT_PUBLIC_APP_URL=${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}
`;

fs.writeFileSync('.env.local', envContent);
console.log('✅ Created .env.local for build');

try {
  // Run the build command
  console.log('📦 Running Next.js build...');
  execSync('npm run build', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  
  console.log('✅ Build completed successfully!');
  
  // Clean up temporary file
  if (fs.existsSync('.env.local')) {
    fs.unlinkSync('.env.local');
    console.log('🧹 Cleaned up temporary files');
  }
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  
  // Clean up temporary file
  if (fs.existsSync('.env.local')) {
    fs.unlinkSync('.env.local');
  }
  
  process.exit(1);
}
