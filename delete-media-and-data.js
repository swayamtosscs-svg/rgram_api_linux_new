const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
  LOCAL_URI: process.env.LOCAL_MONGODB_URI || 'mongodb://localhost:27017/api_rgram',
  MEDIA_BASE_PATH: path.join(__dirname, 'public', 'assets')
};

// Models (same as migration script)
let User, Baba, BabaPost, BabaVideo, BabaStory, Post;

// Initialize models
async function initializeModels() {
  const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' },
    website: { type: String, default: '' },
    location: { type: String, default: '' },
    religion: { type: String, default: '' },
    phone: { type: String },
    googleId: { type: String },
    isPrivate: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    postsCount: { type: Number, default: 0 },
    reelsCount: { type: Number, default: 0 },
    videosCount: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });

  const babaSchema = new mongoose.Schema({
    babaId: { type: String, required: true, unique: true },
    babaName: { type: String, required: true },
    spiritualName: { type: String, required: true },
    description: { type: String },
    avatar: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    location: { type: String },
    ashram: { type: String },
    followersCount: { type: Number, default: 0 },
    postsCount: { type: Number, default: 0 },
    videosCount: { type: Number, default: 0 },
    storiesCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    socialLinks: {
      website: String,
      facebook: String,
      instagram: String,
      youtube: String,
      twitter: String
    },
    contactInfo: {
      email: String,
      phone: String,
      address: String
    },
    spiritualTeachings: [String],
    languages: [String],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lastActive: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });

  const babaPostSchema = new mongoose.Schema({
    babaId: { type: String, required: true, ref: 'Baba' },
    title: { type: String, required: true },
    content: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    imagePath: { type: String, default: '' },
    publicUrl: { type: String, required: true },
    tags: [{ type: String }],
    category: { type: String, enum: ['spiritual', 'teaching', 'blessing', 'announcement', 'general'], default: 'spiritual' },
    isPublic: { type: Boolean, default: true },
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    scheduledAt: { type: Date },
    publishedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });

  const babaVideoSchema = new mongoose.Schema({
    babaId: { type: String, required: true, ref: 'Baba' },
    title: { type: String, required: true },
    description: { type: String },
    videoUrl: { type: String, required: true },
    videoPath: { type: String, required: true },
    publicUrl: { type: String, required: true },
    thumbnailUrl: { type: String, default: '' },
    thumbnailPath: { type: String, default: '' },
    duration: { type: Number, required: true },
    fileSize: { type: Number, required: true },
    resolution: { width: Number, height: Number },
    format: { type: String, required: true },
    category: { type: String, enum: ['satsang', 'teaching', 'blessing', 'kirtan', 'discourse', 'general'], default: 'satsang' },
    tags: [{ type: String }],
    isPublic: { type: Boolean, default: true },
    isLive: { type: Boolean, default: false },
    likesCount: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    publishedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });

  const babaStorySchema = new mongoose.Schema({
    babaId: { type: String, required: true, ref: 'Baba' },
    content: { type: String },
    mediaType: { type: String, enum: ['image', 'video'], required: true },
    mediaUrl: { type: String, required: true },
    mediaPath: { type: String, required: true },
    publicUrl: { type: String, required: true },
    thumbnailUrl: { type: String, default: '' },
    thumbnailPath: { type: String, default: '' },
    duration: { type: Number },
    fileSize: { type: Number },
    format: { type: String },
    category: { type: String, enum: ['daily', 'blessing', 'teaching', 'announcement', 'general'], default: 'daily' },
    isPublic: { type: Boolean, default: true },
    viewsCount: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
    publishedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });

  const postSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    imagePath: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    videoPath: { type: String, default: '' },
    publicUrl: { type: String, default: '' },
    tags: [{ type: String }],
    isPublic: { type: Boolean, default: true },
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },
    publishedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });

  User = mongoose.model('User', userSchema);
  Baba = mongoose.model('Baba', babaSchema);
  BabaPost = mongoose.model('BabaPost', babaPostSchema);
  BabaVideo = mongoose.model('BabaVideo', babaVideoSchema);
  BabaStory = mongoose.model('BabaStory', babaStorySchema);
  Post = mongoose.model('Post', postSchema);
}

