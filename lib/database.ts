import mongoose from 'mongoose';
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

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
      require('./models/UserAssets');
      
      return mongoose;
    }).catch((error) => {
      console.error('❌ MongoDB connection error:', error);
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
