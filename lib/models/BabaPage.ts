import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IBabaPage extends Document {
  _id: string;
  name: string;
  description?: string;
  avatar?: string;
  coverImage?: string;
  location?: string;
  religion?: string;
  website?: string;
  followersCount: number;
  postsCount: number;
  videosCount: number;
  storiesCount: number;
  followers: mongoose.Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BabaPageSchema = new Schema<IBabaPage>({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name must be less than 100 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description must be less than 1000 characters'],
    default: ''
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
    maxlength: [100, 'Location must be less than 100 characters'],
    default: ''
  },
  religion: {
    type: String,
    maxlength: [50, 'Religion must be less than 50 characters'],
    default: ''
  },
  website: {
    type: String,
    default: ''
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
  followers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
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
BabaPageSchema.index({ createdAt: -1 });
BabaPageSchema.index({ name: 'text', description: 'text' });

const BabaPage: Model<IBabaPage> = mongoose.models.BabaPage || mongoose.model<IBabaPage>('BabaPage', BabaPageSchema);
export default BabaPage;
