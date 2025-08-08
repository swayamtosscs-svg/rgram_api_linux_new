import mongoose, { Document, Schema } from 'mongoose';

export interface IPhoneOTP extends Document {
  _id: string;
  phone: string;
  code: string;
  purpose: 'signup' | 'login';
  isUsed: boolean;
  attempts: number;
  maxAttempts: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PhoneOTPSchema = new Schema<IPhoneOTP>({
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
    length: [6, 'OTP must be 6 digits']
  },
  purpose: {
    type: String,
    required: true,
    enum: ['signup', 'login']
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
    required: true,
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true
});

PhoneOTPSchema.index({ phone: 1, purpose: 1 });
PhoneOTPSchema.index({ expiresAt: 1 });

const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

PhoneOTPSchema.statics.createOTP = async function(phone: string, purpose: string) {
  const otpExpireMinutes = parseInt(process.env.OTP_EXPIRE_MINUTES || '10');
  const expiresAt = new Date(Date.now() + otpExpireMinutes * 60 * 1000);
  await this.deleteMany({ phone, purpose });
  const code = generateOTP();
  const otpDoc = await this.create({ phone, code, purpose, expiresAt, isUsed: false, attempts: 0 });
  return { code, expiresAt, id: otpDoc._id };
};

PhoneOTPSchema.statics.verifyOTP = async function(phone: string, code: string, purpose: string) {
  const otpDoc = await this.findOne({ phone, purpose, isUsed: false, expiresAt: { $gt: new Date() } });
  if (!otpDoc) {
    return { valid: false, message: 'Invalid or expired OTP' };
  }
  if (otpDoc.attempts >= otpDoc.maxAttempts) {
    return { valid: false, message: 'Maximum verification attempts exceeded. Please request a new OTP.' };
  }
  otpDoc.attempts += 1;
  await otpDoc.save();
  if (otpDoc.code !== code) {
    return { valid: false, message: `Invalid OTP. ${otpDoc.maxAttempts - otpDoc.attempts} attempts remaining.` };
  }
  otpDoc.isUsed = true;
  await otpDoc.save();
  return { valid: true, message: 'OTP verified successfully' };
};

export default mongoose.models.PhoneOTP || mongoose.model<IPhoneOTP>('PhoneOTP', PhoneOTPSchema);
