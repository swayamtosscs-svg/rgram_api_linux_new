#!/usr/bin/env node

/**
 * Enhanced Social Media API Setup Script
 * This script helps set up the enhanced social media API system
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Enhanced Social Media API...\n');

// Create necessary directories
const directories = [
  'public/uploads/users',
  'public/uploads/assets/public',
  'public/uploads/assets/private',
  'public/uploads/baba-pages'
];

console.log('📁 Creating directory structure...');
directories.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✅ Created: ${dir}`);
  } else {
    console.log(`📁 Exists: ${dir}`);
  }
});

// Create .gitkeep files to ensure directories are tracked
directories.forEach(dir => {
  const gitkeepPath = path.join(process.cwd(), dir, '.gitkeep');
  if (!fs.existsSync(gitkeepPath)) {
    fs.writeFileSync(gitkeepPath, '');
  }
});

console.log('\n📝 Creating environment template...');

const envTemplate = `# Enhanced Social Media API Environment Variables

# Database
MONGODB_URI=mongodb://localhost:27017/enhanced_social_media

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# File Upload Limits
MAX_FILE_SIZE=50MB
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/gif,image/webp
ALLOWED_VIDEO_TYPES=video/mp4,video/avi,video/mov,video/wmv,video/flv,video/webm
ALLOWED_AUDIO_TYPES=audio/mp3,audio/wav,audio/ogg

# Story Settings
STORY_EXPIRATION_HOURS=24

# Admin Settings
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123

# Notification Settings
NOTIFICATION_RETENTION_DAYS=30

# Content Moderation
ENABLE_CONTENT_MODERATION=true
AUTO_DELETE_REPORTED_CONTENT=false

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Development
NODE_ENV=development
LOG_LEVEL=debug
`;

const envPath = path.join(process.cwd(), '.env.example');
if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ Created: .env.example');
} else {
  console.log('📁 Exists: .env.example');
}

console.log('\n📋 Creating setup instructions...');

const setupInstructions = `# Enhanced Social Media API Setup Instructions

## 1. Environment Setup

1. Copy the environment template:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

2. Update the environment variables in .env:
   - Set your MongoDB connection string
   - Generate a secure JWT secret
   - Configure file upload limits
   - Set admin credentials

## 2. Database Setup

1. Make sure MongoDB is running
2. The models will be created automatically when first used
3. Create an admin user manually or use the admin creation API

## 3. File Structure

The following directories will be created:
- public/uploads/users/{userId}/posts/
- public/uploads/users/{userId}/reels/
- public/uploads/users/{userId}/stories/
- public/uploads/assets/public/
- public/uploads/assets/private/

## 4. API Testing

1. Import the Postman collection: enhanced-social-media-api-postman-collection.json
2. Set up environment variables in Postman:
   - base_url: http://localhost:3000/api
   - jwt_token: your-jwt-token
   - post_id: post-id-for-testing
   - user_id: user-id-for-testing

## 5. Admin Setup

1. Create an admin user using the admin creation API
2. Login with admin credentials
3. Access the admin dashboard at /api/admin/enhanced

## 6. Features

### Posts
- Create, read, update, delete posts
- Media upload support
- Mentions (@username)
- Hashtags (#hashtag)
- Collaboration requests

### Reels
- Video content with song support
- Trending algorithm
- Same social features as posts

### Stories
- 24-hour auto-expiration
- Media upload support
- Mentions and hashtags

### Admin Dashboard
- User management (block/unblock)
- Content moderation
- Report handling
- Analytics and statistics

### Notifications
- Real-time notifications
- Mark as read functionality
- Notification history

### Reports
- Content reporting system
- Admin review and action

## 7. Security

- JWT authentication required for all endpoints
- Role-based admin permissions
- Content moderation system
- User blocking system

## 8. File Storage

- Local file storage
- Public/private access control
- Automatic cleanup for expired stories
- File size and type validation

## 9. API Documentation

See ENHANCED_SOCIAL_MEDIA_API_DOCUMENTATION.md for detailed API documentation.

## 10. Support

For issues or questions, refer to the API documentation or check the console logs for error details.
`;

const setupPath = path.join(process.cwd(), 'SETUP_INSTRUCTIONS.md');
if (!fs.existsSync(setupPath)) {
  fs.writeFileSync(setupPath, setupInstructions);
  console.log('✅ Created: SETUP_INSTRUCTIONS.md');
} else {
  console.log('📁 Exists: SETUP_INSTRUCTIONS.md');
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📚 Next steps:');
console.log('1. Copy .env.example to .env and configure your environment variables');
console.log('2. Start your MongoDB database');
console.log('3. Run your Next.js application: npm run dev');
console.log('4. Import the Postman collection for API testing');
console.log('5. Read SETUP_INSTRUCTIONS.md for detailed setup guide');
console.log('\n🚀 Your Enhanced Social Media API is ready to use!');
