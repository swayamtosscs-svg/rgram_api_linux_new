import mongoose, { Document, Schema } from 'mongoose';

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
  type: 'post' | 'reel';
  likes: mongoose.Types.ObjectId[];
  likesCount: number;
  comments: IComment[];
  commentsCount: number;
  shares: mongoose.Types.ObjectId[];
  sharesCount: number;
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
  type: {
    type: String,
    enum: ['post', 'reel'],
    default: 'post'
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

// Virtual for checking if post has content or images
PostSchema.virtual('hasContent').get(function() {
  return !!(this.content || (this.images && this.images.length > 0));
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

export default mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);
