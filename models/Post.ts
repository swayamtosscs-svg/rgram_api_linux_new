import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
  _id: string;
  author: mongoose.Types.ObjectId;
  content: string;
  type: 'post' | 'reel' | 'story';
  title?: string;
  description?: string;
  category?: string;
  religion?: string;
  location?: string;
  
  // Media fields
  media: Array<{
    type: 'image' | 'video' | 'audio';
    url: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    dimensions?: {
      width: number;
      height: number;
    };
    duration?: number;
    thumbnailUrl?: string;
    storageType: 'local' | 'cloudinary';
  }>;
  
  // Song/Audio for reels
  song?: {
    title: string;
    artist: string;
    url: string;
    fileName: string;
    filePath: string;
    duration: number;
    thumbnailUrl?: string;
    storageType: 'local' | 'cloudinary';
  };
  
  // Social features
  mentions: mongoose.Types.ObjectId[];
  hashtags: string[];
  tags: string[];
  collaborators: mongoose.Types.ObjectId[];
  
  // Interaction counts
  likes: mongoose.Types.ObjectId[];
  likesCount: number;
  comments: mongoose.Types.ObjectId[];
  commentsCount: number;
  shares: mongoose.Types.ObjectId[];
  sharesCount: number;
  saves: mongoose.Types.ObjectId[];
  savesCount: number;
  views: mongoose.Types.ObjectId[];
  viewsCount: number;
  
  // Collaboration
  collaborationRequests: Array<{
    userId: mongoose.Types.ObjectId;
    message: string;
    status: 'pending' | 'accepted' | 'rejected';
    requestedAt: Date;
    respondedAt?: Date;
  }>;
  
  // Privacy and settings
  isPublic: boolean;
  isActive: boolean;
  allowComments: boolean;
  allowLikes: boolean;
  allowShares: boolean;
  allowSaves: boolean;
  
  // Moderation
  reported: boolean;
  reportedBy?: mongoose.Types.ObjectId[];
  moderated: boolean;
  moderatedBy?: mongoose.Types.ObjectId;
  moderatedAt?: Date;
  
  // Reel specific
  isReel?: boolean;
  reelDuration?: number;
  
  // Story specific
  isStory?: boolean;
  storyExpiry?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
}

