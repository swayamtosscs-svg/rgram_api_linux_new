import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IComment {
  _id: string;
  author: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPost extends Document {
  _id: string;
  author: mongoose.Types.ObjectId;
  content: string;
  images: string[];
  videos: string[];
  externalUrls?: string[];
  type: 'post' | 'reel' | 'video';
  provider?: 'local' | 'youtube' | 'vimeo' | 'external';
  title?: string;
  description?: string;
  duration?: number;
  category?: string;
  religion?: string;
  likes: mongoose.Types.ObjectId[];
  likesCount: number;
  comments: IComment[];
  commentsCount: number;
  shares: mongoose.Types.ObjectId[];
  sharesCount: number;
  reported?: boolean;
  reportedAt?: Date;
  isRemoved?: boolean;
  removedReason?: string;
  removedBy?: mongoose.Types.ObjectId;
  removedAt?: Date;
  saves: mongoose.Types.ObjectId[];
  savesCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const CommentSchema = new Schema<IComment>({
  author: {
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
}, {
  timestamps: true
});

const PostSchema = new Schema<IPost>({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    trim: true,
    maxlength: [2000, 'Content must be less than 2000 characters']
  },
  images: [{
    type: String,
    trim: true
  }],
  videos: [{
    type: String,
    trim: true
  }],
  externalUrls: [{
    type: String,
    trim: true
  }],
  type: {
    type: String,
    enum: ['post', 'reel', 'video'],
    default: 'post'
  },
  provider: {
    type: String,
    enum: ['local', 'youtube', 'vimeo', 'external'],
    default: 'local'
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title must be less than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description must be less than 500 characters']
  },
  duration: {
    type: Number,
    min: 0,
    default: 0
  },
  category: {
    type: String,
    default: 'general',
    enum: ['general', 'entertainment', 'education', 'news', 'sports', 'music', 'gaming', 'lifestyle', 'technology']
  },
  religion: {
    type: String,
    maxlength: [50, 'Religion must be less than 50 characters'],
    default: ''
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
  comments: [CommentSchema],
  commentsCount: {
    type: Number,
    default: 0,
    min: 0
  },
  shares: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  sharesCount: {
    type: Number,
    default: 0,
    min: 0
  },
  saves: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  savesCount: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ createdAt: -1 });
PostSchema.index({ type: 1, createdAt: -1 });
PostSchema.index({ isActive: 1, createdAt: -1 });
PostSchema.index({ likes: 1 });

// Update counts when likes/comments/shares/saves change
PostSchema.pre('save', function(next) {
  if (this.isModified('likes')) {
    this.likesCount = this.likes.length;
  }
  if (this.isModified('comments')) {
    this.commentsCount = this.comments.length;
  }
  if (this.isModified('shares')) {
    this.sharesCount = this.shares.length;
  }
  if (this.isModified('saves')) {
    this.savesCount = this.saves.length;
  }
  next();
});

// Virtual for checking if post has content, images, or videos
PostSchema.virtual('hasContent').get(function() {
  return !!(
    this.content ||
    (this.images && this.images.length > 0) ||
    (this.videos && this.videos.length > 0) ||
    (this.externalUrls && this.externalUrls.length > 0)
  );
});

// Method to add like
PostSchema.methods.addLike = function(userId: string) {
  if (!this.likes.includes(userId)) {
    this.likes.push(userId);
    this.likesCount = this.likes.length;
  }
  return this.save();
};

// Method to remove like
PostSchema.methods.removeLike = function(userId: string) {
  this.likes = this.likes.filter((id: string) => id.toString() !== userId);
  this.likesCount = this.likes.length;
  return this.save();
};

// Method to add comment
PostSchema.methods.addComment = function(userId: string, content: string) {
  this.comments.push({
    author: userId,
    content: content.trim(),
    createdAt: new Date(),
    updatedAt: new Date()
  });
  this.commentsCount = this.comments.length;
  return this.save();
};

// Method to remove comment
PostSchema.methods.removeComment = function(commentId: string) {
  this.comments = this.comments.filter((comment: any) => comment._id.toString() !== commentId);
  this.commentsCount = this.comments.length;
  return this.save();
};

const Post: Model<IPost> = mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);
export default Post;
