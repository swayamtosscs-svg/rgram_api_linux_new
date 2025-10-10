import mongoose, { Document, Schema } from 'mongoose';

export interface IBabaPageFollow extends Document {
  _id: string;
  follower: mongoose.Types.ObjectId;
  page: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected';
  requestedAt: Date;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BabaPageFollowSchema = new Schema<IBabaPageFollow>({
  follower: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  page: {
    type: Schema.Types.ObjectId,
    ref: 'BabaPage',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'accepted' // Pages can be followed directly without approval
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Ensure unique follower-page pairs
BabaPageFollowSchema.index({ follower: 1, page: 1 }, { unique: true });

// Indexes for better query performance
BabaPageFollowSchema.index({ follower: 1, createdAt: -1 });
BabaPageFollowSchema.index({ page: 1, createdAt: -1 });
BabaPageFollowSchema.index({ status: 1, page: 1 }); // For page followers
BabaPageFollowSchema.index({ status: 1, follower: 1 }); // For user's followed pages

export default mongoose.models.BabaPageFollow || mongoose.model<IBabaPageFollow>('BabaPageFollow', BabaPageFollowSchema);
