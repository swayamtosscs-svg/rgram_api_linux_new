#!/usr/bin/env node

/**
 * Setup script for Comprehensive Post & Reel API
 * This script helps set up the API system with proper database connections and initial configuration
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Comprehensive Post & Reel API...\n');

// Check if required directories exist
const requiredDirs = [
  'public/uploads/users',
  'models',
  'pages/api/posts',
  'pages/api/reels',
  'pages/api/comments',
  'pages/api/notifications'
];

console.log('📁 Creating required directories...');
requiredDirs.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  } else {
    console.log(`📁 Directory already exists: ${dir}`);
  }
});

// Check if required files exist
const requiredFiles = [
  'models/Post.ts',
  'models/Comment.ts',
  'pages/api/posts/comprehensive.ts',
  'pages/api/posts/interactions.ts',
  'pages/api/reels/comprehensive.ts',
  'pages/api/comments/comprehensive.ts',
  'pages/api/comments/interactions.ts',
  'lib/models/Notification.ts'
];

console.log('\n📄 Checking required files...');
let allFilesExist = true;
requiredFiles.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ File exists: ${file}`);
  } else {
    console.log(`❌ Missing file: ${file}`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Some required files are missing. Please ensure all API files are created.');
  process.exit(1);
}

// Check package.json dependencies
console.log('\n📦 Checking dependencies...');
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const requiredDeps = [
    'mongoose',
    'jsonwebtoken',
    'bcryptjs',
    'multer',
    'formidable',
    'sharp'
  ];
  
  const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
  
  if (missingDeps.length > 0) {
    console.log(`❌ Missing dependencies: ${missingDeps.join(', ')}`);
    console.log('Run: npm install ' + missingDeps.join(' '));
  } else {
    console.log('✅ All required dependencies are installed');
  }
} else {
  console.log('❌ package.json not found');
}

// Create sample environment variables
console.log('\n🔧 Creating sample environment configuration...');
const envSample = `# Database Configuration
MONGODB_URI=mongodb://localhost:27017/rgram_api
DATABASE_NAME=rgram_api

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Server Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
PORT=3000

# File Upload Configuration
MAX_FILE_SIZE=104857600 # 100MB
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/gif,image/webp
ALLOWED_VIDEO_TYPES=video/mp4,video/mov,video/avi,video/webm
ALLOWED_AUDIO_TYPES=audio/mp3,audio/wav,audio/m4a,audio/aac

# Storage Configuration
STORAGE_TYPE=local
UPLOAD_DIR=public/uploads

# Notification Configuration
ENABLE_NOTIFICATIONS=true
NOTIFICATION_BATCH_SIZE=50

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000 # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Security
CORS_ORIGIN=http://localhost:3000
ENABLE_CORS=true
`;

const envPath = path.join(process.cwd(), '.env.example');
if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envSample);
  console.log('✅ Created .env.example file');
} else {
  console.log('📄 .env.example already exists');
}

// Create API usage examples
console.log('\n📚 Creating API usage examples...');
const usageExamples = `# Comprehensive Post & Reel API Usage Examples

## 1. Create a Post with Media

\`\`\`javascript
const formData = new FormData();
formData.append('content', 'Check out this amazing sunset! #sunset #nature');
formData.append('type', 'post');
formData.append('category', 'general');
formData.append('hashtags', JSON.stringify(['sunset', 'nature']));
formData.append('mentions', JSON.stringify(['userId1', 'userId2']));
formData.append('media', imageFile);

const response = await fetch('/api/posts/comprehensive', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${token}\`
  },
  body: formData
});
\`\`\`

## 2. Create a Reel with Song

\`\`\`javascript
const formData = new FormData();
formData.append('content', 'Dancing to this amazing song! #dance #viral');
formData.append('type', 'reel');
formData.append('reelDuration', '60');
formData.append('videos', videoFile);
formData.append('song', audioFile);
formData.append('song.title', 'Amazing Song');
formData.append('song.artist', 'Great Artist');

const response = await fetch('/api/reels/comprehensive', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${token}\`
  },
  body: formData
});
\`\`\`

## 3. Like a Post

\`\`\`javascript
const response = await fetch('/api/posts/interactions?postId=postId', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${token}\`
  },
  body: JSON.stringify({
    action: 'like'
  })
});
\`\`\`

## 4. Comment with Mention

\`\`\`javascript
const response = await fetch('/api/comments/comprehensive', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${token}\`
  },
  body: JSON.stringify({
    postId: 'postId',
    content: 'Great post! @username check this out #amazing',
    mentions: ['userId1', 'userId2']
  })
});
\`\`\`

## 5. Get Posts with Filters

\`\`\`javascript
const response = await fetch('/api/posts/comprehensive?page=1&limit=10&type=post&category=general&following_posts=true', {
  headers: {
    'Authorization': \`Bearer \${token}\`
  }
});
\`\`\`

## 6. Share a Post

\`\`\`javascript
const response = await fetch('/api/posts/interactions?postId=postId', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${token}\`
  },
  body: JSON.stringify({
    action: 'share'
  })
});
\`\`\`

## 7. Save a Post

\`\`\`javascript
const response = await fetch('/api/posts/interactions?postId=postId', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${token}\`
  },
  body: JSON.stringify({
    action: 'save'
  })
});
\`\`\`

## 8. Get Notifications

\`\`\`javascript
const response = await fetch('/api/notifications/list?page=1&limit=20', {
  headers: {
    'Authorization': \`Bearer \${token}\`
  }
});
\`\`\`

## 9. Update Post

\`\`\`javascript
const response = await fetch('/api/posts/comprehensive?postId=postId', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${token}\`
  },
  body: JSON.stringify({
    content: 'Updated post content',
    title: 'Updated title',
    hashtags: ['updated', 'content']
  })
});
\`\`\`

## 10. Delete Post

\`\`\`javascript
const response = await fetch('/api/posts/comprehensive?postId=postId', {
  method: 'DELETE',
  headers: {
    'Authorization': \`Bearer \${token}\`
  }
});
\`\`\`
`;

const examplesPath = path.join(process.cwd(), 'API_USAGE_EXAMPLES.md');
if (!fs.existsSync(examplesPath)) {
  fs.writeFileSync(examplesPath, usageExamples);
  console.log('✅ Created API_USAGE_EXAMPLES.md file');
} else {
  console.log('📄 API_USAGE_EXAMPLES.md already exists');
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Copy .env.example to .env and update the values');
console.log('2. Install dependencies: npm install');
console.log('3. Start your MongoDB database');
console.log('4. Run the development server: npm run dev');
console.log('5. Import the Postman collection for testing');
console.log('6. Check the API documentation: COMPREHENSIVE_POST_REEL_API_README.md');

console.log('\n🔗 API Endpoints:');
console.log('- Posts: /api/posts/comprehensive');
console.log('- Reels: /api/reels/comprehensive');
console.log('- Comments: /api/comments/comprehensive');
console.log('- Post Interactions: /api/posts/interactions');
console.log('- Comment Interactions: /api/comments/interactions');
console.log('- Notifications: /api/notifications/list');

console.log('\n📁 File Storage:');
console.log('- Images: public/uploads/users/{userId}/images/');
console.log('- Videos: public/uploads/users/{userId}/videos/');
console.log('- Audio: public/uploads/users/{userId}/audio/');

console.log('\n✨ Features included:');
console.log('- ✅ Post creation with media upload');
console.log('- ✅ Reel creation with video and song support');
console.log('- ✅ Comment system with replies and mentions');
console.log('- ✅ Like, share, save, view functionality');
console.log('- ✅ Real-time notifications');
console.log('- ✅ Local file storage');
console.log('- ✅ Privacy controls');
console.log('- ✅ Hashtag and mention support');
console.log('- ✅ Collaboration features');
console.log('- ✅ Complete CRUD operations');

console.log('\n🚀 Your comprehensive Post & Reel API is ready to use!');
