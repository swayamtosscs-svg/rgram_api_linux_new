import mongoose from 'mongoose';

const userAssetsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  publicUrl: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  width: {
    type: Number
  },
  height: {
    type: Number
  },
  duration: {
    type: Number // For videos
  },
  title: {
    type: String,
    maxlength: [100, 'Title must be less than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description must be less than 500 characters']
  },
  tags: [{
    type: String,
    maxlength: [50, 'Each tag must be less than 50 characters']
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
userAssetsSchema.index({ userId: 1, fileType: 1 });
userAssetsSchema.index({ userId: 1, uploadedAt: -1 });
userAssetsSchema.index({ filePath: 1 }, { unique: true });

// Update lastAccessed when document is accessed
userAssetsSchema.pre('findOneAndUpdate', function() {
  this.set({ lastAccessed: new Date() });
});

userAssetsSchema.pre('find', function() {
  this.set({ lastAccessed: new Date() });
});

export default mongoose.models.UserAssets || mongoose.model('UserAssets', userAssetsSchema);
