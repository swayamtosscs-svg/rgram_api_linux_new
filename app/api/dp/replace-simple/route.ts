import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function PUT(request: NextRequest) {
  try {
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({ 
        error: 'Cloudinary not configured. Please check environment variables.',
        required: ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']
      }, { status: 500 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('dp') as File;
    const keepOldImage = formData.get('keepOldImage') === 'true';
    const username = formData.get('username') as string || 'temp_username';
    const oldPublicId = formData.get('oldPublicId') as string;

    if (!file) {
      return NextResponse.json({ error: 'Profile picture file is required' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed' 
      }, { status: 400 });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File size too large. Maximum size is 5MB' 
      }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create user-specific folder path
    const folderPath = `users/${username}/profile_pictures`;

    // Upload new image to Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folderPath,
          public_id: `dp_${Date.now()}`,
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' }
          ],
          overwrite: false,
          unique_filename: true
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(buffer);
    });

    // Delete old image from Cloudinary if not keeping it
    let deleteResult = null;
    if (oldPublicId && !keepOldImage) {
      try {
        console.log('Deleting old image from Cloudinary:', oldPublicId);
        deleteResult = await cloudinary.uploader.destroy(oldPublicId);
        
        if (deleteResult.result !== 'ok') {
          console.warn('Cloudinary deletion warning:', deleteResult);
        }
      } catch (cloudinaryError) {
        console.error('Error deleting old image from Cloudinary:', cloudinaryError);
        // Continue with update even if deletion fails
      }
    }

    // Prepare response data
    const responseData = {
      newProfilePicture: {
        avatar: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        username: username,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        size: uploadResult.bytes,
        uploadedAt: new Date().toISOString()
      },
      oldProfilePicture: oldPublicId ? {
        publicId: oldPublicId,
        wasDeleted: !keepOldImage,
        deleteResult: deleteResult
      } : null,
      replacedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: 'Profile picture replaced successfully',
      data: responseData
    });

  } catch (error) {
    console.error('Error replacing profile picture:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
