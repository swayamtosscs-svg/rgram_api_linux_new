#!/usr/bin/env node

const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

// User Schema
const UserSchema = new mongoose.Schema({
  email: String,
  username: String,
  fullName: String,
  password: String,
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

async function generateFreshToken() {
  try {
    console.log('🔄 Generating Fresh Password Reset Token...\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Find user by email
    const userEmail = 'swayam121july@gmail.com';
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      console.log('❌ User not found:', userEmail);
      return;
    }
    
    console.log('👤 Found user:', user.email);
    
    // Remove old tokens for this user
    await PasswordResetToken.deleteMany({ userId: user._id });
    console.log('🗑️  Removed old tokens');
    
    // Generate new token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    
    // Create new token
    const resetTokenData = new PasswordResetToken({
      userId: user._id,
      token: resetToken,
      expiresAt,
      isUsed: false
    });
    
    await resetTokenData.save();
    console.log('✅ New token created');
    
    // Generate reset URL
    const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}&email=${encodeURIComponent(userEmail)}`;
    
    console.log('\n🎯 Fresh Reset Token Generated:');
    console.log(`Token: ${resetToken}`);
    console.log(`Expires: ${expiresAt}`);
    console.log(`Reset URL: ${resetUrl}`);
    
    console.log('\n📧 You can now:');
    console.log('1. Copy the reset URL above');
    console.log('2. Paste it in your browser');
    console.log('3. Test the password reset functionality');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

generateFreshToken();
