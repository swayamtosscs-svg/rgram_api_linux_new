import mongoose, { Document, Schema, Model } from 'mongoose';

export interface INotification extends Document {
  _id: string;
  recipient: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  type: 'mention' | 'like' | 'comment' | 'reply' | 'share' | 'collaboration_request' | 'collaboration_accepted' | 'collaboration_rejected' | 'follow' | 'follow_request' | 'follow_accepted' | 'story_view' | 'block' | 'unblock';
  content: string;
  relatedPost?: mongoose.Types.ObjectId;
  relatedComment?: mongoose.Types.ObjectId;
  relatedStory?: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['mention', 'like', 'comment', 'reply', 'share', 'collaboration_request', 'collaboration_accepted', 'collaboration_rejected', 'follow', 'follow_request', 'follow_accepted', 'story_view', 'block', 'unblock'],
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: [200, 'Notification content must be less than 200 characters']
  },
  relatedPost: {
    type: Schema.Types.ObjectId,
    ref: 'Post'
  },
  relatedComment: {
    type: Schema.Types.ObjectId
  },
  relatedStory: {
    type: Schema.Types.ObjectId,
    ref: 'Post'
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, isRead: 1 });
NotificationSchema.index({ sender: 1 });
NotificationSchema.index({ type: 1 });

// Static method to create notification
NotificationSchema.statics.createNotification = async function(
  recipientId: string,
  senderId: string,
  type: string,
  content: string,
  relatedPostId?: string,
  relatedCommentId?: string,
  relatedStoryId?: string
) {
  const notification = new this({
    recipient: recipientId,
    sender: senderId,
    type,
    content,
    relatedPost: relatedPostId,
    relatedComment: relatedCommentId,
    relatedStory: relatedStoryId
  });
  
  return await notification.save();
};

// Static method to mark notifications as read
NotificationSchema.statics.markAsRead = async function(recipientId: string, notificationIds?: string[]) {
  const query: any = { recipient: recipientId, isRead: false };
  
  if (notificationIds && notificationIds.length > 0) {
    query._id = { $in: notificationIds };
  }
  
  return await this.updateMany(query, { isRead: true });
};

// Static method to get unread count
NotificationSchema.statics.getUnreadCount = async function(recipientId: string) {
  return await this.countDocuments({ recipient: recipientId, isRead: false });
};

// Clear any existing model to ensure fresh schema
if (mongoose.models.Notification) {
  delete mongoose.models.Notification;
}

const Notification: Model<INotification> = mongoose.model<INotification>('Notification', NotificationSchema);
export default Notification;