const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');
const { v4: uuidv4 } = require('uuid');

// Configuration
const CONFIG = {
  // Source MongoDB Atlas connection
  ATLAS_URI: process.env.ATLAS_MONGODB_URI || 'mongodb+srv://tossitswayam:Qwert123%23%24@cluster0.tpk0nle.mongodb.net/api_rgram?retryWrites=true&w=majority',
  
  // Local MongoDB connection
  LOCAL_URI: process.env.LOCAL_MONGODB_URI || 'mongodb://localhost:27017/api_rgram',
  
  // Media storage path
  MEDIA_BASE_PATH: path.join(__dirname, 'public', 'assets'),
  
  // Download timeout
  DOWNLOAD_TIMEOUT: 30000,
  
  // Batch size for processing
  BATCH_SIZE: 10
};

// Models
let User, Baba, BabaPost, BabaVideo, BabaStory, Post;

// Initialize models
async function initializeModels() {
  // User Schema
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

  // Baba Schema
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

  // BabaPost Schema
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

  // BabaVideo Schema
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

  // BabaStory Schema
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

  // Post Schema (for regular posts)
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

  // Create models
  User = mongoose.model('User', userSchema);
  Baba = mongoose.model('Baba', babaSchema);
  BabaPost = mongoose.model('BabaPost', babaPostSchema);
  BabaVideo = mongoose.model('BabaVideo', babaVideoSchema);
  BabaStory = mongoose.model('BabaStory', babaStorySchema);
  Post = mongoose.model('Post', postSchema);
}

// Create directory structure
async function createDirectoryStructure() {
  console.log('📁 Creating directory structure...');
  
  const basePath = CONFIG.MEDIA_BASE_PATH;
  const subdirs = ['users', 'babas', 'posts', 'videos', 'stories', 'thumbnails'];
  
  try {
    await fs.mkdir(basePath, { recursive: true });
    
    for (const subdir of subdirs) {
      await fs.mkdir(path.join(basePath, subdir), { recursive: true });
    }
    
    console.log('✅ Directory structure created successfully');
  } catch (error) {
    console.error('❌ Error creating directory structure:', error);
    throw error;
  }
}

// Download file from URL
async function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = require('fs').createWriteStream(filePath);
    
    const request = protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(filePath);
        });
      } else {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
      }
    });
    
    request.on('error', (error) => {
      reject(error);
    });
    
    request.setTimeout(CONFIG.DOWNLOAD_TIMEOUT, () => {
      request.destroy();
      reject(new Error('Download timeout'));
    });
  });
}

// Generate unique filename
function generateUniqueFilename(originalUrl, fileType, userId) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const uniqueId = uuidv4().substring(0, 8);
  const extension = path.extname(originalUrl) || (fileType === 'image' ? '.jpg' : '.mp4');
  
  return `${userId}_${timestamp}_${uniqueId}${extension}`;
}

// Get file type from URL
function getFileType(url) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'];
  
  const ext = path.extname(url).toLowerCase();
  
  if (imageExtensions.includes(ext)) return 'image';
  if (videoExtensions.includes(ext)) return 'video';
  
  // Default to image if can't determine
  return 'image';
}

