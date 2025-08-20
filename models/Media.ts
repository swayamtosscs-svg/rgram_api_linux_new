import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  publicId: {
    type: String,
    required: true,
    unique: true
  },
  url: {
    type: String,
    required: true
  },
  secureUrl: {
    type: String,
    required: true
  },
  format: {
    type: String,
    required: true
  },
  resourceType: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  width: Number,
  height: Number,
  duration: Number,
  title: String,
  description: String,
  tags: [String],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
mediaSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Media || mongoose.model('Media', mediaSchema);
