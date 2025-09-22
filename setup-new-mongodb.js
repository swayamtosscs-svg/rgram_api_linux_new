const fs = require('fs');
const path = require('path');

// New MongoDB URI
const NEW_MONGODB_URI = 'mongodb://localhost:27018/admin';

console.log('🔧 Setting up new MongoDB connection...');
console.log('📋 New MongoDB URI:', NEW_MONGODB_URI);

// Function to create or update .env file
function createEnvFile() {
  const envContent = `# R-GRAM API Environment Variables
# Updated MongoDB Configuration

# Database Configuration - New Local MongoDB
MONGODB_URI=${NEW_MONGODB_URI}

# Email Configuration (Gmail Example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_gmail@gmail.com

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here

# JWT Configuration
JWT_SECRET=rgram_jwt_secret_key_2024_secure_random_string_12345

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
APP_NAME=R-GRAM
NODE_ENV=development

# OTP Configuration
OTP_EXPIRE_MINUTES=10

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
`;

  try {
    // Try to create .env.local first
    fs.writeFileSync('.env.local', envContent);
    console.log('✅ Created .env.local file with new MongoDB URI');
    return true;
  } catch (error) {
    try {
      // If .env.local fails, try .env
      fs.writeFileSync('.env', envContent);
      console.log('✅ Created .env file with new MongoDB URI');
      return true;
    } catch (error2) {
      console.error('❌ Failed to create environment file:', error2.message);
      console.log('\n🔧 Manual setup required:');
      console.log('1. Create a .env.local or .env file');
      console.log('2. Add this line: MONGODB_URI=' + NEW_MONGODB_URI);
      return false;
    }
  }
}

// Function to update existing environment files
function updateExistingEnvFiles() {
  const envFiles = ['.env.local', '.env'];
  let updated = false;

  for (const envFile of envFiles) {
    if (fs.existsSync(envFile)) {
      try {
        let content = fs.readFileSync(envFile, 'utf8');
        
        // Update MONGODB_URI if it exists
        if (content.includes('MONGODB_URI=')) {
          content = content.replace(/MONGODB_URI=.*/, `MONGODB_URI=${NEW_MONGODB_URI}`);
          fs.writeFileSync(envFile, content);
          console.log(`✅ Updated ${envFile} with new MongoDB URI`);
          updated = true;
        } else {
          // Add MONGODB_URI if it doesn't exist
          content += `\n# Database Configuration\nMONGODB_URI=${NEW_MONGODB_URI}\n`;
          fs.writeFileSync(envFile, content);
          console.log(`✅ Added MongoDB URI to ${envFile}`);
          updated = true;
        }
      } catch (error) {
        console.error(`❌ Failed to update ${envFile}:`, error.message);
      }
    }
  }

  return updated;
}

// Main setup function
async function setupNewMongoDB() {
  console.log('🚀 Starting MongoDB setup...');
  
  // Check if environment files exist
  const envExists = fs.existsSync('.env.local') || fs.existsSync('.env');
  
  if (envExists) {
    console.log('📋 Found existing environment files, updating...');
    const updated = updateExistingEnvFiles();
    if (!updated) {
      console.log('⚠️  Could not update existing files, creating new one...');
      createEnvFile();
    }
  } else {
    console.log('📋 No environment files found, creating new one...');
    createEnvFile();
  }
  
  console.log('\n🔍 Testing the new MongoDB connection...');
  
  // Set environment variable for testing
  process.env.MONGODB_URI = NEW_MONGODB_URI;
  
  // Import and run the test
  try {
    const { execSync } = require('child_process');
    execSync('node test-new-mongodb-connection.js', { stdio: 'inherit' });
    console.log('\n🎉 MongoDB setup completed successfully!');
  } catch (error) {
    console.log('\n⚠️  MongoDB setup completed, but connection test failed.');
    console.log('Please run: node test-new-mongodb-connection.js');
  }
}

// Run the setup
setupNewMongoDB().catch(error => {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
});

