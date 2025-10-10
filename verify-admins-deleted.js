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
  isVerified: Boolean,
  isAdmin: Boolean
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

async function verifyAdminsDeleted() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('🔍 Verifying admin deletion...');
    
    // Check for admin records
    const adminRecords = await Admin.find({});
    console.log(`Admin records remaining: ${adminRecords.length}`);
    
    // Check for admin users
    const adminUsers = await User.find({ 
      $or: [
        { role: { $in: ['admin', 'super_admin', 'moderator'] } },
        { isAdmin: true }
      ]
    });
    
    console.log(`Users with admin roles remaining: ${adminUsers.length}`);
    
    if (adminRecords.length === 0 && adminUsers.length === 0) {
      console.log('\n✅ SUCCESS: All admins have been completely removed!');
      console.log('🎉 Database is now clean of all admin accounts.');
    } else {
      console.log('\n⚠️  WARNING: Some admin records still exist:');
      
      if (adminRecords.length > 0) {
        console.log('\nRemaining admin records:');
        adminRecords.forEach((admin, index) => {
          console.log(`${index + 1}. ID: ${admin._id}, Role: ${admin.role}`);
        });
      }
      
      if (adminUsers.length > 0) {
        console.log('\nRemaining admin users:');
        adminUsers.forEach((user, index) => {
          console.log(`${index + 1}. ${user.username} (${user.email}) - Role: ${user.role}, IsAdmin: ${user.isAdmin}`);
        });
      }
    }

    // Show all users for reference
    const allUsers = await User.find({});
    console.log(`\n📊 Total users in database: ${allUsers.length}`);
    
    console.log('\n📋 All users:');
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} (${user.email}) - Role: ${user.role || 'undefined'}, IsAdmin: ${user.isAdmin}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

verifyAdminsDeleted();
