import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '../../../../utils/cloudinary';
import { getUserMediaFolderPath, extractPublicIdFromUrl, deleteFromCloudinary } from '../../../../utils/mediaLibrary';
import User from '../../../../lib/models/User';
import connectDB from '../../../../lib/database';

export async function POST(request: NextRequest) {
  try {
    console.log('DP Upload: Starting request processing...');
    
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('dp') as File;
    const userId = formData.get('userId') as string;
    
    console.log('DP Upload: Parsed form data - userId:', userId, 'file:', file ? `${file.name} (${file.size} bytes)` : 'none');
    
    if (!userId) {
      console.log('DP Upload: Missing userId');
      return NextResponse.json(
        { error: 'User ID is required in form data' },
        { status: 400 }
      );
    }

    if (!file) {
      console.log('DP Upload: Missing file');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.log('DP Upload: Invalid file type:', file.type);
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.log('DP Upload: File too large:', file.size);
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    console.log('DP Upload: File validation passed, connecting to database...');

    // Connect to database
    try {
      await connectDB();
      console.log('DP Upload: Database connected successfully');
    } catch (dbError) {
      console.error('DP Upload: Database connection failed:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Get user by ID
    let user;
    try {
      user = await User.findById(userId);
      console.log('DP Upload: User lookup result:', user ? `Found user: ${user.username}` : 'User not found');
    } catch (userError) {
      console.error('DP Upload: User lookup error:', userError);
      return NextResponse.json(
        { error: 'Error looking up user' },
        { status: 500 }
      );
    }

    if (!user) {
      console.log('DP Upload: User not found for ID:', userId);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('DP Upload: Converting file to buffer...');

    // Convert file to buffer
    let buffer;
    try {
      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
      console.log('DP Upload: File converted to buffer, size:', buffer.length);
    } catch (bufferError) {
      console.error('DP Upload: File buffer conversion failed:', bufferError);
      return NextResponse.json(
        { error: 'File processing failed' },
        { status: 500 }
      );
    }

    console.log('DP Upload: Starting Cloudinary upload...');

    // Upload to Cloudinary
    let result;
    try {
      const folderPath = getUserMediaFolderPath(user.username, 'dp');
      console.log('DP Upload: Using Media Library folder path:', folderPath);
      
      result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: folderPath,
            public_id: `dp_${Date.now()}`,
            transformation: [
              { width: 400, height: 400, crop: 'fill', gravity: 'face' },
              { quality: 'auto' }
            ]
          },
          (error, uploadResult) => {
            if (error) {
              console.error('DP Upload: Cloudinary upload error:', error);
              reject(error);
            } else {
              console.log('DP Upload: Cloudinary upload successful:', uploadResult?.public_id);
              resolve(uploadResult);
            }
          }
        );
        
        uploadStream.end(buffer);
      });
      
      console.log('DP Upload: Cloudinary upload completed');
    } catch (cloudinaryError) {
      console.error('DP Upload: Cloudinary upload failed:', cloudinaryError);
      return NextResponse.json(
        { error: 'Image upload to Cloudinary failed' },
        { status: 500 }
      );
    }

    if (!result) {
      console.error('DP Upload: No result from Cloudinary');
      return NextResponse.json(
        { error: 'Upload failed - no result from Cloudinary' },
        { status: 500 }
      );
    }

    console.log('DP Upload: Deleting old DP if exists...');

    // Delete old DP if exists
    if (user.avatar && user.avatar.includes('cloudinary')) {
      try {
        const publicId = extractPublicIdFromUrl(user.avatar);
        if (publicId) {
          console.log('DP Upload: Deleting old DP with public ID:', publicId);
          const deleted = await deleteFromCloudinary(publicId);
          if (deleted) {
            console.log('DP Upload: Old DP deleted successfully');
          } else {
            console.warn('DP Upload: Failed to delete old DP from Cloudinary');
          }
        }
      } catch (deleteError) {
        console.error('DP Upload: Error deleting old DP:', deleteError);
        // Continue even if old DP deletion fails
      }
    }

    console.log('DP Upload: Updating user avatar in database...');

    // Update user avatar in database
    try {
      user.avatar = (result as any).secure_url;
      await user.save();
      console.log('DP Upload: User avatar updated in database');
    } catch (saveError) {
      console.error('DP Upload: Database save error:', saveError);
      return NextResponse.json(
        { error: 'Failed to update user profile' },
        { status: 500 }
      );
    }

    console.log('DP Upload: Success! Returning response...');

    return NextResponse.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        avatar: (result as any).secure_url,
        publicId: (result as any).public_id
      }
    });

  } catch (error) {
    console.error('DP Upload: Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
      },
      { status: 500 }
    );
  }
}
