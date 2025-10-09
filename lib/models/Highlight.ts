import mongoose, { Document, Schema } from 'mongoose';

export interface IHighlight extends Document {
  _id: string;
  name: string;
  description?: string;
  author: mongoose.Types.ObjectId;
  stories: mongoose.Types.ObjectId[];
  storiesCount: number;
  coverImage?: string; // First story's media as cover
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HighlightSchema = new Schema<IHighlight>({
  name: {
    type: String,
    required: true,
    maxlength: [50, 'Highlight name must be less than 50 characters'],
    trim: true
  },
  description: {
    type: String,
    maxlength: [200, 'Description must be less than 200 characters'],
    trim: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  stories: [{
    type: Schema.Types.ObjectId,
    ref: 'Story'
  }],
  storiesCount: {
    type: Number,
    default: 0,
    min: 0
  },
  coverImage: {
    type: String
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
HighlightSchema.index({ author: 1, createdAt: -1 });
HighlightSchema.index({ isPublic: 1 });

// Update stories count when stories change
HighlightSchema.pre('save', function(next) {
  if (this.isModified('stories')) {
    this.storiesCount = this.stories.length;
    // Set cover image to first story's media if not set
    if (this.stories.length > 0 && !this.coverImage) {
      // This will be populated later
    }
  }
  next();
});

export default mongoose.models.Highlight || mongoose.model<IHighlight>('Highlight', HighlightSchema);
