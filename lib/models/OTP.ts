import mongoose, { Document, Schema } from 'mongoose';

export interface IOTP extends Document {
  _id: string;
  email: string;
  otp: string;
  purpose: 'signup' | 'login' | 'password_reset' | 'email_verification';
  isUsed: boolean;
  attempts: number;
  maxAttempts: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OTPSchema = new Schema<IOTP>({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  otp: {
    type: String,
    required: true,
    length: [6, 'OTP must be 6 digits']
  },
  purpose: {
    type: String,
    required: true,
    enum: ['signup', 'login', 'password_reset', 'email_verification']
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 0,
    min: 0
  },
  maxAttempts: {
    type: Number,
    default: 5,
    min: 1
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Index for better query performance
OTPSchema.index({ email: 1, purpose: 1 });

// TTL index for auto-cleanup of expired OTPs
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Generate random 6-digit OTP
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Static method to create OTP
OTPSchema.statics.createOTP = async function(email: string, purpose: string) {
  const otpExpireMinutes = parseInt(process.env.OTP_EXPIRE_MINUTES || '10');
  const expiresAt = new Date(Date.now() + otpExpireMinutes * 60 * 1000);
  
  // Delete any existing OTPs for this email and purpose
  await this.deleteMany({ email, purpose });
  
  // Create new OTP
  const otp = generateOTP();
  const otpDoc = await this.create({
    email,
    otp,
    purpose,
    expiresAt,
    isUsed: false,
    attempts: 0
  });
  
  return {
    otp,
    expiresAt,
    id: otpDoc._id
  };
};

// Static method to verify OTP
OTPSchema.statics.verifyOTP = async function(email: string, otp: string, purpose: string) {
  const otpDoc = await this.findOne({
    email,
    purpose,
    isUsed: false,
    expiresAt: { $gt: new Date() }
  });
  
  if (!otpDoc) {
    return {
      valid: false,
      message: 'Invalid or expired OTP'
    };
  }
  
  // Check if max attempts exceeded
  if (otpDoc.attempts >= otpDoc.maxAttempts) {
    return {
      valid: false,
      message: 'Maximum verification attempts exceeded. Please request a new OTP.'
    };
  }
  
  // Increment attempts
  otpDoc.attempts += 1;
  await otpDoc.save();
  
  // Check if OTP matches
  if (otpDoc.otp !== otp) {
    return {
      valid: false,
      message: `Invalid OTP. ${otpDoc.maxAttempts - otpDoc.attempts} attempts remaining.`
    };
  }
  
  // Mark OTP as used
  otpDoc.isUsed = true;
  await otpDoc.save();
  
  return {
    valid: true,
    message: 'OTP verified successfully'
  };
};

// Method to check if OTP is expired
OTPSchema.methods.isExpired = function(): boolean {
  return new Date() > this.expiresAt;
};

// Method to check if OTP can be used
OTPSchema.methods.canBeUsed = function(): boolean {
  return !this.isUsed && !this.isExpired() && this.attempts < this.maxAttempts;
};

export default mongoose.models.OTP || mongoose.model<IOTP>('OTP', OTPSchema);
