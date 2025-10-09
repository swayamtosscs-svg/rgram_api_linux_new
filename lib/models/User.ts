import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: string;
  email: string;
  password: string;
  username: string;
  fullName: string;
  avatar?: string;
  bio?: string;
  website?: string;
  location?: string;
  religion?: string;
  phone?: string;
  googleId?: string;
  isPrivate: boolean;
  isEmailVerified: boolean;
  isActive: boolean;
  isVerified: boolean;
  verificationType?: 'blue_tick' | 'gold_tick' | 'silver_tick' | 'business_tick' | null;
  isAdmin?: boolean;
  role?: string;
  verificationRequest?: {
    idDocument: string;
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: Date;
    reviewedAt?: Date;
  };
  followersCount: number;
  followingCount: number;
  postsCount: number;
  reelsCount: number;
  videosCount: number;
  blockedUsers: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  lastActive: Date;
  passwordChangedAt?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username must be less than 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
    minlength: [2, 'Full name must be at least 2 characters'],
    maxlength: [50, 'Full name must be less than 50 characters']
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio must be less than 500 characters'],
    default: ''
  },
  website: {
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
  phone: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationType: {
    type: String,
    enum: ['blue_tick', 'gold_tick', 'silver_tick', 'business_tick'],
    default: null
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'admin', 'super_admin', 'moderator']
  },
  verificationRequest: {
    idDocument: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    reviewedAt: {
      type: Date
    }
  },
  followersCount: {
    type: Number,
    default: 0,
    min: 0
  },
  followingCount: {
    type: Number,
    default: 0,
    min: 0
  },
  postsCount: {
    type: Number,
    default: 0,
    min: 0
  },
  reelsCount: {
    type: Number,
    default: 0,
    min: 0
  },
  videosCount: {
    type: Number,
    default: 0,
    min: 0
  },
  blockedUsers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  lastActive: {
    type: Date,
    default: Date.now
  },
  passwordChangedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret: { password?: string }) {
      delete ret.password;
      return ret;
    }
  }
});

// Index for better query performance
UserSchema.index({ createdAt: -1 });
UserSchema.index({ lastActive: -1 });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// Update lastActive on login
UserSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save();
};

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
