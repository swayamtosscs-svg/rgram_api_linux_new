import mongoose from 'mongoose';
require('dotenv').config({ path: '.env.local' });

// Try to get MongoDB URI from environment, with fallback to local MongoDB
let MONGODB_URI: string = process.env.MONGODB_URI || 'mongodb://swayamUser:swayamPass@localhost:27017/swayam?authSource=admin';

console.log('🔍 Environment check:');
console.log('MONGODB_URI from env:', MONGODB_URI);
console.log('NODE_ENV:', process.env.NODE_ENV);

// If no MONGODB_URI is set in environment, use local MongoDB
if (!process.env.MONGODB_URI) {
  console.log('📝 Using local MongoDB (mongodb://localhost:27017/api_rgram)');
  console.log('💡 To use MongoDB Atlas, set MONGODB_URI in .env.local');
}

// Ensure MONGODB_URI is defined
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined');
}

console.log('🔗 Attempting to connect to MongoDB...');

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000, // Reduced to 5 seconds for faster failure
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      family: 4, // Force IPv4
      retryWrites: true,
      w: 1 as const,
      retryReads: true,
      maxIdleTimeMS: 30000,
      heartbeatFrequencyMS: 10000,
      // Remove deprecated options
      // useNewUrlParser: true, // Deprecated
      // useUnifiedTopology: true // Deprecated
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ Connected to MongoDB');
      
      // Ensure models are registered
      require('./models/User');
      require('./models/Post');
      require('./models/BabaPage');
      require('./models/BabaPost');
      require('./models/BabaVideo');
      require('./models/BabaStory');
      require('./models/Like');
      require('./models/Follow');
      require('./models/UserAssets');
      require('./models/Admin');
      require('./models/Verification');
      require('./models/Notification');
      require('./models/BlacklistedToken');
      
      return mongoose;
    }).catch((error) => {
      console.error('❌ MongoDB connection error:', error.message);
      console.log('💡 To fix this issue:');
      console.log('1. Install MongoDB locally: https://www.mongodb.com/try/download/community');
      console.log('2. Start MongoDB service');
      console.log('3. Or set up MongoDB Atlas and configure MONGODB_URI in .env.local');
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
