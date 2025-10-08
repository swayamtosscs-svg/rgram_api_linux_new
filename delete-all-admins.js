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

async function deleteAllAdmins() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('🔍 Finding all admin records...');
    
    // Find all admin records
    const adminRecords = await Admin.find({});
    console.log(`Found ${adminRecords.length} admin records:`);
    
    adminRecords.forEach((admin, index) => {
      console.log(`\n${index + 1}. Admin Record:`);
      console.log(`   ID: ${admin._id}`);
      console.log(`   User ID: ${admin.user}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Is Active: ${admin.isActive}`);
    });

    // Find all users with admin roles
    const adminUsers = await User.find({ 
      $or: [
        { role: { $in: ['admin', 'super_admin', 'moderator'] } },
        { isAdmin: true }
      ]
    });
    
    console.log(`\nFound ${adminUsers.length} users with admin roles:`);
    adminUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. Admin User:`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Is Admin: ${user.isAdmin}`);
    });

    if (adminRecords.length === 0 && adminUsers.length === 0) {
      console.log('\n✅ No admin records found to delete.');
      return;
    }

    console.log('\n🗑️  Deleting all admin records...');
    
    // Delete all admin records
    if (adminRecords.length > 0) {
      await Admin.deleteMany({});
      console.log(`✅ Deleted ${adminRecords.length} admin records`);
    }
    
    // Update all admin users to regular users
    if (adminUsers.length > 0) {
      await User.updateMany(
        { 
          $or: [
            { role: { $in: ['admin', 'super_admin', 'moderator'] } },
            { isAdmin: true }
          ]
        },
        { 
          $set: { 
            role: 'user',
            isAdmin: false
          }
        }
      );
      console.log(`✅ Updated ${adminUsers.length} admin users to regular users`);
    }

    console.log('\n🎉 All admins have been deleted successfully!');
    console.log('💡 All admin users have been converted to regular users.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

deleteAllAdmins();
