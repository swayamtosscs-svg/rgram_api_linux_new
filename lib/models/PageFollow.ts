import mongoose, { Document, Schema } from 'mongoose';

export interface IPageFollow extends Document {
  _id: string;
  follower: mongoose.Types.ObjectId;
  page: mongoose.Types.ObjectId;
  createdAt: Date;
}

const PageFollowSchema = new Schema<IPageFollow>({
  follower: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  page: { type: Schema.Types.ObjectId, ref: 'Page', required: true }
}, { timestamps: true });

PageFollowSchema.index({ follower: 1, page: 1 }, { unique: true });

export default mongoose.models.PageFollow || mongoose.model<IPageFollow>('PageFollow', PageFollowSchema);
