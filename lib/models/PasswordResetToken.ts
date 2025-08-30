import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IPasswordResetToken extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
}

// Interface for populated reset token with user data
export interface IPopulatedPasswordResetToken extends Omit<IPasswordResetToken, 'userId'> {
  userId: {
    _id: mongoose.Types.ObjectId;
    email: string;
    username: string;
    fullName: string;
  };
}

const PasswordResetTokenSchema = new Schema<IPasswordResetToken>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for better query performance
PasswordResetTokenSchema.index({ token: 1 });
PasswordResetTokenSchema.index({ userId: 1 });
PasswordResetTokenSchema.index({ expiresAt: 1 });
PasswordResetTokenSchema.index({ createdAt: 1 });

// Auto-cleanup expired tokens
PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PasswordResetToken: Model<IPasswordResetToken> = mongoose.models.PasswordResetToken || mongoose.model<IPasswordResetToken>('PasswordResetToken', PasswordResetTokenSchema);

export default PasswordResetToken;
