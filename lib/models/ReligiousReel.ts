import mongoose, { Document, Model } from 'mongoose';

interface IReligiousReel extends Document {
  title: string;
  videoUrl: string;
  description?: string;
  source: string;
  religion: string;
  tags: string[];
  views: number;
  likes: number;
  shares: number;
  createdAt: Date;
  isApproved?: boolean;
}

const religiousReelSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  videoUrl: {
    type: String,
    required: true,
  },
  source: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['hindu', 'islam', 'christian', 'sikh', 'buddhist', 'other']
  },
  description: String,
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isApproved: {
    type: Boolean,
    default: false
  }
});

const ReligiousReel: Model<IReligiousReel> = mongoose.models.ReligiousReel || mongoose.model<IReligiousReel>('ReligiousReel', religiousReelSchema);

export default ReligiousReel;
