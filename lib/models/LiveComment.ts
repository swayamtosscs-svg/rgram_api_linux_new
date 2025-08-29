import mongoose, { Schema, Document } from 'mongoose';

export interface ILiveComment extends Document {
  streamId: string;
  userId: string;
  username: string;
  userAvatar?: string;
  message: string;
  timestamp: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  likes: number;
  replies: string[]; // comment IDs for replies
  parentComment?: string; // for reply comments
  isHighlighted: boolean; // for streamer to highlight comments
  isPinned: boolean; // for streamer to pin comments
}

const LiveCommentSchema = new Schema<ILiveComment>({
  streamId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  username: {
    type: String,
    required: true
  },
  userAvatar: String,
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedBy: String,
  likes: {
    type: Number,
    default: 0
  },
  replies: [String],
  parentComment: String,
  isHighlighted: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
LiveCommentSchema.index({ streamId: 1, timestamp: -1 });
LiveCommentSchema.index({ streamId: 1, isDeleted: 1 });
LiveCommentSchema.index({ userId: 1, streamId: 1 });

const LiveComment = mongoose.models.LiveComment || mongoose.model<ILiveComment>('LiveComment', LiveCommentSchema);

export default LiveComment;
