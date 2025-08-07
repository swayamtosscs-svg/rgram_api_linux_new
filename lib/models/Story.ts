import mongoose, { Document, Schema } from 'mongoose';

export interface IStory extends Document {
  _id: string;
  author: mongoose.Types.ObjectId;
  media: string;
  type: 'image' | 'video';
  caption?: string;
  mentions: mongoose.Types.ObjectId[];
  hashtags: string[];
  location?: string;
  isActive: boolean;
  expiresAt: Date;
  views: mongoose.Types.ObjectId[];
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const StorySchema = new Schema<IStory>({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  media: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  caption: {
    type: String,
    maxlength: [200, 'Caption must be less than 200 characters']
  },
  mentions: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  hashtags: [{
    type: String,
    trim: true
  }],
  location: {
    type: String,
    maxlength: [100, 'Location must be less than 100 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    }
  },
  views: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  viewsCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
StorySchema.index({ author: 1, createdAt: -1 });
StorySchema.index({ expiresAt: 1 });
StorySchema.index({ isActive: 1, expiresAt: 1 });
StorySchema.index({ hashtags: 1 });

// Update views count when views change
StorySchema.pre('save', function(next) {
  if (this.isModified('views')) {
    this.viewsCount = this.views.length;
  }
  next();
});

// Method to add view
StorySchema.methods.addView = function(userId: string) {
  if (!this.views.includes(userId)) {
    this.views.push(userId);
    this.viewsCount = this.views.length;
  }
  return this.save();
};

// Method to check if story is expired
StorySchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

export default mongoose.models.Story || mongoose.model<IStory>('Story', StorySchema);
