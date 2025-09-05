import mongoose from 'mongoose';

const babaSchema = new mongoose.Schema({
  babaId: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  babaName: {
    type: String,
    required: true,
    trim: true
  },
  spiritualName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: [1000, 'Description must be less than 1000 characters']
  },
  avatar: {
    type: String,
    default: ''
  },
  coverImage: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    trim: true
  },
  ashram: {
    type: String,
    trim: true
  },
  followersCount: {
    type: Number,
    default: 0,
    min: 0
  },
  postsCount: {
    type: Number,
    default: 0,
    min: 0
  },
  videosCount: {
    type: Number,
    default: 0,
    min: 0
  },
  storiesCount: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  socialLinks: {
    website: String,
    facebook: String,
    instagram: String,
    youtube: String,
    twitter: String
  },
  contactInfo: {
    email: String,
    phone: String,
    address: String
  },
  spiritualTeachings: [String],
  languages: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
babaSchema.index({ babaId: 1 });
babaSchema.index({ babaName: 1 });
babaSchema.index({ spiritualName: 1 });
babaSchema.index({ isActive: 1 });
babaSchema.index({ followersCount: -1 });
babaSchema.index({ createdAt: -1 });

// Update lastActive when document is accessed
babaSchema.pre('findOneAndUpdate', function() {
  this.set({ lastActive: new Date() });
});

babaSchema.pre('find', function() {
  this.set({ lastActive: new Date() });
});

export default mongoose.models.Baba || mongoose.model('Baba', babaSchema);
