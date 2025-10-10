import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IComment {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBabaVideo extends Document {
  _id: string;
  babaPageId: Types.ObjectId;
  title: string;
  description?: string;
  video?: {
    url: string;
    fileName: string;
    filePath?: string;
    size: number;
    duration: number;
    mimeType: string;
    dimensions?: {
      width: number;
      height: number;
    };
    storageType?: 'cloudinary' | 'local';
    // Legacy fields for backward compatibility
    filename?: string;
    publicId?: string;
  };
  thumbnail?: {
    url: string;
    fileName: string;
    filePath?: string;
    size: number;
    mimeType: string;
    dimensions?: {
      width: number;
      height: number;
    };
    storageType?: 'cloudinary' | 'local';
    // Legacy fields for backward compatibility
    filename?: string;
    publicId?: string;
  };
  category: 'reel' | 'video';
  viewsCount: number;
  likes: Types.ObjectId[];
  likesCount: number;
  comments: IComment[];
  commentsCount: number;
  sharesCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BabaVideoSchema = new Schema<IBabaVideo>({
  babaPageId: {
    type: Schema.Types.ObjectId,
    ref: 'BabaPage',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Title must be less than 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description must be less than 1000 characters'],
    default: ''
  },
  video: {
    url: {
      type: String,
      default: ''
    },
    fileName: {
      type: String,
      default: ''
    },
    filePath: {
      type: String,
      required: false
    },
    size: {
      type: Number,
      default: 0
    },
    duration: {
      type: Number,
      default: 0
    },
    mimeType: {
      type: String,
      default: ''
    },
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
    storageType: {
      type: String,
      enum: ['cloudinary', 'local'],
      default: 'local'
    },
    // Legacy fields for backward compatibility
    filename: {
      type: String,
      required: false
    },
    publicId: {
      type: String,
      required: false
    }
  },
  thumbnail: {
    url: {
      type: String,
      default: ''
    },
    fileName: {
      type: String,
      default: ''
    },
    filePath: {
      type: String,
      required: false
    },
    size: {
      type: Number,
      default: 0
    },
    mimeType: {
      type: String,
      default: ''
    },
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
    storageType: {
      type: String,
      enum: ['cloudinary', 'local'],
      default: 'local'
    },
    // Legacy fields for backward compatibility
    filename: {
      type: String,
      required: false
    },
    publicId: {
      type: String,
      required: false
    }
  },
  category: {
    type: String,
    enum: ['reel', 'video'],
    required: true
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
BabaVideoSchema.index({ babaPageId: 1, createdAt: -1 });
BabaVideoSchema.index({ category: 1, createdAt: -1 });
BabaVideoSchema.index({ createdAt: -1 });

const BabaVideo: Model<IBabaVideo> = mongoose.models.BabaVideo || mongoose.model<IBabaVideo>('BabaVideo', BabaVideoSchema);
export default BabaVideo;