// Process media files for a collection
async function processMediaFiles(collection, collectionName, userIdField = 'userId') {
  console.log(`📸 Processing media files for ${collectionName}...`);
  
  const documents = await collection.find({}).limit(1000); // Limit to prevent memory issues
  let processedCount = 0;
  let errorCount = 0;
  
  for (const doc of documents) {
    try {
      const userId = doc[userIdField] || doc.babaId || 'unknown';
      const updates = {};
      
      // Process different media fields based on collection
      const mediaFields = [];
      
      if (collectionName === 'User') {
        if (doc.avatar) mediaFields.push({ field: 'avatar', url: doc.avatar, type: 'image' });
      } else if (collectionName === 'Baba') {
        if (doc.avatar) mediaFields.push({ field: 'avatar', url: doc.avatar, type: 'image' });
        if (doc.coverImage) mediaFields.push({ field: 'coverImage', url: doc.coverImage, type: 'image' });
      } else if (collectionName === 'BabaPost') {
        if (doc.imageUrl) mediaFields.push({ field: 'imageUrl', url: doc.imageUrl, type: 'image' });
      } else if (collectionName === 'BabaVideo') {
        if (doc.videoUrl) mediaFields.push({ field: 'videoUrl', url: doc.videoUrl, type: 'video' });
        if (doc.thumbnailUrl) mediaFields.push({ field: 'thumbnailUrl', url: doc.thumbnailUrl, type: 'image' });
      } else if (collectionName === 'BabaStory') {
        if (doc.mediaUrl) mediaFields.push({ field: 'mediaUrl', url: doc.mediaUrl, type: doc.mediaType || 'image' });
        if (doc.thumbnailUrl) mediaFields.push({ field: 'thumbnailUrl', url: doc.thumbnailUrl, type: 'image' });
      } else if (collectionName === 'Post') {
        if (doc.imageUrl) mediaFields.push({ field: 'imageUrl', url: doc.imageUrl, type: 'image' });
        if (doc.videoUrl) mediaFields.push({ field: 'videoUrl', url: doc.videoUrl, type: 'video' });
      }
      
      for (const mediaField of mediaFields) {
        if (mediaField.url && mediaField.url.startsWith('http')) {
          try {
            const filename = generateUniqueFilename(mediaField.url, mediaField.type, userId);
            const subdir = mediaField.type === 'image' ? 'images' : 'videos';
            const filePath = path.join(CONFIG.MEDIA_BASE_PATH, subdir, filename);
            
            // Download file
            await downloadFile(mediaField.url, filePath);
            
            // Update document with local path
            const relativePath = path.relative(path.join(__dirname, 'public'), filePath);
            updates[mediaField.field] = `/${relativePath.replace(/\\/g, '/')}`;
            updates[mediaField.field.replace('Url', 'Path')] = relativePath.replace(/\\/g, '/');
            
            console.log(`✅ Downloaded ${mediaField.field} for ${userId}: ${filename}`);
          } catch (downloadError) {
            console.warn(`⚠️ Failed to download ${mediaField.field} for ${userId}: ${downloadError.message}`);
            errorCount++;
          }
        }
      }
      
      // Update document if any media was processed
      if (Object.keys(updates).length > 0) {
        await collection.updateOne({ _id: doc._id }, { $set: updates });
        processedCount++;
      }
      
    } catch (error) {
      console.error(`❌ Error processing ${collectionName} document ${doc._id}:`, error.message);
      errorCount++;
    }
  }
  
  console.log(`📊 ${collectionName} processing complete: ${processedCount} processed, ${errorCount} errors`);
  return { processedCount, errorCount };
}

