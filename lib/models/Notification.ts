import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  _id: string;
  recipient: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  type: 'follow' | 'like' | 'comment' | 'mention' | 'story_view';
  post?: mongoose.Types.ObjectId;
  story?: mongoose.Types.ObjectId;
  comment?: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['follow', 'like', 'comment', 'mention', 'story_view'],
    required: true
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post'
  },
  story: {
    type: Schema.Types.ObjectId,
    ref: 'Story'
  },
  comment: {
    type: Schema.Types.ObjectId
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, isRead: 1 });
NotificationSchema.index({ sender: 1, recipient: 1, type: 1 });

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
