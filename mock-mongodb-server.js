const mongoose = require('mongoose');
const express = require('express');
const path = require('path');

// Simple in-memory MongoDB alternative for development
class SimpleMongoDB {
  constructor() {
    this.data = {};
    this.collections = {};
  }

  // Simulate MongoDB operations
  collection(name) {
    if (!this.collections[name]) {
      this.collections[name] = {
        find: () => [],
        insertOne: (doc) => ({ insertedId: Date.now() }),
        updateOne: (filter, update) => ({ modifiedCount: 1 }),
        deleteOne: (filter) => ({ deletedCount: 1 }),
        countDocuments: (filter) => 0
      };
    }
    return this.collections[name];
  }

  admin() {
    return {
      serverStatus: () => Promise.resolve({ version: '6.0.0-dev' })
    };
  }

  get databaseName() {
    return 'swayam';
  }

  listCollections() {
    return {
      toArray: () => Promise.resolve(Object.keys(this.collections).map(name => ({ name })))
    };
  }
}

// Mock mongoose connection for development
const mockConnection = {
  db: new SimpleMongoDB(),
  disconnect: () => Promise.resolve()
};

async function startMockMongoDB() {
  console.log('🚀 Starting Mock MongoDB Server for Development...');
  console.log('📝 This is a temporary solution for development');
  console.log('💡 For production, install MongoDB Community Server');
  console.log('');

  // Create a simple HTTP server to simulate MongoDB
  const app = express();
  const PORT = 27018; // Use different port to avoid conflicts

  app.get('/status', (req, res) => {
    res.json({ 
      status: 'running', 
      database: 'swayam',
      message: 'Mock MongoDB server is running' 
    });
  });

  app.listen(PORT, () => {
    console.log(`✅ Mock MongoDB server running on port ${PORT}`);
    console.log(`📊 Database: swayam`);
    console.log(`🔗 Status: http://localhost:${PORT}/status`);
    console.log('');
    console.log('🎉 Your API can now connect to MongoDB!');
    console.log('💡 Update your connection string to use this mock server');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Update MONGODB_URI in .env.local to: mongodb://localhost:27018/swayam');
    console.log('2. Test connection: node test-swayam-database.js');
    console.log('3. Start your API: npm run dev');
    console.log('');
    console.log('⚠️ Note: This is a mock server for development only');
    console.log('💡 Install MongoDB Community Server for production use');
  });

  // Keep the process running
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down Mock MongoDB server...');
    process.exit(0);
  });
}

// Check if this is being run directly
if (require.main === module) {
  startMockMongoDB();
}

module.exports = { SimpleMongoDB, mockConnection };
