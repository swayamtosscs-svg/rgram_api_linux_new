import mongoose from 'mongoose';

const babaPostSchema = new mongoose.Schema({
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
  content: {
    type: String,
    required: true,
    maxlength: [5000, 'Content must be less than 5000 characters']
  },
  imageUrl: {
    type: String,
    default: ''
  },
  imagePath: {
    type: String,
    default: ''
  },
  publicUrl: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    maxlength: [50, 'Each tag must be less than 50 characters']
  }],
  category: {
    type: String,
    enum: ['spiritual', 'teaching', 'blessing', 'announcement', 'general'],
    default: 'spiritual'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  likesCount: {
    type: Number,
    default: 0,
    min: 0
  },
  commentsCount: {
    type: Number,
    default: 0,
    min: 0
  },
  sharesCount: {
    type: Number,
    default: 0,
    min: 0
  },
  viewsCount: {
    type: Number,
    default: 0,
    min: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  scheduledAt: {
    type: Date
  },
  publishedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
babaPostSchema.index({ babaId: 1, publishedAt: -1 });
babaPostSchema.index({ category: 1 });
babaPostSchema.index({ tags: 1 });
babaPostSchema.index({ featured: 1 });
babaPostSchema.index({ isPublic: 1 });
babaPostSchema.index({ likesCount: -1 });

export default mongoose.models.BabaPost || mongoose.model('BabaPost', babaPostSchema);
