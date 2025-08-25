const mongoose = require('mongoose');
const { v2 as cloudinary } = require('cloudinary');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Import models
const Story = require('../lib/models/Story');

// Database connection
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is required');
  process.exit(1);
}

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

async function cleanupExpiredStories() {
  try {
    console.log(`🧹 [${new Date().toISOString()}] Starting scheduled story cleanup...`);
    
    // Find all expired stories
    const expiredStories = await Story.find({
      expiresAt: { $lt: new Date() },
      isActive: true
    }).populate('author', 'username');

    if (expiredStories.length === 0) {
      console.log('✨ No expired stories found');
      return;
    }

    console.log(`📊 Found ${expiredStories.length} expired stories to clean up`);

    let deletedFromCloudinary = 0;
    let deletedFromDatabase = 0;
    let errors = 0;

    // Process each expired story
    for (const story of expiredStories) {
      try {
        // Extract public ID from the media URL
        const urlParts = story.media.split('/');
        const filename = urlParts[urlParts.length - 1];
        const filenameWithoutExtension = filename.split('.')[0];
        
        // Reconstruct the public ID based on the folder structure
        const cloudinaryPublicId = `users/${story.author.username}/story/${story.type}/${filenameWithoutExtension}`;

        // Delete from Cloudinary
        try {
          await new Promise((resolve, reject) => {
            cloudinary.uploader.destroy(
              cloudinaryPublicId,
              { resource_type: story.type === 'video' ? 'video' : 'image' },
              (error, result) => {
                if (error) {
                  console.warn(`   ⚠️  Cloudinary deletion failed for story ${story._id}: ${error.message}`);
                  reject(error);
                } else {
                  resolve(result);
                }
              }
            );
          });
          deletedFromCloudinary++;
        } catch (cloudinaryError) {
          // Continue with database cleanup even if Cloudinary fails
        }

        // Delete from database
        await Story.findByIdAndDelete(story._id);
        deletedFromDatabase++;
        
      } catch (storyError) {
        console.error(`   ❌ Error processing story ${story._id}:`, storyError.message);
        errors++;
      }
    }

    console.log(`📊 Cleanup completed: ${deletedFromDatabase} stories deleted from database, ${deletedFromCloudinary} from Cloudinary, ${errors} errors`);

  } catch (error) {
    console.error('❌ Cleanup process failed:', error);
  }
}

async function startScheduledCleanup() {
  try {
    await connectDB();
    console.log('🚀 Scheduled cleanup service started');
    console.log('⏰ Running cleanup every hour...');
    
    // Run cleanup immediately
    await cleanupExpiredStories();
    
    // Schedule cleanup every hour
    setInterval(async () => {
      try {
        await cleanupExpiredStories();
      } catch (error) {
        console.error('❌ Scheduled cleanup failed:', error);
      }
    }, 60 * 60 * 1000); // 1 hour in milliseconds
    
  } catch (error) {
    console.error('❌ Failed to start scheduled cleanup:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down scheduled cleanup service...');
  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down scheduled cleanup service...');
  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB');
  process.exit(0);
});

// Start the service
startScheduledCleanup();
