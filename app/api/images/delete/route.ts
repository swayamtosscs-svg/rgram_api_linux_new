import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { join } from 'path';
import dbConnect from '@/lib/database';
import Image from '@/models/Image';
import User from '@/lib/models/User';

export async function DELETE(req: NextRequest) {
  try {
    console.log('🗑️ Starting image deletion...');
    
    const { searchParams } = req.nextUrl;
    const imageId = searchParams.get('id');
    const username = searchParams.get('username');

    if (!imageId) {
      console.log('❌ No image ID provided');
      return NextResponse.json(
        { 
          success: false,
          error: 'Image ID is required',
          message: 'Please provide a valid image ID'
        },
        { status: 400 }
      );
    }

    console.log('🔍 Looking for image with ID:', imageId);

    // Connect to database
    await dbConnect();

    // Find image in MongoDB
    const image = await Image.findById(imageId);
    console.log('📁 Image found:', image ? 'Yes' : 'No');

    if (!image) {
      console.log('❌ Image not found');
      return NextResponse.json(
        { 
          success: false,
          error: 'Image not found',
          message: 'The specified image does not exist'
        },
        { status: 404 }
      );
    }

    // If username is provided, verify ownership
    if (username && image.username !== username.toLowerCase()) {
      console.log('❌ Unauthorized: Image does not belong to user');
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized',
          message: 'You can only delete your own images'
        },
        { status: 403 }
      );
    }

    // Store image info for response
    const imageInfo = {
      imageId: image._id,
      fileName: image.fileName,
      originalName: image.originalName,
      filePath: image.filePath,
      fullUrl: image.fullUrl,
      username: image.username,
      uploadedBy: image.uploadedBy
    };

    console.log('🗑️ Deleting file from storage...');

    // Delete file from local storage
    try {
      const fullPath = join(process.cwd(), 'public', image.filePath);
      await unlink(fullPath);
      console.log('✅ File deleted from storage:', fullPath);
    } catch (fileError: any) {
      console.error('❌ File deletion error:', fileError);
      
      // If file doesn't exist, continue with database deletion
      if (fileError.code !== 'ENOENT') {
        return NextResponse.json(
          { 
            success: false,
            error: 'Failed to delete file from storage',
            message: 'Image file could not be deleted from storage',
            details: fileError.message,
            imageInfo
          },
          { status: 500 }
        );
      } else {
        console.log('⚠️ File not found in storage, continuing with database cleanup');
      }
    }

    console.log('🗑️ Deleting from database...');

    // Delete from MongoDB
    await Image.findByIdAndDelete(imageId);
    console.log('✅ Database deletion successful');

    // Update user's posts count
    try {
      await User.findByIdAndUpdate(image.uploadedBy, { $inc: { postsCount: -1 } });
      console.log('✅ User posts count updated');
    } catch (userError: any) {
      console.error('⚠️ Failed to update user posts count:', userError);
      // Don't fail the entire operation for this
    }

    const response = {
      success: true,
      message: 'Image deleted successfully',
      data: {
        deletedImage: imageInfo,
        deletedAt: new Date().toISOString(),
        deletionStatus: {
          storage: 'success',
          database: 'success'
        }
      }
    };

    console.log('✅ Deletion completed successfully');
    return NextResponse.json(response);

  } catch (error: any) {
    console.error('❌ Delete image error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred while deleting image',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// GET method to check if image exists and get its details
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = req.nextUrl;
    const imageId = searchParams.get('id');
    const username = searchParams.get('username');

    if (!imageId) {
      return NextResponse.json(
        { error: 'Image ID is required' },
        { status: 400 }
      );
    }

    const image = await Image.findById(imageId);
    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    // If username is provided, verify ownership
    if (username && image.username !== username.toLowerCase()) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: image
    });

  } catch (error: any) {
    console.error('❌ Get image error:', error);
    return NextResponse.json(
      { 
        error: 'Error fetching image',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