// Migrate data from Atlas to Local
async function migrateData() {
  console.log('🚀 Starting data migration from Atlas to Local MongoDB...');
  
  let atlasConnection, localConnection;
  
  try {
    // Connect to Atlas
    console.log('🔗 Connecting to MongoDB Atlas...');
    atlasConnection = await mongoose.createConnection(CONFIG.ATLAS_URI);
    console.log('✅ Connected to Atlas');
    
    // Connect to Local
    console.log('🔗 Connecting to Local MongoDB...');
    localConnection = await mongoose.createConnection(CONFIG.LOCAL_URI);
    console.log('✅ Connected to Local MongoDB');
    
    // Initialize models for both connections
    const atlasModels = {
      User: atlasConnection.model('User', User.schema),
      Baba: atlasConnection.model('Baba', Baba.schema),
      BabaPost: atlasConnection.model('BabaPost', BabaPost.schema),
      BabaVideo: atlasConnection.model('BabaVideo', BabaVideo.schema),
      BabaStory: atlasConnection.model('BabaStory', BabaStory.schema),
      Post: atlasConnection.model('Post', Post.schema)
    };
    
    const localModels = {
      User: localConnection.model('User', User.schema),
      Baba: localConnection.model('Baba', Baba.schema),
      BabaPost: localConnection.model('BabaPost', BabaPost.schema),
      BabaVideo: localConnection.model('BabaVideo', BabaVideo.schema),
      BabaStory: localConnection.model('BabaStory', BabaStory.schema),
      Post: localConnection.model('Post', Post.schema)
    };
    
    // Clear local collections
    console.log('🧹 Clearing local collections...');
    for (const [name, model] of Object.entries(localModels)) {
      await model.deleteMany({});
      console.log(`✅ Cleared ${name} collection`);
    }
    
    // Migrate collections
    const collections = ['User', 'Baba', 'Post', 'BabaPost', 'BabaVideo', 'BabaStory'];
    
    for (const collectionName of collections) {
      console.log(`📦 Migrating ${collectionName} collection...`);
      
      const atlasModel = atlasModels[collectionName];
      const localModel = localModels[collectionName];
      
      const documents = await atlasModel.find({});
      console.log(`📊 Found ${documents.length} ${collectionName} documents`);
      
      if (documents.length > 0) {
        await localModel.insertMany(documents);
        console.log(`✅ Migrated ${documents.length} ${collectionName} documents`);
      }
    }
    
    console.log('🎉 Data migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    // Close connections
    if (atlasConnection) {
      await atlasConnection.close();
      console.log('🔌 Closed Atlas connection');
    }
    if (localConnection) {
      await localConnection.close();
      console.log('🔌 Closed Local connection');
    }
  }
}

// Process media files after migration
async function processAllMediaFiles() {
  console.log('📸 Processing all media files...');
  
  let localConnection;
  
  try {
    // Connect to Local MongoDB
    localConnection = await mongoose.createConnection(CONFIG.LOCAL_URI);
    
    const localModels = {
      User: localConnection.model('User', User.schema),
      Baba: localConnection.model('Baba', Baba.schema),
      BabaPost: localConnection.model('BabaPost', BabaPost.schema),
      BabaVideo: localConnection.model('BabaVideo', BabaVideo.schema),
      BabaStory: localConnection.model('BabaStory', BabaStory.schema),
      Post: localConnection.model('Post', Post.schema)
    };
    
    // Process each collection
    const results = {};
    
    for (const [name, model] of Object.entries(localModels)) {
      const userIdField = name === 'Baba' ? 'babaId' : 'userId';
      results[name] = await processMediaFiles(model, name, userIdField);
    }
    
    // Summary
    console.log('\n📊 Media Processing Summary:');
    let totalProcessed = 0;
    let totalErrors = 0;
    
    for (const [collection, result] of Object.entries(results)) {
      console.log(`${collection}: ${result.processedCount} processed, ${result.errorCount} errors`);
      totalProcessed += result.processedCount;
      totalErrors += result.errorCount;
    }
    
    console.log(`\n🎯 Total: ${totalProcessed} processed, ${totalErrors} errors`);
    
  } catch (error) {
    console.error('❌ Media processing failed:', error);
    throw error;
  } finally {
    if (localConnection) {
      await localConnection.close();
    }
  }
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting MongoDB Migration Process...');
    console.log('📋 Configuration:');
    console.log(`   Atlas URI: ${CONFIG.ATLAS_URI.replace(/\/\/.*@/, '//***:***@')}`);
    console.log(`   Local URI: ${CONFIG.LOCAL_URI}`);
    console.log(`   Media Path: ${CONFIG.MEDIA_BASE_PATH}`);
    
    // Initialize models
    await initializeModels();
    
    // Create directory structure
    await createDirectoryStructure();
    
    // Migrate data
    await migrateData();
    
    // Process media files
    await processAllMediaFiles();
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('📁 Check your public/assets folder for organized media files');
    console.log('🗄️ Your local MongoDB now contains all migrated data');
    
  } catch (error) {
    console.error('❌ Migration process failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  migrateData,
  processAllMediaFiles,
  createDirectoryStructure,
  CONFIG
};
