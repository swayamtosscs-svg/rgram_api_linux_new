import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { deleteFileFromLocal } from '@/utils/localStorage';

// Define Media schema inline to avoid import issues
const mediaSchema = new mongoose.Schema({
  // Legacy Cloudinary fields (keeping for backward compatibility)
  publicId: { type: String, required: false, unique: false },
  url: { type: String, required: false },
  secureUrl: { type: String, required: false },
  
  // Local storage fields
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  publicUrl: { type: String, required: true },
  fileSize: { type: Number, required: true },
  mimeType: { type: String, required: true },
  
  // Common fields
  format: { type: String, required: true },
  resourceType: { type: String, enum: ['image', 'video'], required: true },
  width: Number,
  height: Number,
  duration: Number,
  title: String,
  description: String,
  tags: [String],
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  storageType: { type: String, enum: ['cloudinary', 'local'], default: 'local' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Get or create Media model
const Media = mongoose.models.Media || mongoose.model('Media', mediaSchema);

// Database connection function
async function connectDB() {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }
    
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

export async function DELETE(req: NextRequest) {
  try {
    console.log('🗑️ Starting media deletion...');
    
    const { searchParams } = req.nextUrl;
    const id = searchParams.get('id');

    if (!id) {
      console.log('❌ No media ID provided');
      return NextResponse.json(
        { 
          success: false,
          error: 'Media ID is required',
          message: 'Please provide a valid media ID'
        },
        { status: 400 }
      );
    }

    console.log('🔍 Looking for media with ID:', id);

    // Connect to database
    await connectDB();

    // Find media in MongoDB
    const media = await Media.findById(id);
    console.log('📁 Media found:', media ? 'Yes' : 'No');

    if (!media) {
      console.log('❌ Media not found');
      return NextResponse.json(
        { 
          success: false,
          error: 'Media not found',
          message: 'The specified media does not exist'
        },
        { status: 404 }
      );
    }

    // Store media info for response
    const mediaInfo = {
      mediaId: media._id,
      fileName: media.fileName,
      filePath: media.filePath,
      publicUrl: media.publicUrl,
      resourceType: media.resourceType,
      title: media.title,
      uploadedBy: media.uploadedBy,
      storageType: media.storageType
    };

    console.log('🗑️ Deleting from local storage...');

    // Delete from local storage
    try {
      const deleteResult = await deleteFileFromLocal(media.filePath);
      
      if (!deleteResult.success) {
        console.error('❌ Local storage deletion failed:', deleteResult.error);
        return NextResponse.json(
          { 
            success: false,
            error: 'Failed to delete from local storage',
            message: 'Media could not be deleted from local storage',
            details: deleteResult.error,
            mediaInfo
          },
          { status: 500 }
        );
      }
      
      console.log('✅ Local storage deletion successful');
    } catch (localStorageError: any) {
      console.error('❌ Local storage deletion failed:', localStorageError);
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to delete from local storage',
          message: 'Media could not be deleted from local storage',
          details: localStorageError.message,
          mediaInfo
        },
        { status: 500 }
      );
    }

    console.log('🗑️ Deleting from database...');

    // Delete from MongoDB
    await Media.findByIdAndDelete(id);
    console.log('✅ Database deletion successful');

    const response = {
      success: true,
      message: 'Media deleted successfully from local storage',
      data: {
        deletedMedia: mediaInfo,
        deletedAt: new Date().toISOString(),
        deletionStatus: {
          localStorage: 'success',
          database: 'success'
        }
      }
    };

    console.log('✅ Deletion completed successfully');
    return NextResponse.json(response);

  } catch (error: any) {
    console.error('❌ Delete media error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred while deleting media',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
