const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Import models
const BabaStory = require('../models/BabaStory');
const Baba = require('../models/Baba');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://tossitswayam:Qwert123%23%24@cluster0.tpk0nle.mongodb.net/api_rgram?retryWrites=true&w=majority';

async function connectDB() {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log('✅ Already connected to MongoDB');
      return;
    }

    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      maxPoolSize: 5,
      retryWrites: true,
      w: 1,
      retryReads: true,
      family: 4,
    });
    
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

async function cleanupExpiredStories() {
  try {
    console.log('🧹 Starting cleanup of expired stories...');
    
    await connectDB();
    
    const now = new Date();
    console.log('⏰ Current time:', now.toISOString());
    
    // Find all expired stories
    const expiredStories = await BabaStory.find({
      expiresAt: { $lte: now }
    });
    
    console.log(`📊 Found ${expiredStories.length} expired stories`);
    
    if (expiredStories.length === 0) {
      console.log('✅ No expired stories to clean up');
      return;
    }
    
    let deletedCount = 0;
    let fileDeletedCount = 0;
    let errorCount = 0;
    
    // Process each expired story
    for (const story of expiredStories) {
      try {
        console.log(`🗑️ Processing story: ${story._id} (expired at: ${story.expiresAt})`);
        
        // Delete media file if exists
        if (story.mediaPath) {
          try {
            await fs.access(story.mediaPath);
            await fs.unlink(story.mediaPath);
            console.log(`  ✅ Deleted media file: ${story.mediaPath}`);
            fileDeletedCount++;
          } catch (fileError) {
            console.log(`  ⚠️ Media file not found or already deleted: ${story.mediaPath}`);
          }
        }
        
        // Delete thumbnail file if exists
        if (story.thumbnailPath) {
          try {
            await fs.access(story.thumbnailPath);
            await fs.unlink(story.thumbnailPath);
            console.log(`  ✅ Deleted thumbnail file: ${story.thumbnailPath}`);
            fileDeletedCount++;
          } catch (fileError) {
            console.log(`  ⚠️ Thumbnail file not found or already deleted: ${story.thumbnailPath}`);
          }
        }
        
        // Delete story from database
        await BabaStory.findByIdAndDelete(story._id);
        console.log(`  ✅ Deleted story from database: ${story._id}`);
        deletedCount++;
        
        // Update baba's story count
        await Baba.findOneAndUpdate(
          { babaId: story.babaId },
          { $inc: { storiesCount: -1 } }
        );
        console.log(`  ✅ Updated story count for baba: ${story.babaId}`);
        
      } catch (error) {
        console.error(`  ❌ Error processing story ${story._id}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('🎉 Cleanup completed!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Summary:`);
    console.log(`  • Stories deleted from database: ${deletedCount}`);
    console.log(`  • Files deleted from storage: ${fileDeletedCount}`);
    console.log(`  • Errors encountered: ${errorCount}`);
    console.log(`  • Total expired stories found: ${expiredStories.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
  } catch (error) {
    console.error('❌ Cleanup error:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run cleanup if called directly
if (require.main === module) {
  cleanupExpiredStories()
    .then(() => {
      console.log('✅ Cleanup script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Cleanup script failed:', error);
      process.exit(1);
    });
}

module.exports = { cleanupExpiredStories };