import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Define Media schema inline to avoid import issues
const mediaSchema = new mongoose.Schema({
  publicId: { type: String, required: true, unique: true },
  url: { type: String, required: true },
  secureUrl: { type: String, required: true },
  format: { type: String, required: true },
  resourceType: { type: String, enum: ['image', 'video'], required: true },
  width: Number,
  height: Number,
  duration: Number,
  title: String,
  description: String,
  tags: [String],
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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
      publicId: media.publicId,
      secureUrl: media.secureUrl,
      resourceType: media.resourceType,
      title: media.title,
      uploadedBy: media.uploadedBy
    };

    console.log('🗑️ Deleting from Cloudinary...');

    // Delete from Cloudinary
    try {
      const cloudinaryResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(
          media.publicId,
          { resource_type: media.resourceType || 'auto' },
          (error, result) => {
            if (error) {
              console.error('❌ Cloudinary deletion error:', error);
              reject(error);
            } else {
              console.log('✅ Cloudinary deletion result:', result);
              resolve(result);
            }
          }
        );
      });
      
      console.log('✅ Cloudinary deletion successful');
    } catch (cloudinaryError: any) {
      console.error('❌ Cloudinary deletion failed:', cloudinaryError);
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to delete from Cloudinary',
          message: 'Media could not be deleted from cloud storage',
          details: cloudinaryError.message,
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
      message: 'Media deleted successfully',
      data: {
        deletedMedia: mediaInfo,
        deletedAt: new Date().toISOString(),
        deletionStatus: {
          cloudinary: 'success',
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
