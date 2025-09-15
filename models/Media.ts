import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  // Legacy Cloudinary fields (keeping for backward compatibility)
  publicId: {
    type: String,
    required: false, // Made optional for local storage
    unique: false // Made non-unique for local storage
  },
  url: {
    type: String,
    required: false // Made optional for local storage
  },
  secureUrl: {
    type: String,
    required: false // Made optional for local storage
  },
  
  // Local storage fields
  fileName: {
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
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  
  // Common fields
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
  storageType: {
    type: String,
    enum: ['cloudinary', 'local'],
    default: 'local'
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
