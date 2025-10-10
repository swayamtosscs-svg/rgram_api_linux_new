import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  _id: string;
  post: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  content: string;
  parentComment?: mongoose.Types.ObjectId; // For replies
  mentions: mongoose.Types.ObjectId[];
  hashtags: string[];
  
  // Interaction counts
  likes: mongoose.Types.ObjectId[];
  likesCount: number;
  replies: mongoose.Types.ObjectId[];
  repliesCount: number;
  
  // Media attachments
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
    storageType: 'local' | 'cloudinary';
  }>;
  
  // Privacy and moderation
  isActive: boolean;
  reported: boolean;
  reportedBy?: mongoose.Types.ObjectId[];
  moderated: boolean;
  moderatedBy?: mongoose.Types.ObjectId;
  moderatedAt?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>({
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
    index: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true,
    maxlength: [2000, 'Comment content must be less than 2000 characters']
  },
  parentComment: {
    type: Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  mentions: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  hashtags: [{
    type: String,
    maxlength: [50, 'Each hashtag must be less than 50 characters']
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
  replies: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  repliesCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Media attachments
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
    storageType: {
      type: String,
      enum: ['local', 'cloudinary'],
      default: 'local'
    }
  }],
  
  // Privacy and moderation
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
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
  moderatedAt: Date
}, {
  timestamps: true
});

// Indexes for better query performance
CommentSchema.index({ post: 1, createdAt: -1 });
CommentSchema.index({ author: 1, createdAt: -1 });
CommentSchema.index({ parentComment: 1, createdAt: -1 });
CommentSchema.index({ isActive: 1, createdAt: -1 });
CommentSchema.index({ mentions: 1 });
CommentSchema.index({ hashtags: 1 });
CommentSchema.index({ likesCount: -1 });
CommentSchema.index({ reported: 1, moderated: 1 });

// Method to add like
CommentSchema.methods.addLike = function(userId: string) {
  if (!this.likes.includes(userId)) {
    this.likes.push(userId);
    this.likesCount = this.likes.length;
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove like
CommentSchema.methods.removeLike = function(userId: string) {
  const index = this.likes.indexOf(userId);
  if (index > -1) {
    this.likes.splice(index, 1);
    this.likesCount = this.likes.length;
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to add reply
CommentSchema.methods.addReply = function(replyId: string) {
  if (!this.replies.includes(replyId)) {
    this.replies.push(replyId);
    this.repliesCount = this.replies.length;
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove reply
CommentSchema.methods.removeReply = function(replyId: string) {
  const index = this.replies.indexOf(replyId);
  if (index > -1) {
    this.replies.splice(index, 1);
    this.repliesCount = this.replies.length;
    return this.save();
  }
  return Promise.resolve(this);
};

// Static method to get comments by post
CommentSchema.statics.getCommentsByPost = function(postId: string, page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;
  return this.find({ 
    post: postId, 
    parentComment: null, // Only top-level comments
    isActive: true 
  })
    .populate('author', 'username fullName avatar')
    .populate('mentions', 'username fullName avatar')
    .populate({
      path: 'replies',
      populate: {
        path: 'author',
        select: 'username fullName avatar'
      },
      options: { sort: { createdAt: 1 }, limit: 5 } // Limit replies per comment
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get replies for a comment
CommentSchema.statics.getRepliesForComment = function(commentId: string, page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;
  return this.find({ 
    parentComment: commentId, 
    isActive: true 
  })
    .populate('author', 'username fullName avatar')
    .populate('mentions', 'username fullName avatar')
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(limit);
};

const Comment = mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);
export default Comment;

