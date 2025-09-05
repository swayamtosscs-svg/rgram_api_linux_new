import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
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
  fullUrl: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  tags: [String],
  dimensions: {
    width: {
      type: Number,
      default: 0
    },
    height: {
      type: Number,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
imageSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for better query performance
imageSchema.index({ username: 1, createdAt: -1 });
imageSchema.index({ uploadedBy: 1, createdAt: -1 });

export default mongoose.models.Image || mongoose.model('Image', imageSchema);
