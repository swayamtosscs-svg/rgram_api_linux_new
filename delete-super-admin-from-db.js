#!/usr/bin/env node

const mongoose = require('mongoose');

// MongoDB connection string from your .env.local
const MONGODB_URI = 'mongodb://swayamUser:swayamPass@localhost:27017/swayam?authSource=admin';

// User schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  fullName: String,
  role: String,
  isActive: Boolean,
  isVerified: Boolean
});

// Admin schema
const adminSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  role: String,
  permissions: Object,
  isActive: Boolean
});

const User = mongoose.model('User', userSchema);
const Admin = mongoose.model('Admin', adminSchema);

async function deleteSuperAdmin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('🔍 Finding super admin records...');
    
    // Find super admin
    const superAdmin = await Admin.findOne({ 
      role: 'super_admin', 
      isActive: true 
    });
    
    if (!superAdmin) {
      console.log('❌ No super admin found in database');
      return;
    }

    console.log('📋 Found super admin:');
    console.log(`Admin ID: ${superAdmin._id}`);
    console.log(`User ID: ${superAdmin.user}`);
    console.log(`Role: ${superAdmin.role}\n`);

    // Find the user record
    const user = await User.findById(superAdmin.user);
    if (user) {
      console.log('👤 Found user record:');
      console.log(`Username: ${user.username}`);
      console.log(`Email: ${user.email}`);
      console.log(`Full Name: ${user.fullName}`);
      console.log(`Role: ${user.role}\n`);
    }

    console.log('🗑️  Deleting super admin records...');
    
    // Delete admin record
    await Admin.findByIdAndDelete(superAdmin._id);
    console.log('✅ Deleted admin record');
    
    // Delete user record
    if (user) {
      await User.findByIdAndDelete(user._id);
      console.log('✅ Deleted user record');
    }

    console.log('\n🎉 Super admin successfully deleted from database!');
    console.log('💡 You can now create a new super admin using the creation script.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

deleteSuperAdmin();
