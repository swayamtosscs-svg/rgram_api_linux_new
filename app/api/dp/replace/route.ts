import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '../../../../utils/cloudinary';
import { getUserMediaFolderPath, extractPublicIdFromUrl, deleteFromCloudinary } from '../../../../utils/mediaLibrary';
import User from '../../../../lib/models/User';
import connectDB from '../../../../lib/database';

export async function PUT(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('dp') as File;
    const userId = formData.get('userId') as string;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required in form data' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Get user by ID
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Delete old DP from Cloudinary if exists
    let oldPublicId = null;
    if (user.avatar && user.avatar.includes('cloudinary')) {
      oldPublicId = extractPublicIdFromUrl(user.avatar);
    }

    // Upload new image to Cloudinary
    const folderPath = getUserMediaFolderPath(user.username, 'dp');
    console.log('DP Replace: Using Media Library folder path:', folderPath);
    
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: folderPath,
          public_id: `dp_${Date.now()}`,
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    // Delete old DP from Cloudinary after successful upload
    if (oldPublicId) {
      try {
        console.log('DP Replace: Deleting old DP with public ID:', oldPublicId);
        const deleted = await deleteFromCloudinary(oldPublicId);
        if (deleted) {
          console.log('DP Replace: Old DP deleted successfully');
        } else {
          console.warn('DP Replace: Failed to delete old DP from Cloudinary');
        }
      } catch (error) {
        console.error('Error deleting old DP:', error);
        // Continue even if old DP deletion fails
      }
    }

    // Update user avatar in database
    user.avatar = (result as any).secure_url;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Profile picture replaced successfully',
      data: {
        avatar: (result as any).secure_url,
        publicId: (result as any).public_id,
        replaced: true,
        oldPublicId: oldPublicId
      }
    });

  } catch (error) {
    console.error('DP replace error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
