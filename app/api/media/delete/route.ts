import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import dbConnect from '@/lib/database';
import Media from '@/models/Media';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = req.nextUrl;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Media ID is required' },
        { status: 400 }
      );
    }

    // Find media in MongoDB
    const media = await Media.findById(id);

    if (!media) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      );
    }

    // Delete from Cloudinary
    await new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(
        media.publicId,
        { resource_type: media.resourceType },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });

    // Delete from MongoDB
    await Media.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Media deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { 
        error: 'Error deleting media',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
