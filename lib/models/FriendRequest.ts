import mongoose, { Document, Schema } from 'mongoose';

export interface IFriendRequest extends Document {
  _id: string;
  sender: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  sentAt: Date;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FriendRequestSchema = new Schema<IFriendRequest>({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  message: {
    type: String,
    maxlength: [200, 'Message must be less than 200 characters'],
    default: ''
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Ensure unique sender-recipient pairs
FriendRequestSchema.index({ sender: 1, recipient: 1 }, { unique: true });

// Indexes for better query performance
FriendRequestSchema.index({ sender: 1, createdAt: -1 });
FriendRequestSchema.index({ recipient: 1, createdAt: -1 });
FriendRequestSchema.index({ status: 1, recipient: 1 }); // For pending requests
FriendRequestSchema.index({ status: 1, sender: 1 }); // For user's sent requests

export default mongoose.models.FriendRequest || mongoose.model<IFriendRequest>('FriendRequest', FriendRequestSchema);
