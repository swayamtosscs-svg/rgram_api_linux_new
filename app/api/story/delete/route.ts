import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import dbConnect from '@/lib/database';
import Story from '@/lib/models/Story';
import User from '@/lib/models/User';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(req: NextRequest) {
  try {
    console.log('🗑️ Starting story media deletion...');
    
    await dbConnect();
    console.log('✅ Database connected');

    const { searchParams } = new URL(req.url);
    const storyId = searchParams.get('storyId');
    const userId = searchParams.get('userId');
    const publicId = searchParams.get('publicId');

    if (!storyId || !userId) {
      return NextResponse.json(
        { error: 'Both storyId and userId are required' },
        { status: 400 }
      );
    }

    // Validate IDs
    if (!/^[0-9a-fA-F]{24}$/.test(storyId) || !/^[0-9a-fA-F]{24}$/.test(userId)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Find the story
    const story = await Story.findById(storyId);
    if (!story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    // Check if user is the author of the story
    if (story.author.toString() !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized: You can only delete your own stories' },
        { status: 403 }
      );
    }

    // Extract public ID from Cloudinary URL if not provided
    let cloudinaryPublicId = publicId;
    if (!cloudinaryPublicId) {
      // Extract public ID from the media URL
      const urlParts = story.media.split('/');
      const filename = urlParts[urlParts.length - 1];
      const filenameWithoutExtension = filename.split('.')[0];
      
      // Reconstruct the public ID based on the new folder structure (story/mediaType/filename)
      cloudinaryPublicId = `users/${user.username}/story/${story.type}/${filenameWithoutExtension}`;
    }

    console.log('🗑️ Deleting from Cloudinary with public ID:', cloudinaryPublicId);

    // Delete from Cloudinary
    try {
      const deleteResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(
          cloudinaryPublicId,
          { resource_type: story.type === 'video' ? 'video' : 'image' },
          (error, result: any) => {
            if (error) {
              console.error('❌ Cloudinary deletion error:', error);
              reject(error);
            } else {
              console.log('✅ Cloudinary deletion successful:', result);
              resolve(result);
            }
          }
        );
      });
      console.log('✅ Cloudinary deletion result:', deleteResult);
    } catch (cloudinaryError: any) {
      console.warn('⚠️ Cloudinary deletion failed, but continuing with database cleanup:', cloudinaryError.message);
      // Continue with database cleanup even if Cloudinary deletion fails
    }

    // Delete from database
    await Story.findByIdAndDelete(storyId);
    console.log('✅ Story deleted from database');

    return NextResponse.json({
      success: true,
      message: 'Story deleted successfully',
      data: {
        storyId: story._id,
        deletedFromCloudinary: !!cloudinaryPublicId,
        deletedFromDatabase: true,
        mediaType: story.type,
        author: {
          id: user._id,
          username: user.username
        }
      }
    });

  } catch (error: any) {
    console.error('Story deletion error:', error);
    
    // Handle specific Cloudinary errors
    if (error.http_code === 400) {
      return NextResponse.json(
        { 
          error: 'Invalid Cloudinary public ID',
          details: error.message 
        },
        { status: 400 }
      );
    }

    if (error.http_code === 404) {
      return NextResponse.json(
        { 
          error: 'Story not found in Cloudinary',
          details: 'The media file may have already been deleted' 
        },
        { status: 404 }
      );
    }

    // Handle environment variable errors
    if (error.message && error.message.includes('CLOUDINARY')) {
      return NextResponse.json(
        { 
          error: 'Cloudinary configuration error',
          details: 'Please check your Cloudinary environment variables'
        },
        { status: 500 }
      );
    }

    // Handle database connection errors
    if (error.message && error.message.includes('MONGODB')) {
      return NextResponse.json(
        { 
          error: 'Database connection error',
          details: 'Please check your MongoDB connection'
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Error deleting story',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Method to delete multiple stories by user
export async function POST(req: NextRequest) {
  try {
    console.log('🗑️ Starting bulk story deletion...');
    
    await dbConnect();
    console.log('✅ Database connected');

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const deleteExpired = searchParams.get('deleteExpired') === 'true';

    if (!userId) {
      return NextResponse.json(
        { error: 'UserId is required' },
        { status: 400 }
      );
    }

    // Validate user ID
    if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Build filter for stories to delete
    const filter: any = { author: userId };
    
    if (deleteExpired) {
      filter.expiresAt = { $lt: new Date() };
    }

    // Find stories to delete
    const storiesToDelete = await Story.find(filter);
    
    if (storiesToDelete.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No stories found to delete',
        data: {
          deletedCount: 0,
          deletedFromCloudinary: 0,
          deletedFromDatabase: 0
        }
      });
    }

    let deletedFromCloudinary = 0;
    let deletedFromDatabase = 0;

    // Delete each story
    for (const story of storiesToDelete) {
      try {
        // Extract public ID from the media URL
        const urlParts = story.media.split('/');
        const filename = urlParts[urlParts.length - 1];
        const filenameWithoutExtension = filename.split('.')[0];
        const cloudinaryPublicId = `users/${user.username}/story/${story.type}/${filenameWithoutExtension}`;

        // Delete from Cloudinary
        try {
          await new Promise((resolve, reject) => {
            cloudinary.uploader.destroy(
              cloudinaryPublicId,
              { resource_type: story.type === 'video' ? 'video' : 'image' },
              (error, result: any) => {
                if (error) {
                  console.warn('⚠️ Cloudinary deletion failed for story:', story._id, error.message);
                  reject(error);
                } else {
                  console.log('✅ Cloudinary deletion successful for story:', story._id);
                  resolve(result);
                }
              }
            );
          });
          deletedFromCloudinary++;
        } catch (cloudinaryError) {
          console.warn('⚠️ Cloudinary deletion failed for story:', story._id);
        }

        // Delete from database
        await Story.findByIdAndDelete(story._id);
        deletedFromDatabase++;
        
      } catch (storyError) {
        console.error('❌ Error deleting story:', story._id, storyError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Bulk story deletion completed',
      data: {
        totalStories: storiesToDelete.length,
        deletedFromCloudinary,
        deletedFromDatabase,
        author: {
          id: user._id,
          username: user.username
        }
      }
    });

  } catch (error: any) {
    console.error('Bulk story deletion error:', error);
    return NextResponse.json(
      { 
        error: 'Error during bulk story deletion',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
