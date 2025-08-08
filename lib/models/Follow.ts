import mongoose, { Document, Schema } from 'mongoose';

export interface IFollow extends Document {
  _id: string;
  follower: mongoose.Types.ObjectId;
  following: mongoose.Types.ObjectId;
  createdAt: Date;
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
  }
}, {
  timestamps: true
});

// Ensure unique follower-following pairs
FollowSchema.index({ follower: 1, following: 1 }, { unique: true });

// Indexes for better query performance
FollowSchema.index({ follower: 1, createdAt: -1 });
FollowSchema.index({ following: 1, createdAt: -1 });

export default mongoose.models.Follow || mongoose.model<IFollow>('Follow', FollowSchema);