const PostSchema = new Schema<IPost>({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true,
    maxlength: [5000, 'Content must be less than 5000 characters']
  },
  type: {
    type: String,
    enum: ['post', 'reel', 'story'],
    required: true,
    index: true
  },
  title: {
    type: String,
    maxlength: [200, 'Title must be less than 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description must be less than 1000 characters']
  },
  category: {
    type: String,
    enum: ['general', 'spiritual', 'educational', 'entertainment', 'news', 'personal', 'business'],
    default: 'general'
  },
  religion: {
    type: String,
    enum: ['hinduism', 'islam', 'christianity', 'sikhism', 'buddhism', 'jainism', 'other', 'none'],
    default: 'none'
  },
  location: {
    type: String,
    maxlength: [100, 'Location must be less than 100 characters']
  },
  
  // Media array
  media: [{
    type: {
      type: String,
      enum: ['image', 'video', 'audio'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    fileName: {
      type: String,
      required: true
    },
    filePath: {
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
    dimensions: {
      width: Number,
      height: Number
    },
    duration: Number,
    thumbnailUrl: String,
    storageType: {
      type: String,
      enum: ['local', 'cloudinary'],
      default: 'local'
    }
  }],
  
  // Song for reels
  song: {
    title: String,
    artist: String,
    url: String,
    fileName: String,
    filePath: String,
    duration: Number,
    thumbnailUrl: String,
    storageType: {
      type: String,
      enum: ['local', 'cloudinary'],
      default: 'local'
    }
  },
  
  // Social features
  mentions: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  hashtags: [{
    type: String,
    maxlength: [50, 'Each hashtag must be less than 50 characters']
  }],
  tags: [{
    type: String,
    maxlength: [50, 'Each tag must be less than 50 characters']
  }],
  collaborators: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Interaction arrays and counts
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
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }],
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
  views: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  viewsCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Collaboration requests
  collaborationRequests: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      maxlength: [500, 'Collaboration message must be less than 500 characters']
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    respondedAt: Date
  }],
  
  // Privacy and settings
  isPublic: {
    type: Boolean,
    default: true,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  allowComments: {
    type: Boolean,
    default: true
  },
  allowLikes: {
    type: Boolean,
    default: true
  },
  allowShares: {
    type: Boolean,
    default: true
  },
  allowSaves: {
    type: Boolean,
    default: true
  },
  
  // Moderation
  reported: {
    type: Boolean,
    default: false,
    index: true
  },
  reportedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  moderated: {
    type: Boolean,
    default: false
  },
  moderatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: Date,
  
  // Reel specific
  isReel: {
    type: Boolean,
    default: false
  },
  reelDuration: {
    type: Number,
    min: 1,
    max: 300 // 5 minutes max
  },
  
  // Story specific
  isStory: {
    type: Boolean,
    default: false
  },
  storyExpiry: {
    type: Date
  },
  
  // Timestamps
  publishedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
PostSchema.index({ author: 1, publishedAt: -1 });
PostSchema.index({ type: 1, publishedAt: -1 });
PostSchema.index({ category: 1, publishedAt: -1 });
PostSchema.index({ religion: 1, publishedAt: -1 });
PostSchema.index({ isPublic: 1, isActive: 1, publishedAt: -1 });
PostSchema.index({ likesCount: -1 });
PostSchema.index({ commentsCount: -1 });
PostSchema.index({ sharesCount: -1 });
PostSchema.index({ viewsCount: -1 });
PostSchema.index({ hashtags: 1 });
PostSchema.index({ mentions: 1 });
PostSchema.index({ collaborators: 1 });
PostSchema.index({ reported: 1, moderated: 1 });
PostSchema.index({ storyExpiry: 1 }, { expireAfterSeconds: 0 }); // TTL for stories

// Virtual for checking if post is expired (for stories)
PostSchema.virtual('isExpired').get(function() {
  if (this.isStory && this.storyExpiry) {
    return new Date() > this.storyExpiry;
  }
  return false;
});

// Method to add like
PostSchema.methods.addLike = function(userId: string) {
  if (!this.likes.includes(userId)) {
    this.likes.push(userId);
    this.likesCount = this.likes.length;
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove like
PostSchema.methods.removeLike = function(userId: string) {
  const index = this.likes.indexOf(userId);
  if (index > -1) {
    this.likes.splice(index, 1);
    this.likesCount = this.likes.length;
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to add view
PostSchema.methods.addView = function(userId: string) {
  if (!this.views.includes(userId)) {
    this.views.push(userId);
    this.viewsCount = this.views.length;
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to add share
PostSchema.methods.addShare = function(userId: string) {
  if (!this.shares.includes(userId)) {
    this.shares.push(userId);
    this.sharesCount = this.shares.length;
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to add save
PostSchema.methods.addSave = function(userId: string) {
  if (!this.saves.includes(userId)) {
    this.saves.push(userId);
    this.savesCount = this.saves.length;
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove save
PostSchema.methods.removeSave = function(userId: string) {
  const index = this.saves.indexOf(userId);
  if (index > -1) {
    this.saves.splice(index, 1);
    this.savesCount = this.saves.length;
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to add comment
PostSchema.methods.addComment = function(commentId: string) {
  if (!this.comments.includes(commentId)) {
    this.comments.push(commentId);
    this.commentsCount = this.comments.length;
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove comment
PostSchema.methods.removeComment = function(commentId: string) {
  const index = this.comments.indexOf(commentId);
  if (index > -1) {
    this.comments.splice(index, 1);
    this.commentsCount = this.comments.length;
    return this.save();
  }
  return Promise.resolve(this);
};

// Static method to get posts by user
PostSchema.statics.getPostsByUser = function(userId: string, page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;
  return this.find({ author: userId, isActive: true })
    .populate('author', 'username fullName avatar')
    .populate('mentions', 'username fullName avatar')
    .populate('collaborators', 'username fullName avatar')
    .sort({ publishedAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get public posts
PostSchema.statics.getPublicPosts = function(page: number = 1, limit: number = 10, filters: any = {}) {
  const skip = (page - 1) * limit;
  const query: any = { isPublic: true, isActive: true };
  
  if (filters.type) query.type = filters.type;
  if (filters.category) query.category = filters.category;
  if (filters.religion) query.religion = filters.religion;
  if (filters.hashtags && filters.hashtags.length > 0) {
    query.hashtags = { $in: filters.hashtags };
  }
  
  return this.find(query)
    .populate('author', 'username fullName avatar')
    .populate('mentions', 'username fullName avatar')
    .populate('collaborators', 'username fullName avatar')
    .sort({ publishedAt: -1 })
    .skip(skip)
    .limit(limit);
};

const Post = mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);
export default Post;

