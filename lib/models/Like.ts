import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ILike extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  contentType: 'post' | 'video' | 'reel' | 'story' | 'userAsset';
  contentId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LikeSchema = new Schema<ILike>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  contentType: {
    type: String,
    enum: ['post', 'video', 'reel', 'story', 'userAsset'],
    required: true,
    index: true
  },
  contentId: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete (ret as any)._id;
      delete (ret as any).__v;
      return ret;
    }
  }
});

// Compound index to ensure one like per user per content
LikeSchema.index({ userId: 1, contentType: 1, contentId: 1 }, { unique: true });

// Index for better query performance
LikeSchema.index({ contentType: 1, contentId: 1 });
LikeSchema.index({ userId: 1, createdAt: -1 });

const Like: Model<ILike> = mongoose.models.Like || mongoose.model<ILike>('Like', LikeSchema);
export default Like;
