import mongoose from 'mongoose';

const babaVideoSchema = new mongoose.Schema({
  babaId: {
    type: String,
    required: true,
    ref: 'Baba',
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: [200, 'Title must be less than 200 characters']
  },
  description: {
    type: String,
    maxlength: [2000, 'Description must be less than 2000 characters']
  },
  videoUrl: {
    type: String,
    required: true
  },
  videoPath: {
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
    type: Number, // in seconds
    required: true
  },
  fileSize: {
    type: Number, // in bytes
    required: true
  },
  resolution: {
    width: Number,
    height: Number
  },
  format: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['satsang', 'teaching', 'blessing', 'kirtan', 'discourse', 'general'],
    default: 'satsang'
  },
  tags: [{
    type: String,
    maxlength: [50, 'Each tag must be less than 50 characters']
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  isLive: {
    type: Boolean,
    default: false
  },
  likesCount: {
    type: Number,
    default: 0,
    min: 0
  },
  viewsCount: {
    type: Number,
    default: 0,
    min: 0
  },
  sharesCount: {
    type: Number,
    default: 0,
    min: 0
  },
  commentsCount: {
    type: Number,
    default: 0,
    min: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
babaVideoSchema.index({ babaId: 1, publishedAt: -1 });
babaVideoSchema.index({ category: 1 });
babaVideoSchema.index({ tags: 1 });
babaVideoSchema.index({ featured: 1 });
babaVideoSchema.index({ isPublic: 1 });
babaVideoSchema.index({ isLive: 1 });
babaVideoSchema.index({ viewsCount: -1 });

export default mongoose.models.BabaVideo || mongoose.model('BabaVideo', babaVideoSchema);
