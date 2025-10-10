import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const { publicId, deleteFromCloudinary = true } = body;

    if (!publicId) {
      return NextResponse.json({ 
        error: 'publicId is required' 
      }, { status: 400 });
    }

    // Validate publicId format
    if (!publicId.startsWith('users/') || !publicId.includes('/profile_pictures/')) {
      return NextResponse.json({ 
        error: 'Invalid public ID format. Must be in format: users/{username}/profile_pictures/{filename}' 
      }, { status: 400 });
    }

    let deleteResult = null;

    // Delete from Cloudinary if requested
    if (deleteFromCloudinary) {
      try {
        console.log('Deleting from Cloudinary:', publicId);
        deleteResult = await cloudinary.uploader.destroy(publicId);
        
        if (deleteResult.result !== 'ok') {
          console.warn('Cloudinary deletion warning:', deleteResult);
          return NextResponse.json({ 
            error: 'Failed to delete from Cloudinary',
            details: deleteResult
          }, { status: 500 });
        }
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
        return NextResponse.json({ 
          error: 'Error deleting from Cloudinary',
          details: cloudinaryError instanceof Error ? cloudinaryError.message : 'Unknown error'
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Profile picture deleted successfully',
      data: {
        deletedPublicId: publicId,
        deletedFromCloudinary: deleteFromCloudinary,
        cloudinaryResult: deleteResult,
        deletedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error deleting profile picture:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
