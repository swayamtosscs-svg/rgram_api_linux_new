import mongoose, { Document, Schema, Model } from 'mongoose';

export interface BlacklistedTokenDocument extends Document {
  token: string;
  userId: mongoose.Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
}

const BlacklistedTokenSchema = new Schema<BlacklistedTokenDocument>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // This will automatically remove documents when they expire
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

// Create indexes for faster queries
BlacklistedTokenSchema.index({ token: 1 });
BlacklistedTokenSchema.index({ userId: 1 });

// Create a TTL index to automatically remove expired tokens
BlacklistedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Define the model interface
export interface BlacklistedTokenModel extends Model<BlacklistedTokenDocument> {}

// Check if the model exists before creating a new one
const BlacklistedToken = (mongoose.models.BlacklistedToken as BlacklistedTokenModel) ||
  mongoose.model<BlacklistedTokenDocument, BlacklistedTokenModel>('BlacklistedToken', BlacklistedTokenSchema);

export default BlacklistedToken;