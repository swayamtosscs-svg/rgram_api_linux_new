import mongoose, { Schema, Document } from 'mongoose';

export interface ILiveStream extends Document {
  userId: string;
  username: string;
  title: string;
  description?: string;
  status: 'pending' | 'live' | 'ended' | 'cancelled';
  streamKey: string;
  streamUrl: string;
  playbackUrl: string;
  thumbnailUrl?: string;
  startedAt?: Date;
  endedAt?: Date;
  duration: number; // in seconds
  viewerCount: number;
  peakViewerCount: number;
  totalViews: number;
  likes: number;
  comments: number;
  isPrivate: boolean;
  allowedViewers?: string[]; // for private streams
  activeViewers?: string[]; // track currently active viewers
  viewerHistory?: Array<{
    viewerId: string;
    joinedAt: Date;
    leftAt?: Date;
    watchDuration?: number; // in seconds
  }>;
  category: 'darshan' | 'puja' | 'aarti' | 'bhajan' | 'discourse' | 'other';
  tags?: string[];
  location?: string;
  settings: {
    quality: '720p' | '1080p' | '480p';
    enableChat: boolean;
    enableLikes: boolean;
    enableComments: boolean;
    enableScreenShare: boolean;
    maxViewers?: number;
    isArchived: boolean; // Allow saving past darshan streams
    moderationEnabled: boolean; // Enable content moderation
    language: string; // Language of the darshan/puja
    deityName?: string; // Name of the deity
    templeInfo?: {
      name: string;
      location: string;
      contact?: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const LiveStreamSchema = new Schema<ILiveStream>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  username: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'live', 'ended', 'cancelled'],
    default: 'pending',
    index: true
  },
  category: {
    type: String,
    enum: ['darshan', 'puja', 'aarti', 'bhajan', 'discourse', 'other'],
    default: 'darshan',
    index: true
  },
  streamKey: {
    type: String,
    required: true,
    unique: true
  },
  streamUrl: {
    type: String,
    required: true
  },
  playbackUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: String,
  startedAt: Date,
  endedAt: Date,
  duration: {
    type: Number,
    default: 0
  },
  viewerCount: {
    type: Number,
    default: 0
  },
  peakViewerCount: {
    type: Number,
    default: 0
  },
  totalViews: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: {
    type: Number,
    default: 0
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  allowedViewers: [String],
  activeViewers: [String], // track currently active viewers
  viewerHistory: [{
    viewerId: String,
    joinedAt: { type: Date, default: Date.now },
    leftAt: Date,
    watchDuration: Number // in seconds
  }],
  tags: [String],
  location: String,
  settings: {
    quality: {
      type: String,
      enum: ['720p', '1080p', '480p'],
      default: '720p'
    },
    enableChat: {
      type: Boolean,
      default: true
    },
    enableLikes: {
      type: Boolean,
      default: true
    },
    enableComments: {
      type: Boolean,
      default: true
    },
    enableScreenShare: {
      type: Boolean,
      default: false
    },
    maxViewers: Number,
    isArchived: {
      type: Boolean,
      default: true
    },
    moderationEnabled: {
      type: Boolean,
      default: true
    },
    language: {
      type: String,
      default: 'hindi'
    },
    deityName: String,
    templeInfo: {
      name: String,
      location: String,
      contact: String
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
LiveStreamSchema.index({ status: 1, createdAt: -1 });
LiveStreamSchema.index({ userId: 1, status: 1 });
LiveStreamSchema.index({ category: 1, status: 1 });
LiveStreamSchema.index({ tags: 1, status: 1 });

const LiveStream = mongoose.models.LiveStream || mongoose.model<ILiveStream>('LiveStream', LiveStreamSchema);

export default LiveStream;
