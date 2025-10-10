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

// Force delete profile picture from Cloudinary and database
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

    // Extract public ID using the utility function
    const publicId = extractBabaPagePublicId(babaPage.avatar);
    
    if (!publicId) {
      return NextResponse.json(
        { success: false, message: 'Invalid Cloudinary URL format' },
        { status: 400 }
      );
    }

    console.log('Force deleting from Cloudinary with public ID:', publicId);
    console.log('Full URL:', babaPage.avatar);

    // Force delete from Cloudinary with multiple attempts
    let deleteResult;
    let cloudinarySuccess = false;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts && !cloudinarySuccess) {
      attempts++;
      console.log(`Deletion attempt ${attempts}/${maxAttempts}`);
      
      try {
        // Try different resource types
        const resourceTypes = ['image', 'video', 'raw'];
        
        for (const resourceType of resourceTypes) {
          try {
            console.log(`Trying to delete as ${resourceType}...`);
            deleteResult = await cloudinary.uploader.destroy(publicId, {
              resource_type: resourceType,
              invalidate: true // Force cache invalidation
            });
            
            console.log(`Cloudinary deletion result (${resourceType}):`, deleteResult);
            
            if (deleteResult.result === 'ok') {
              cloudinarySuccess = true;
              console.log(`✅ Successfully deleted from Cloudinary as ${resourceType}`);
              break;
            } else if (deleteResult.result === 'not found') {
              console.log(`⚠️ File not found in Cloudinary as ${resourceType}`);
              cloudinarySuccess = true; // Consider this as success since file is gone
              break;
            }
          } catch (resourceError) {
            console.log(`Failed to delete as ${resourceType}:`, resourceError);
            continue;
          }
        }
        
        if (!cloudinarySuccess) {
          // Try without resource type specification
          try {
            console.log('Trying to delete without resource type...');
            deleteResult = await cloudinary.uploader.destroy(publicId, {
              invalidate: true
            });
            
            console.log('Cloudinary deletion result (no type):', deleteResult);
            
            if (deleteResult.result === 'ok') {
              cloudinarySuccess = true;
              console.log('✅ Successfully deleted from Cloudinary (no type)');
            } else if (deleteResult.result === 'not found') {
              console.log('⚠️ File not found in Cloudinary (no type)');
              cloudinarySuccess = true;
            }
          } catch (noTypeError) {
            console.log('Failed to delete without resource type:', noTypeError);
          }
        }
        
      } catch (cloudinaryError) {
        console.error(`Cloudinary deletion error (attempt ${attempts}):`, cloudinaryError);
        
        if (attempts === maxAttempts) {
          console.error('All deletion attempts failed');
        } else {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    // Update page to remove avatar regardless of Cloudinary result
    babaPage.avatar = '';
    await babaPage.save();

    return NextResponse.json({
      success: true,
      message: 'Profile picture force deleted successfully',
      data: {
        deletedPublicId: publicId,
        cloudinaryResult: deleteResult?.result || 'unknown',
        cloudinarySuccess: cloudinarySuccess,
        databaseUpdated: true,
        attempts: attempts,
        maxAttempts: maxAttempts,
        message: cloudinarySuccess 
          ? 'Profile picture deleted from both database and Cloudinary' 
          : 'Profile picture deleted from database (Cloudinary deletion failed after multiple attempts)',
        originalUrl: babaPage.avatar
      }
    });

  } catch (error) {
    console.error('Error force deleting profile picture:', error);
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
