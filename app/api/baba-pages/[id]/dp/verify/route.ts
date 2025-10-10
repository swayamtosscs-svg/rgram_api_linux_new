import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import BabaPage from '@/lib/models/BabaPage';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Verify if profile picture exists in Cloudinary
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;

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
      return NextResponse.json({
        success: true,
        data: {
          pageId: id,
          pageName: babaPage.name,
          hasAvatar: false,
          avatar: null,
          cloudinaryStatus: 'no_avatar_in_database'
        }
      });
    }

    // Extract public ID from Cloudinary URL
    // Expected URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/baba-pages/page_id/profile_pictures/timestamp.jpg
    const urlParts = babaPage.avatar.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1 || uploadIndex >= urlParts.length - 1) {
      console.error('Invalid Cloudinary URL format:', babaPage.avatar);
      return NextResponse.json({
        success: true,
        data: {
          pageId: id,
          pageName: babaPage.name,
          hasAvatar: true,
          avatar: babaPage.avatar,
          cloudinaryStatus: 'invalid_url_format',
          publicId: 'unknown',
          cloudinaryDetails: null,
          isCloudinaryUrl: babaPage.avatar.includes('cloudinary'),
          needsCleanup: false
        }
      });
    }
    
    // Get everything after 'upload' and before the file extension
    const pathAfterUpload = urlParts.slice(uploadIndex + 2); // Skip 'upload' and version
    const publicIdWithExtension = pathAfterUpload.join('/');
    const publicId = publicIdWithExtension.split('.')[0];
    
    console.log('Extracted public ID for verification:', publicId);

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({
        success: true,
        data: {
          pageId: id,
          pageName: babaPage.name,
          hasAvatar: true,
          avatar: babaPage.avatar,
          cloudinaryStatus: 'cloudinary_not_configured',
          publicId: publicId
        }
      });
    }

    // Check if file exists in Cloudinary
    let cloudinaryStatus = 'unknown';
    let cloudinaryDetails = null;

    try {
      const result = await cloudinary.api.resource(publicId);
      cloudinaryStatus = 'exists';
      cloudinaryDetails = {
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        createdAt: result.created_at,
        url: result.secure_url
      };
    } catch (error: any) {
      if (error.http_code === 404) {
        cloudinaryStatus = 'not_found';
      } else {
        cloudinaryStatus = 'error';
        cloudinaryDetails = {
          error: error.message,
          httpCode: error.http_code
        };
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        pageId: id,
        pageName: babaPage.name,
        hasAvatar: true,
        avatar: babaPage.avatar,
        cloudinaryStatus: cloudinaryStatus,
        publicId: publicId,
        cloudinaryDetails: cloudinaryDetails,
        isCloudinaryUrl: babaPage.avatar.includes('cloudinary'),
        needsCleanup: cloudinaryStatus === 'not_found' && babaPage.avatar.includes('cloudinary')
      }
    });

  } catch (error) {
    console.error('Error verifying profile picture:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
      },
      { status: 500 }
    );
  }
}
