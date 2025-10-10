const fs = require('fs').promises;
const path = require('path');

// Environment template for local MongoDB setup
const ENV_TEMPLATE = `# Local MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/api_rgram

# Atlas MongoDB (for migration source)
ATLAS_MONGODB_URI=mongodb+srv://tossitswayam:Qwert123%23%24@cluster0.tpk0nle.mongodb.net/api_rgram?retryWrites=true&w=majority

# Cloudinary Configuration (if needed)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Next.js Configuration
NEXTAUTH_SECRET=your_random_secret_key_here
NEXTAUTH_URL=http://localhost:3000

# Development Configuration
NODE_ENV=development
PORT=3000
`;

// Package.json dependencies check
const REQUIRED_DEPENDENCIES = [
  'mongoose',
  'uuid',
  'fs',
  'path',
  'https',
  'http'
];

async function createEnvFile() {
  try {
    const envPath = path.join(__dirname, '.env.local');
    
    // Check if .env.local already exists
    try {
      await fs.access(envPath);
      console.log('⚠️ .env.local already exists');
      
      const response = await askQuestion('Do you want to overwrite it? (y/n): ');
      if (response.toLowerCase() !== 'y') {
        console.log('✅ Keeping existing .env.local file');
        return;
      }
    } catch (error) {
      // File doesn't exist, create it
    }
    
    await fs.writeFile(envPath, ENV_TEMPLATE);
    console.log('✅ Created .env.local file');
    console.log('📝 Please update the MongoDB URIs and other configurations as needed');
    
  } catch (error) {
    console.error('❌ Error creating .env.local:', error);
    throw error;
  }
}

async function checkDependencies() {
  try {
    const packageJsonPath = path.join(__dirname, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
    
    const missingDeps = [];
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    for (const dep of REQUIRED_DEPENDENCIES) {
      if (!allDeps[dep]) {
        missingDeps.push(dep);
      }
    }
    
    if (missingDeps.length > 0) {
      console.log('⚠️ Missing dependencies:', missingDeps.join(', '));
      console.log('📦 Please install them with: npm install ' + missingDeps.join(' '));
      return false;
    }
    
    console.log('✅ All required dependencies are installed');
    return true;
    
  } catch (error) {
    console.error('❌ Error checking dependencies:', error);
    return false;
  }
}

async function createDirectories() {
  try {
    const directories = [
      'public/assets',
      'public/assets/users',
      'public/assets/babas',
      'public/assets/posts',
      'public/assets/videos',
      'public/assets/stories',
      'public/assets/thumbnails',
      'public/assets/images'
    ];
    
    for (const dir of directories) {
      const fullPath = path.join(__dirname, dir);
      await fs.mkdir(fullPath, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
    
    console.log('✅ All directories created successfully');
    
  } catch (error) {
    console.error('❌ Error creating directories:', error);
    throw error;
  }
}

async function createGitignore() {
  try {
    const gitignorePath = path.join(__dirname, '.gitignore');
    
    // Check if .gitignore exists
    let existingContent = '';
    try {
      existingContent = await fs.readFile(gitignorePath, 'utf8');
    } catch (error) {
      // File doesn't exist
    }
    
    const gitignoreAdditions = `
# Local MongoDB and Media Files
.env.local
public/assets/
*.log
node_modules/
.next/
out/
build/
dist/
`;

    // Only add if not already present
    if (!existingContent.includes('public/assets/')) {
      await fs.writeFile(gitignorePath, existingContent + gitignoreAdditions);
      console.log('✅ Updated .gitignore to exclude media files');
    } else {
      console.log('✅ .gitignore already configured');
    }
    
  } catch (error) {
    console.error('❌ Error updating .gitignore:', error);
  }
}

async function askQuestion(question) {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  try {
    console.log('🚀 Setting up Local MongoDB Environment...\n');
    
    // Check dependencies
    console.log('📦 Checking dependencies...');
    const depsOk = await checkDependencies();
    if (!depsOk) {
      console.log('❌ Please install missing dependencies first');
      return;
    }
    
    // Create environment file
    console.log('\n📝 Creating environment file...');
    await createEnvFile();
    
    // Create directories
    console.log('\n📁 Creating directory structure...');
    await createDirectories();
    
    // Update gitignore
    console.log('\n🔒 Updating .gitignore...');
    await createGitignore();
    
    console.log('\n🎉 Setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Update .env.local with your MongoDB credentials');
    console.log('2. Start MongoDB locally: mongod');
    console.log('3. Run migration: node migrate-to-local-mongodb.js');
    console.log('4. Start your application: npm run dev');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  createEnvFile,
  checkDependencies,
  createDirectories,
  createGitignore
};
