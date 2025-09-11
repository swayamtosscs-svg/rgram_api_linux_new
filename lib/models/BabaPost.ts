import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IComment {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBabaPost extends Document {
  _id: string;
  babaPageId: Types.ObjectId;
  content: string;
  media: {
    type: 'image' | 'video';
    url: string;
    filename: string;
    size: number;
    mimeType: string;
    publicId?: string;
  }[];
  likes: Types.ObjectId[];
  likesCount: number;
  comments: IComment[];
  commentsCount: number;
  sharesCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BabaPostSchema = new Schema<IBabaPost>({
  babaPageId: {
    type: Schema.Types.ObjectId,
    ref: 'BabaPage',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: [2000, 'Content must be less than 2000 characters']
  },
  media: [{
    type: {
      type: String,
      enum: ['image', 'video'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: false
    }
  }],
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
  sharesCount: {
    type: Number,
    default: 0,
    min: 0
  },
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
BabaPostSchema.index({ babaPageId: 1, createdAt: -1 });
BabaPostSchema.index({ createdAt: -1 });

const BabaPost: Model<IBabaPost> = mongoose.models.BabaPost || mongoose.model<IBabaPost>('BabaPost', BabaPostSchema);
export default BabaPost;
