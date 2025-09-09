const mongoose = require('mongoose');
const { unlink } = require('fs').promises;
const { join } = require('path');

// Import models
const BabaStory = require('../lib/models/BabaStory');
const BabaPage = require('../lib/models/BabaPage');

// Connect to MongoDB
const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rgram');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Cleanup expired stories
const cleanupExpiredStories = async () => {
  try {
    console.log('Starting cleanup of expired Baba Ji stories...');
    
    // Find expired stories
    const expiredStories = await BabaStory.find({
      isActive: true,
      expiresAt: { $lte: new Date() }
    });

    console.log(`Found ${expiredStories.length} expired stories`);

    let deletedCount = 0;
    let errorCount = 0;

    for (const story of expiredStories) {
      try {
        // Delete media file from filesystem
        try {
          const filePath = join(process.cwd(), 'public', story.media.url);
          await unlink(filePath);
          console.log(`Deleted media file: ${story.media.filename}`);
        } catch (fileError) {
          console.error(`Error deleting media file ${story.media.filename}:`, fileError.message);
        }

        // Soft delete story
        story.isActive = false;
        await story.save();

        // Update page stories count
        await BabaPage.findByIdAndUpdate(story.babaPageId, { 
          $inc: { storiesCount: -1 } 
        });

        deletedCount++;
        console.log(`Deleted story: ${story._id}`);
      } catch (error) {
        console.error(`Error deleting story ${story._id}:`, error.message);
        errorCount++;
      }
    }

    console.log(`Cleanup completed: ${deletedCount} stories deleted, ${errorCount} errors`);
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
};

// Main execution
const main = async () => {
  await connectToDatabase();
  await cleanupExpiredStories();
  await mongoose.disconnect();
  console.log('Cleanup process completed');
  process.exit(0);
};

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { cleanupExpiredStories };
