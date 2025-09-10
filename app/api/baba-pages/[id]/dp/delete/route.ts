import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import BabaPage from '@/lib/models/BabaPage';
import mongoose from 'mongoose';
import { verifyToken } from '@/lib/utils/auth';
import { v2 as cloudinary } from 'cloudinary';
import { extractBabaPagePublicId } from '@/utils/cloudinaryUtils';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;

    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid page ID' },
        { status: 400 }
      );
    }

    // Check if page exists
    const babaPage = await BabaPage.findById(id);
    if (!babaPage) {
      return NextResponse.json(
        { success: false, message: 'Baba Ji page not found' },
        { status: 404 }
      );
    }

    // Check if page has an avatar
    if (!babaPage.avatar) {
      return NextResponse.json(
        { success: false, message: 'No profile picture to delete' },
        { status: 400 }
      );
    }

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { success: false, message: 'Cloudinary not configured' },
        { status: 500 }
      );
    }

    // Extract public ID from Cloudinary URL using utility function
    const publicId = extractBabaPagePublicId(babaPage.avatar);
    
    if (!publicId) {
      console.error('Invalid Cloudinary URL format:', babaPage.avatar);
      return NextResponse.json(
        { success: false, message: 'Invalid Cloudinary URL format' },
        { status: 400 }
      );
    }
    
    console.log('Extracted public ID:', publicId);
    console.log('Full URL:', babaPage.avatar);

    // Delete from Cloudinary
    let deleteResult;
    let cloudinarySuccess = false;
    
    try {
      deleteResult = await cloudinary.uploader.destroy(publicId);
      console.log('Cloudinary deletion result:', deleteResult);
      
      if (deleteResult.result === 'ok') {
        cloudinarySuccess = true;
        console.log('✅ Successfully deleted from Cloudinary');
      } else if (deleteResult.result === 'not found') {
        console.log('⚠️ File not found in Cloudinary (may already be deleted)');
        cloudinarySuccess = true; // Consider this as success since file is gone
      } else {
        console.warn('⚠️ Cloudinary deletion warning:', deleteResult.result);
      }
    } catch (cloudinaryError) {
      console.error('❌ Error deleting from Cloudinary:', cloudinaryError);
      // Continue with database update even if Cloudinary deletion fails
    }

    // Update page to remove avatar
    babaPage.avatar = '';
    await babaPage.save();

    return NextResponse.json({
      success: true,
      message: 'Profile picture deleted successfully',
      data: {
        deletedPublicId: publicId,
        cloudinaryResult: deleteResult?.result || 'unknown',
        cloudinarySuccess: cloudinarySuccess,
        databaseUpdated: true,
        message: cloudinarySuccess 
          ? 'Profile picture deleted from both database and Cloudinary' 
          : 'Profile picture deleted from database (Cloudinary file was already removed)'
      }
    });

  } catch (error) {
    console.error('Error deleting profile picture:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
