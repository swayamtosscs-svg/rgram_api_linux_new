import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  _id: string;
  thread: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  content: string;
  messageType: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location';
  mediaUrl?: string;
  isRead: boolean;
  readAt?: Date;
  reactions: Array<{
    user: mongoose.Types.ObjectId;
    emoji: string;
    createdAt: Date;
  }>;
  replyTo?: mongoose.Types.ObjectId;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IChatThread extends Document {
  _id: string;
  participants: mongoose.Types.ObjectId[]; // [userA, userB]
  lastMessageAt: Date;
  lastMessage: mongoose.Types.ObjectId;
  unreadCount: { [userId: string]: number };
  isGroupChat: boolean;
  groupName?: string;
  groupAvatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChatThreadSchema = new Schema<IChatThread>({
  participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  lastMessageAt: { type: Date, default: Date.now },
  lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
  unreadCount: { type: Map, of: Number, default: {} },
  isGroupChat: { type: Boolean, default: false },
  groupName: { type: String },
  groupAvatar: { type: String }
}, { timestamps: true });

ChatThreadSchema.index({ participants: 1 });
ChatThreadSchema.index({ lastMessageAt: -1 });
ChatThreadSchema.index({ 'unreadCount.userId': 1 });

const MessageSchema = new Schema<IMessage>({
  thread: { type: Schema.Types.ObjectId, ref: 'ChatThread', required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 2000 },
  messageType: { type: String, enum: ['text', 'image', 'video', 'audio', 'file', 'location'], default: 'text' },
  mediaUrl: { type: String },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  reactions: [{
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    emoji: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  replyTo: { type: Schema.Types.ObjectId, ref: 'Message' },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date }
}, { timestamps: true });

MessageSchema.index({ thread: 1, createdAt: -1 });
MessageSchema.index({ sender: 1, createdAt: -1 });
MessageSchema.index({ recipient: 1, isRead: 1 });
MessageSchema.index({ content: 'text' }); // Text search index

export const ChatThread = mongoose.models.ChatThread || mongoose.model<IChatThread>('ChatThread', ChatThreadSchema);
export const Message = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
