import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IVerificationRequest extends Document {
  _id: string;
  user: mongoose.Types.ObjectId;
  type: 'personal' | 'business' | 'celebrity' | 'organization';
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  documents: {
    idProof?: string;
    addressProof?: string;
    businessProof?: string;
    additionalDocuments?: string[];
  };
  personalInfo: {
    fullName: string;
    dateOfBirth?: Date;
    phoneNumber?: string;
    address?: string;
  };
  businessInfo?: {
    businessName: string;
    businessType: string;
    registrationNumber?: string;
    website?: string;
    address?: string;
  };
  socialMediaProfiles?: {
    platform: string;
    username: string;
    followers?: number;
    verified?: boolean;
  }[];
  reason: string;
  additionalInfo?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  rejectionReason?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

export interface IVerificationBadge extends Document {
  _id: string;
  user: mongoose.Types.ObjectId;
  type: 'blue_tick' | 'gold_tick' | 'silver_tick' | 'business_tick';
  status: 'active' | 'suspended' | 'revoked';
  verifiedAt: Date;
  verifiedBy: mongoose.Types.ObjectId;
  expiresAt?: Date;
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VerificationRequestSchema = new Schema<IVerificationRequest>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['personal', 'business', 'celebrity', 'organization'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'under_review'],
    default: 'pending',
    index: true
  },
  documents: {
    idProof: String,
    addressProof: String,
    businessProof: String,
    additionalDocuments: [String]
  },
  personalInfo: {
    fullName: {
      type: String,
      required: true,
      maxlength: [100, 'Full name must be less than 100 characters']
    },
    dateOfBirth: Date,
    phoneNumber: String,
    address: String
  },
  businessInfo: {
    businessName: String,
    businessType: String,
    registrationNumber: String,
    website: String,
    address: String
  },
  socialMediaProfiles: [{
    platform: String,
    username: String,
    followers: Number,
    verified: Boolean
  }],
  reason: {
    type: String,
    required: true,
    maxlength: [500, 'Reason must be less than 500 characters']
  },
  additionalInfo: {
    type: String,
    maxlength: [1000, 'Additional info must be less than 1000 characters']
  },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Admin'
  },
  reviewedAt: Date,
  rejectionReason: {
    type: String,
    maxlength: [500, 'Rejection reason must be less than 500 characters']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true
});

const VerificationBadgeSchema = new Schema<IVerificationBadge>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  type: {
    type: String,
    enum: ['blue_tick', 'gold_tick', 'silver_tick', 'business_tick'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'revoked'],
    default: 'active',
    index: true
  },
  verifiedAt: {
    type: Date,
    required: true
  },
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  expiresAt: Date,
  reason: {
    type: String,
    maxlength: [200, 'Reason must be less than 200 characters']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
VerificationRequestSchema.index({ user: 1, status: 1 });
VerificationRequestSchema.index({ status: 1, createdAt: -1 });
VerificationRequestSchema.index({ type: 1, status: 1 });
VerificationRequestSchema.index({ priority: 1, createdAt: -1 });
VerificationRequestSchema.index({ reviewedBy: 1 });

VerificationBadgeSchema.index({ user: 1 });
VerificationBadgeSchema.index({ type: 1, status: 1 });
VerificationBadgeSchema.index({ verifiedBy: 1 });
VerificationBadgeSchema.index({ expiresAt: 1 });

// Static method to create verification request
VerificationRequestSchema.statics.createRequest = async function(
  userId: string,
  type: string,
  personalInfo: any,
  reason: string,
  documents?: any,
  businessInfo?: any,
  socialMediaProfiles?: any[],
  additionalInfo?: string
) {
  const request = new this({
    user: userId,
    type,
    personalInfo,
    reason,
    documents: documents || {},
    businessInfo,
    socialMediaProfiles,
    additionalInfo
  });
  
  return await request.save();
};

// Static method to get requests by status
VerificationRequestSchema.statics.getRequestsByStatus = async function(
  status: string, 
  page: number = 1, 
  limit: number = 10
) {
  const skip = (page - 1) * limit;
  
  const requests = await this.find({ status })
    .populate('user', 'username fullName email avatar')
    .populate('reviewedBy', 'username fullName')
    .sort({ priority: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  const total = await this.countDocuments({ status });
  
  return {
    requests,
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

// Static method to create verification badge
VerificationBadgeSchema.statics.createBadge = async function(
  userId: string,
  type: string,
  verifiedBy: string,
  reason?: string,
  expiresAt?: Date
) {
  const badge = new this({
    user: userId,
    type,
    verifiedBy,
    reason,
    expiresAt,
    verifiedAt: new Date()
  });
  
  return await badge.save();
};

// Static method to revoke verification badge
VerificationBadgeSchema.statics.revokeBadge = async function(
  userId: string,
  reason: string,
  revokedBy: string
) {
  const badge = await this.findOne({ user: userId, status: 'active' });
  
  if (badge) {
    badge.status = 'revoked';
    badge.reason = reason;
    await badge.save();
  }
  
  return badge;
};

const VerificationRequest: Model<IVerificationRequest> = mongoose.models.VerificationRequest || mongoose.model<IVerificationRequest>('VerificationRequest', VerificationRequestSchema);
const VerificationBadge: Model<IVerificationBadge> = mongoose.models.VerificationBadge || mongoose.model<IVerificationBadge>('VerificationBadge', VerificationBadgeSchema);

export { VerificationRequest, VerificationBadge };
