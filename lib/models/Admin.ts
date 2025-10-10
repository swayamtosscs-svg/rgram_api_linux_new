import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAdmin extends Document {
  _id: string;
  user: mongoose.Types.ObjectId;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: {
    canManageUsers: boolean;
    canDeleteContent: boolean;
    canBlockUsers: boolean;
    canViewAnalytics: boolean;
    canModerateContent: boolean;
    canManageReports: boolean;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserBlock {
  _id: string;
  userId: mongoose.Types.ObjectId;
  blockedBy: mongoose.Types.ObjectId;
  reason: string;
  type: 'temporary' | 'permanent';
  duration?: number; // in hours for temporary blocks
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IContentReport {
  _id: string;
  reporter: mongoose.Types.ObjectId;
  reportedContent: mongoose.Types.ObjectId;
  contentType: 'post' | 'reel' | 'story' | 'comment';
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  action?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin', 'moderator'],
    default: 'moderator'
  },
  permissions: {
    canManageUsers: {
      type: Boolean,
      default: false
    },
    canDeleteContent: {
      type: Boolean,
      default: false
    },
    canBlockUsers: {
      type: Boolean,
      default: false
    },
    canViewAnalytics: {
      type: Boolean,
      default: false
    },
    canModerateContent: {
      type: Boolean,
      default: true
    },
    canManageReports: {
      type: Boolean,
      default: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const UserBlockSchema = new Schema<IUserBlock>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  blockedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  reason: {
    type: String,
    required: true,
    maxlength: [200, 'Block reason must be less than 200 characters']
  },
  type: {
    type: String,
    enum: ['temporary', 'permanent'],
    required: true
  },
  duration: {
    type: Number,
    min: 1
  },
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 } // TTL index for temporary blocks
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

const ContentReportSchema = new Schema<IContentReport>({
  reporter: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportedContent: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true
  },
  contentType: {
    type: String,
    enum: ['post', 'reel', 'story', 'comment'],
    required: true
  },
  reason: {
    type: String,
    required: true,
    maxlength: [100, 'Report reason must be less than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Report description must be less than 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    default: 'pending',
    index: true
  },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Admin'
  },
  reviewedAt: Date,
  action: {
    type: String,
    maxlength: [200, 'Action taken must be less than 200 characters']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
AdminSchema.index({ user: 1 });
AdminSchema.index({ role: 1 });
AdminSchema.index({ isActive: 1 });

UserBlockSchema.index({ userId: 1, isActive: 1 });
UserBlockSchema.index({ blockedBy: 1 });
UserBlockSchema.index({ expiresAt: 1 });

ContentReportSchema.index({ reporter: 1 });
ContentReportSchema.index({ contentType: 1 });
ContentReportSchema.index({ status: 1, createdAt: -1 });

// Set expiration for temporary blocks
UserBlockSchema.pre('save', function(next) {
  if (this.isNew && this.type === 'temporary' && this.duration) {
    this.expiresAt = new Date(Date.now() + this.duration * 60 * 60 * 1000);
  }
  next();
});

// Static method to check if user is blocked
UserBlockSchema.statics.isUserBlocked = async function(userId: string) {
  const activeBlock = await this.findOne({
    userId,
    isActive: true,
    $or: [
      { type: 'permanent' },
      { expiresAt: { $gt: new Date() } }
    ]
  });
  
  return !!activeBlock;
};

// Static method to get user block history
UserBlockSchema.statics.getUserBlockHistory = async function(userId: string, page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;
  
  const blocks = await this.find({ userId })
    .populate('blockedBy', 'username fullName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  const total = await this.countDocuments({ userId });
  
  return {
    blocks,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    }
  };
};

// Static method to create report
ContentReportSchema.statics.createReport = async function(
  reporterId: string,
  contentId: string,
  contentType: string,
  reason: string,
  description?: string
) {
  const report = new this({
    reporter: reporterId,
    reportedContent: contentId,
    contentType,
    reason,
    description
  });
  
  return await report.save();
};

// Static method to get reports by status
ContentReportSchema.statics.getReportsByStatus = async function(status: string, page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;
  
  const reports = await this.find({ status })
    .populate('reporter', 'username fullName')
    .populate('reviewedBy', 'username fullName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  const total = await this.countDocuments({ status });
  
  return {
    reports,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    }
  };
};

const Admin: Model<IAdmin> = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);
const UserBlock: Model<IUserBlock> = mongoose.models.UserBlock || mongoose.model<IUserBlock>('UserBlock', UserBlockSchema);
const ContentReport: Model<IContentReport> = mongoose.models.ContentReport || mongoose.model<IContentReport>('ContentReport', ContentReportSchema);

export { Admin, UserBlock, ContentReport };
