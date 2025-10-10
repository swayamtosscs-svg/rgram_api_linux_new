import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IUserAssets extends Document {
  _id: string;
  userId: Types.ObjectId;
  fileName: string;
  originalName: string;
  filePath: string;
  publicUrl: string;
  fileType: 'image' | 'video';
  mimeType: string;
  fileSize: number;
  width?: number;
  height?: number;
  duration?: number;
  title?: string;
  description?: string;
  tags?: string[];
  isPublic: boolean;
  likes: Types.ObjectId[];
  likesCount: number;
  uploadedAt: Date;
  lastAccessed: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserAssetsSchema = new Schema<IUserAssets>({
  userId: {
    type: Schema.Types.ObjectId,
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
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  likesCount: {
    type: Number,
    default: 0,
    min: 0
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
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete (ret as any)._id;
      delete (ret as any).__v;
      return ret;
    }
  }
});

// Index for better query performance
UserAssetsSchema.index({ userId: 1, fileType: 1 });
UserAssetsSchema.index({ userId: 1, uploadedAt: -1 });
UserAssetsSchema.index({ filePath: 1 }, { unique: true });

// Update lastAccessed when document is accessed
UserAssetsSchema.pre('findOneAndUpdate', function() {
  this.set({ lastAccessed: new Date() });
});

UserAssetsSchema.pre('find', function() {
  this.set({ lastAccessed: new Date() });
});

const UserAssets: Model<IUserAssets> = mongoose.models.UserAssets || mongoose.model<IUserAssets>('UserAssets', UserAssetsSchema);
export default UserAssets;
