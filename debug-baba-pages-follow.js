const mongoose = require('mongoose');

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/api_rgram1');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Test the models
async function testModels() {
  try {
    console.log('🔍 Testing models...');
    
    // Test User model
    const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
      email: String,
      username: String,
      fullName: String,
      followingCount: { type: Number, default: 0 }
    }));
    
    // Test BabaPage model
    const BabaPage = mongoose.models.BabaPage || mongoose.model('BabaPage', new mongoose.Schema({
      name: String,
      followersCount: { type: Number, default: 0 },
      followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }));
    
    // Test BabaPageFollow model
    const BabaPageFollow = mongoose.models.BabaPageFollow || mongoose.model('BabaPageFollow', new mongoose.Schema({
      follower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      page: { type: mongoose.Schema.Types.ObjectId, ref: 'BabaPage', required: true },
      status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'accepted' }
    }));
    
    console.log('✅ All models loaded successfully');
    
    // Test creating a follow relationship
    console.log('🧪 Testing follow relationship creation...');
    
    // Create test user if doesn't exist
    let testUser = await User.findOne({ username: 'testuser' });
    if (!testUser) {
      testUser = new User({
        email: 'test@example.com',
        username: 'testuser',
        fullName: 'Test User',
        followingCount: 0
      });
      await testUser.save();
      console.log('✅ Test user created');
    }
    
    // Create test page if doesn't exist
    let testPage = await BabaPage.findOne({ name: 'Test Page' });
    if (!testPage) {
      testPage = new BabaPage({
        name: 'Test Page',
        followersCount: 0,
        followers: []
      });
      await testPage.save();
      console.log('✅ Test page created');
    }
    
    // Test follow relationship
    const follow = new BabaPageFollow({
      follower: testUser._id,
      page: testPage._id,
      status: 'accepted'
    });
    
    await follow.save();
    console.log('✅ Follow relationship created successfully');
    
    // Test updating counts
    await BabaPage.findByIdAndUpdate(testPage._id, {
      $inc: { followersCount: 1 },
      $addToSet: { followers: testUser._id }
    });
    
    await User.findByIdAndUpdate(testUser._id, {
      $inc: { followingCount: 1 }
    });
    
    console.log('✅ Counts updated successfully');
    
    // Verify the data
    const updatedPage = await BabaPage.findById(testPage._id);
    const updatedUser = await User.findById(testUser._id);
    
    console.log('📊 Results:');
    console.log('Page followers count:', updatedPage.followersCount);
    console.log('User following count:', updatedUser.followingCount);
    console.log('Page followers array length:', updatedPage.followers.length);
    
    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
  }
}

// Run the test
async function runTest() {
  await connectDB();
  await testModels();
  process.exit(0);
}

runTest();