// Delete file from filesystem
async function deleteFile(filePath) {
  try {
    if (filePath && filePath.startsWith('/')) {
      const fullPath = path.join(__dirname, 'public', filePath.substring(1));
      await fs.unlink(fullPath);
      console.log(`🗑️ Deleted file: ${filePath}`);
      return true;
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn(`⚠️ Could not delete file ${filePath}: ${error.message}`);
    }
  }
  return false;
}

// Delete user and all associated data
async function deleteUser(userId) {
  let connection;
  
  try {
    connection = await mongoose.createConnection(CONFIG.LOCAL_URI);
    const models = {
      User: connection.model('User', User.schema),
      Baba: connection.model('Baba', Baba.schema),
      BabaPost: connection.model('BabaPost', BabaPost.schema),
      BabaVideo: connection.model('BabaVideo', BabaVideo.schema),
      BabaStory: connection.model('BabaStory', BabaStory.schema),
      Post: connection.model('Post', Post.schema)
    };
    
    console.log(`🗑️ Deleting user: ${userId}`);
    
    // Find user
    const user = await models.User.findById(userId);
    if (!user) {
      console.log(`❌ User not found: ${userId}`);
      return false;
    }
    
    // Delete user's avatar
    if (user.avatar) {
      await deleteFile(user.avatar);
    }
    
    // Find and delete user's posts
    const userPosts = await models.Post.find({ userId });
    for (const post of userPosts) {
      if (post.imagePath) await deleteFile(post.imagePath);
      if (post.videoPath) await deleteFile(post.videoPath);
    }
    await models.Post.deleteMany({ userId });
    console.log(`🗑️ Deleted ${userPosts.length} user posts`);
    
    // Find and delete user's babas
    const userBabas = await models.Baba.find({ createdBy: userId });
    for (const baba of userBabas) {
      await deleteBaba(baba.babaId, models);
    }
    
    // Delete user
    await models.User.findByIdAndDelete(userId);
    console.log(`✅ User deleted: ${user.username}`);
    
    return true;
    
  } catch (error) {
    console.error(`❌ Error deleting user ${userId}:`, error);
    return false;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

// Delete baba and all associated data
async function deleteBaba(babaId, models = null) {
  let connection;
  let shouldCloseConnection = false;
  
  try {
    if (!models) {
      connection = await mongoose.createConnection(CONFIG.LOCAL_URI);
      models = {
        Baba: connection.model('Baba', Baba.schema),
        BabaPost: connection.model('BabaPost', BabaPost.schema),
        BabaVideo: connection.model('BabaVideo', BabaVideo.schema),
        BabaStory: connection.model('BabaStory', BabaStory.schema)
      };
      shouldCloseConnection = true;
    }
    
    console.log(`🗑️ Deleting baba: ${babaId}`);
    
    // Find baba
    const baba = await models.Baba.findOne({ babaId });
    if (!baba) {
      console.log(`❌ Baba not found: ${babaId}`);
      return false;
    }
    
    // Delete baba's avatar and cover image
    if (baba.avatar) await deleteFile(baba.avatar);
    if (baba.coverImage) await deleteFile(baba.coverImage);
    
    // Find and delete baba's posts
    const babaPosts = await models.BabaPost.find({ babaId });
    for (const post of babaPosts) {
      if (post.imagePath) await deleteFile(post.imagePath);
    }
    await models.BabaPost.deleteMany({ babaId });
    console.log(`🗑️ Deleted ${babaPosts.length} baba posts`);
    
    // Find and delete baba's videos
    const babaVideos = await models.BabaVideo.find({ babaId });
    for (const video of babaVideos) {
      if (video.videoPath) await deleteFile(video.videoPath);
      if (video.thumbnailPath) await deleteFile(video.thumbnailPath);
    }
    await models.BabaVideo.deleteMany({ babaId });
    console.log(`🗑️ Deleted ${babaVideos.length} baba videos`);
    
    // Find and delete baba's stories
    const babaStories = await models.BabaStory.find({ babaId });
    for (const story of babaStories) {
      if (story.mediaPath) await deleteFile(story.mediaPath);
      if (story.thumbnailPath) await deleteFile(story.thumbnailPath);
    }
    await models.BabaStory.deleteMany({ babaId });
    console.log(`🗑️ Deleted ${babaStories.length} baba stories`);
    
    // Delete baba
    await models.Baba.findOneAndDelete({ babaId });
    console.log(`✅ Baba deleted: ${baba.babaName}`);
    
    return true;
    
  } catch (error) {
    console.error(`❌ Error deleting baba ${babaId}:`, error);
    return false;
  } finally {
    if (shouldCloseConnection && connection) {
      await connection.close();
    }
  }
}

// Delete specific post
async function deletePost(postId, postType = 'Post') {
  let connection;
  
  try {
    connection = await mongoose.createConnection(CONFIG.LOCAL_URI);
    const models = {
      Post: connection.model('Post', Post.schema),
      BabaPost: connection.model('BabaPost', BabaPost.schema)
    };
    
    console.log(`🗑️ Deleting ${postType}: ${postId}`);
    
    const model = models[postType];
    const post = await model.findById(postId);
    
    if (!post) {
      console.log(`❌ ${postType} not found: ${postId}`);
      return false;
    }
    
    // Delete associated files
    if (post.imagePath) await deleteFile(post.imagePath);
    if (post.videoPath) await deleteFile(post.videoPath);
    if (post.thumbnailPath) await deleteFile(post.thumbnailPath);
    
    // Delete post
    await model.findByIdAndDelete(postId);
    console.log(`✅ ${postType} deleted: ${post.title || post.content?.substring(0, 50)}`);
    
    return true;
    
  } catch (error) {
    console.error(`❌ Error deleting ${postType} ${postId}:`, error);
    return false;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

// Delete specific video
async function deleteVideo(videoId) {
  let connection;
  
  try {
    connection = await mongoose.createConnection(CONFIG.LOCAL_URI);
    const models = {
      BabaVideo: connection.model('BabaVideo', BabaVideo.schema)
    };
    
    console.log(`🗑️ Deleting video: ${videoId}`);
    
    const video = await models.BabaVideo.findById(videoId);
    
    if (!video) {
      console.log(`❌ Video not found: ${videoId}`);
      return false;
    }
    
    // Delete associated files
    if (video.videoPath) await deleteFile(video.videoPath);
    if (video.thumbnailPath) await deleteFile(video.thumbnailPath);
    
    // Delete video
    await models.BabaVideo.findByIdAndDelete(videoId);
    console.log(`✅ Video deleted: ${video.title}`);
    
    return true;
    
  } catch (error) {
    console.error(`❌ Error deleting video ${videoId}:`, error);
    return false;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

// Delete specific story
async function deleteStory(storyId) {
  let connection;
  
  try {
    connection = await mongoose.createConnection(CONFIG.LOCAL_URI);
    const models = {
      BabaStory: connection.model('BabaStory', BabaStory.schema)
    };
    
    console.log(`🗑️ Deleting story: ${storyId}`);
    
    const story = await models.BabaStory.findById(storyId);
    
    if (!story) {
      console.log(`❌ Story not found: ${storyId}`);
      return false;
    }
    
    // Delete associated files
    if (story.mediaPath) await deleteFile(story.mediaPath);
    if (story.thumbnailPath) await deleteFile(story.thumbnailPath);
    
    // Delete story
    await models.BabaStory.findByIdAndDelete(storyId);
    console.log(`✅ Story deleted: ${story.content?.substring(0, 50) || 'No content'}`);
    
    return true;
    
  } catch (error) {
    console.error(`❌ Error deleting story ${storyId}:`, error);
    return false;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

// Clean up orphaned files
async function cleanupOrphanedFiles() {
  console.log('🧹 Cleaning up orphaned files...');
  
  let connection;
  
  try {
    connection = await mongoose.createConnection(CONFIG.LOCAL_URI);
    const models = {
      User: connection.model('User', User.schema),
      Baba: connection.model('Baba', Baba.schema),
      BabaPost: connection.model('BabaPost', BabaPost.schema),
      BabaVideo: connection.model('BabaVideo', BabaVideo.schema),
      BabaStory: connection.model('BabaStory', BabaStory.schema),
      Post: connection.model('Post', Post.schema)
    };
    
    // Get all file paths from database
    const dbFilePaths = new Set();
    
    // Collect all file paths from all collections
    const collections = [
      { model: models.User, fields: ['avatar'] },
      { model: models.Baba, fields: ['avatar', 'coverImage'] },
      { model: models.Post, fields: ['imagePath', 'videoPath'] },
      { model: models.BabaPost, fields: ['imagePath'] },
      { model: models.BabaVideo, fields: ['videoPath', 'thumbnailPath'] },
      { model: models.BabaStory, fields: ['mediaPath', 'thumbnailPath'] }
    ];
    
    for (const { model, fields } of collections) {
      const docs = await model.find({});
      for (const doc of docs) {
        for (const field of fields) {
          if (doc[field]) {
            dbFilePaths.add(doc[field]);
          }
        }
      }
    }
    
    // Get all files in assets directory
    const assetsDir = CONFIG.MEDIA_BASE_PATH;
    const allFiles = await getAllFiles(assetsDir);
    
    // Find orphaned files
    const orphanedFiles = allFiles.filter(file => {
      const relativePath = path.relative(path.join(__dirname, 'public'), file);
      return !dbFilePaths.has(`/${relativePath.replace(/\\/g, '/')}`);
    });
    
    console.log(`📊 Found ${orphanedFiles.length} orphaned files`);
    
    // Delete orphaned files
    let deletedCount = 0;
    for (const file of orphanedFiles) {
      try {
        await fs.unlink(file);
        console.log(`🗑️ Deleted orphaned file: ${path.relative(assetsDir, file)}`);
        deletedCount++;
      } catch (error) {
        console.warn(`⚠️ Could not delete orphaned file ${file}: ${error.message}`);
      }
    }
    
    console.log(`✅ Cleaned up ${deletedCount} orphaned files`);
    
  } catch (error) {
    console.error('❌ Error cleaning up orphaned files:', error);
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

// Helper function to get all files recursively
async function getAllFiles(dir) {
  const files = [];
  
  try {
    const items = await fs.readdir(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = await fs.stat(fullPath);
      
      if (stat.isDirectory()) {
        const subFiles = await getAllFiles(fullPath);
        files.push(...subFiles);
      } else {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Directory doesn't exist or can't be read
  }
  
  return files;
}

// Main function for CLI usage
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage:');
    console.log('  node delete-media-and-data.js user <userId>');
    console.log('  node delete-media-and-data.js baba <babaId>');
    console.log('  node delete-media-and-data.js post <postId>');
    console.log('  node delete-media-and-data.js babapost <postId>');
    console.log('  node delete-media-and-data.js video <videoId>');
    console.log('  node delete-media-and-data.js story <storyId>');
    console.log('  node delete-media-and-data.js cleanup');
    return;
  }
  
  await initializeModels();
  
  const command = args[0];
  const id = args[1];
  
  switch (command) {
    case 'user':
      if (!id) {
        console.log('❌ Please provide user ID');
        return;
      }
      await deleteUser(id);
      break;
      
    case 'baba':
      if (!id) {
        console.log('❌ Please provide baba ID');
        return;
      }
      await deleteBaba(id);
      break;
      
    case 'post':
      if (!id) {
        console.log('❌ Please provide post ID');
        return;
      }
      await deletePost(id, 'Post');
      break;
      
    case 'babapost':
      if (!id) {
        console.log('❌ Please provide baba post ID');
        return;
      }
      await deletePost(id, 'BabaPost');
      break;
      
    case 'video':
      if (!id) {
        console.log('❌ Please provide video ID');
        return;
      }
      await deleteVideo(id);
      break;
      
    case 'story':
      if (!id) {
        console.log('❌ Please provide story ID');
        return;
      }
      await deleteStory(id);
      break;
      
    case 'cleanup':
      await cleanupOrphanedFiles();
      break;
      
    default:
      console.log('❌ Unknown command:', command);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  deleteUser,
  deleteBaba,
  deletePost,
  deleteVideo,
  deleteStory,
  cleanupOrphanedFiles,
  CONFIG
};
