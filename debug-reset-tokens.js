#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// User Schema
const UserSchema = new mongoose.Schema({
  email: String,
  username: String,
  fullName: String,
  password: String,
  // Add other fields as needed
});

// Password Reset Token Schema
const PasswordResetTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', UserSchema);
const PasswordResetToken = mongoose.model('PasswordResetToken', PasswordResetTokenSchema);

async function debugTokens() {
  try {
    console.log('🔍 Debugging Password Reset Tokens...\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Get all tokens
    const allTokens = await PasswordResetToken.find({}).populate('userId', 'email username');
    
    console.log(`📊 Total tokens in database: ${allTokens.length}\n`);
    
    if (allTokens.length === 0) {
      console.log('⚠️  No tokens found in database');
      console.log('💡 Try sending a forgot password email first');
      return;
    }
    
    // Show all tokens
    allTokens.forEach((token, index) => {
      console.log(`Token ${index + 1}:`);
      console.log(`  ID: ${token._id}`);
      console.log(`  Token: ${token.token.substring(0, 20)}...`);
      console.log(`  User: ${token.userId?.email || 'Unknown'}`);
      console.log(`  Created: ${token.createdAt}`);
      console.log(`  Expires: ${token.expiresAt}`);
      console.log(`  Is Used: ${token.isUsed}`);
      console.log(`  Is Expired: ${new Date() > token.expiresAt ? 'Yes' : 'No'}`);
      console.log('');
    });
    
    // Find valid tokens
    const validTokens = await PasswordResetToken.find({
      isUsed: false,
      expiresAt: { $gt: new Date() }
    }).populate('userId', 'email username');
    
    console.log(`✅ Valid tokens: ${validTokens.length}`);
    
    if (validTokens.length > 0) {
      console.log('\n🎯 Latest valid token:');
      const latestToken = validTokens[validTokens.length - 1];
      console.log(`  Token: ${latestToken.token}`);
      console.log(`  User: ${latestToken.userId?.email}`);
      console.log(`  Expires: ${latestToken.expiresAt}`);
      
      // Test the token
      console.log('\n🧪 Testing token validation...');
      const testResponse = await fetch('http://localhost:3000/api/auth/validate-reset-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: latestToken.token }),
      });
      
      const testResult = await testResponse.json();
      console.log('Test result:', testResult);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

debugTokens();
