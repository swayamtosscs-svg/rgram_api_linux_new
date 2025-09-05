import mongoose from 'mongoose';

const babaStorySchema = new mongoose.Schema({
  babaId: {
    type: String,
    required: true,
    ref: 'Baba',
    index: true
  },
  content: {
    type: String,
    maxlength: [1000, 'Content must be less than 1000 characters']
  },
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  mediaUrl: {
    type: String,
    required: true
  },
  mediaPath: {
    type: String,
    required: true
  },
  publicUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String,
    default: ''
  },
  thumbnailPath: {
    type: String,
    default: ''
  },
  duration: {
    type: Number // in seconds, for videos
  },
  fileSize: {
    type: Number // in bytes
  },
  format: {
    type: String
  },
  category: {
    type: String,
    enum: ['daily', 'blessing', 'teaching', 'announcement', 'general'],
    default: 'daily'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  viewsCount: {
    type: Number,
    default: 0,
    min: 0
  },
  likesCount: {
    type: Number,
    default: 0,
    min: 0
  },
  sharesCount: {
    type: Number,
    default: 0,
    min: 0
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Stories expire after 24 hours
      return new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
  },
  publishedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
babaStorySchema.index({ babaId: 1, publishedAt: -1 });
babaStorySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index - MongoDB will auto-delete after 24 hours
babaStorySchema.index({ category: 1 });
babaStorySchema.index({ isPublic: 1 });
babaStorySchema.index({ mediaType: 1 });
babaStorySchema.index({ createdAt: 1 }); // For cleanup queries

// Ensure stories are automatically deleted after 24 hours
babaStorySchema.pre('save', function(next) {
  if (this.isNew) {
    // Set expiration to exactly 24 hours from now
    this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
  next();
});

// Clean up expired stories in queries (additional safety)
babaStorySchema.pre('find', function() {
  this.where({ expiresAt: { $gt: new Date() } });
});

babaStorySchema.pre('findOne', function() {
  this.where({ expiresAt: { $gt: new Date() } });
});

babaStorySchema.pre('countDocuments', function() {
  this.where({ expiresAt: { $gt: new Date() } });
});

export default mongoose.models.BabaStory || mongoose.model('BabaStory', babaStorySchema);
