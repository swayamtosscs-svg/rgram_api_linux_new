import mongoose, { Document, Schema } from 'mongoose';

export interface IPage extends Document {
  _id: string;
  name: string;
  description?: string;
  religion?: string;
  owner: mongoose.Types.ObjectId;
  avatar?: string;
  cover?: string;
  followersCount: number;
  isVerified: boolean;
  verificationRequest?: {
    note?: string;
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: Date;
    reviewedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PageSchema = new Schema<IPage>({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 1000 },
  religion: { type: String, trim: true, maxlength: 50 },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  avatar: { type: String, default: '' },
  cover: { type: String, default: '' },
  followersCount: { type: Number, default: 0, min: 0 },
  isVerified: { type: Boolean, default: false },
  verificationRequest: {
    note: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date }
  }
}, { timestamps: true });

PageSchema.index({ owner: 1, createdAt: -1 });

export default mongoose.models.Page || mongoose.model<IPage>('Page', PageSchema);
