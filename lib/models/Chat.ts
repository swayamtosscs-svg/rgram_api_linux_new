import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  _id: string;
  thread: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IChatThread extends Document {
  _id: string;
  participants: mongoose.Types.ObjectId[]; // [userA, userB]
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ChatThreadSchema = new Schema<IChatThread>({
  participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  lastMessageAt: { type: Date, default: Date.now }
}, { timestamps: true });

ChatThreadSchema.index({ participants: 1 });
ChatThreadSchema.index({ lastMessageAt: -1 });

const MessageSchema = new Schema<IMessage>({
  thread: { type: Schema.Types.ObjectId, ref: 'ChatThread', required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 2000 }
}, { timestamps: true });

MessageSchema.index({ thread: 1, createdAt: -1 });

export const ChatThread = mongoose.models.ChatThread || mongoose.model<IChatThread>('ChatThread', ChatThreadSchema);
export const Message = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
