import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IComment {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBabaStory extends Document {
  _id: string;
  babaPageId: Types.ObjectId;
  content?: string;
  media?: {
    type: 'image' | 'video';
    url: string;
    filename: string;
    size: number;
    mimeType: string;
    publicId?: string;
  };
  viewsCount: number;
  likes: Types.ObjectId[];
  likesCount: number;
  comments: IComment[];
  commentsCount: number;
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BabaStorySchema = new Schema<IBabaStory>({
  babaPageId: {
    type: Schema.Types.ObjectId,
    ref: 'BabaPage',
    required: true
  },
  content: {
    type: String,
    maxlength: [500, 'Content must be less than 500 characters'],
    default: ''
  },
  media: {
    type: {
      type: String,
      enum: ['image', 'video'],
      default: 'image'
    },
    url: {
      type: String,
      default: ''
    },
    filename: {
      type: String,
      default: ''
    },
    size: {
      type: Number,
      default: 0
    },
    mimeType: {
      type: String,
      default: ''
    },
    publicId: {
      type: String,
      required: false
    }
  },
  viewsCount: {
    type: Number,
    default: 0,
    min: 0
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
  comments: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Comment must be less than 500 characters']
    }
  }],
  commentsCount: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    },
    index: { expireAfterSeconds: 0 }
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
BabaStorySchema.index({ babaPageId: 1, createdAt: -1 });
BabaStorySchema.index({ createdAt: -1 });

const BabaStory: Model<IBabaStory> = mongoose.models.BabaStory || mongoose.model<IBabaStory>('BabaStory', BabaStorySchema);
export default BabaStory;
