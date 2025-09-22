import mongoose from 'mongoose';
require('dotenv').config();

// Dynamic MongoDB URI selection based on environment
let MONGODB_URI: string;

if (process.env.NODE_ENV === 'production' || process.env.HOST_ENV === 'VPS') {
  // VPS MongoDB connection - using your VPS MongoDB server
  MONGODB_URI = process.env.MONGO_URI_VPS || 'mongodb://Toss:Toss%40123@103.14.120.163:27017/admin';
} else {
  // Local MongoDB connection
  MONGODB_URI = process.env.MONGO_URI_LOCAL || 'mongodb://Toss:Toss%40123@localhost:27017/admin';
}

console.log(`🔗 Connecting to MongoDB: ${MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`);  // Hide credentials in logs

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
declare global {
  var mongoose: {
    conn: any;
    promise: any;
  } | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (!cached) {
    cached = { conn: null, promise: null };
  }
  
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose;
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

export default dbConnect;
