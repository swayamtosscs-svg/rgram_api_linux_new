import mongoose, { Document, Schema } from 'mongoose';

export interface IFollow extends Document {
  _id: string;
  follower: mongoose.Types.ObjectId;
  following: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected';
  requestedAt: Date;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FollowSchema = new Schema<IFollow>({
  follower: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  following: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
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

// Ensure unique follower-following pairs
FollowSchema.index({ follower: 1, following: 1 }, { unique: true });

// Indexes for better query performance
FollowSchema.index({ follower: 1, createdAt: -1 });
FollowSchema.index({ following: 1, createdAt: -1 });
FollowSchema.index({ status: 1, following: 1 }); // For pending requests
FollowSchema.index({ status: 1, follower: 1 }); // For user's sent requests

export default mongoose.models.Follow || mongoose.model<IFollow>('Follow', FollowSchema);
