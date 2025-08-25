const mongoose = require('mongoose');
const { v2 as cloudinary } = 'cloudinary';

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
const User = require('../lib/models/User');

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
    process.exit(1);
  }
}

async function cleanupExpiredStories() {
  try {
    console.log('🧹 Starting automatic story cleanup...');
    
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
        console.log(`🗑️  Processing story: ${story._id} (${story.type})`);

        // Extract public ID from the media URL
        const urlParts = story.media.split('/');
        const filename = urlParts[urlParts.length - 1];
        const filenameWithoutExtension = filename.split('.')[0];
        
        // Reconstruct the public ID based on the folder structure
        const cloudinaryPublicId = `users/${story.author.username}/story/${story.type}/${filenameWithoutExtension}`;

        console.log(`   📁 Cloudinary path: ${cloudinaryPublicId}`);

        // Delete from Cloudinary
        try {
          await new Promise((resolve, reject) => {
            cloudinary.uploader.destroy(
              cloudinaryPublicId,
              { resource_type: story.type === 'video' ? 'video' : 'image' },
              (error, result) => {
                if (error) {
                  console.warn(`   ⚠️  Cloudinary deletion failed: ${error.message}`);
                  reject(error);
                } else {
                  console.log(`   ✅ Cloudinary deletion successful`);
                  resolve(result);
                }
              }
            );
          });
          deletedFromCloudinary++;
        } catch (cloudinaryError) {
          console.warn(`   ⚠️  Cloudinary deletion failed for story: ${story._id}`);
        }

        // Delete from database
        await Story.findByIdAndDelete(story._id);
        deletedFromDatabase++;
        console.log(`   ✅ Database deletion successful`);

      } catch (storyError) {
        console.error(`   ❌ Error processing story ${story._id}:`, storyError.message);
        errors++;
      }
    }

    console.log('\n📊 Cleanup Summary:');
    console.log(`   Total expired stories: ${expiredStories.length}`);
    console.log(`   Deleted from Cloudinary: ${deletedFromCloudinary}`);
    console.log(`   Deleted from Database: ${deletedFromDatabase}`);
    console.log(`   Errors: ${errors}`);

    if (errors > 0) {
      console.log('\n⚠️  Some stories had errors during cleanup');
    } else {
      console.log('\n✨ All expired stories cleaned up successfully!');
    }

  } catch (error) {
    console.error('❌ Cleanup process failed:', error);
  }
}

async function main() {
  try {
    await connectDB();
    await cleanupExpiredStories();
  } catch (error) {
    console.error('❌ Main process failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the cleanup
main();
