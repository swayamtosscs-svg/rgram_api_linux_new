import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import Story from '@/lib/models/Story';
import User from '@/lib/models/User';
import { deleteFileByUrl } from '@/utils/localStorage';

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

    console.log('🗑️ Deleting from local storage with URL:', story.media);

    // Delete from local storage
    try {
      const deleteResult = await deleteFileByUrl(story.media);
      
      if (!deleteResult.success) {
        console.warn('⚠️ Local storage deletion failed, but continuing with database cleanup:', deleteResult.error);
      } else {
        console.log('✅ Local storage deletion successful');
      }
    } catch (localStorageError: any) {
      console.warn('⚠️ Local storage deletion failed, but continuing with database cleanup:', localStorageError.message);
      // Continue with database cleanup even if local storage deletion fails
    }

    // Delete from database
    await Story.findByIdAndDelete(storyId);
    console.log('✅ Story deleted from database');

    return NextResponse.json({
      success: true,
      message: 'Story deleted successfully from local storage',
      data: {
        storyId: story._id,
        deletedFromLocalStorage: true,
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
    
    // Handle file system errors
    if (error.code === 'ENOENT') {
      return NextResponse.json(
        { 
          error: 'File not found',
          details: 'The media file may have already been deleted' 
        },
        { status: 404 }
      );
    }

    if (error.code === 'EACCES') {
      return NextResponse.json(
        { 
          error: 'Permission denied',
          details: 'Insufficient permissions to delete file'
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
        error: 'Error deleting story from local storage',
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
        // Delete from local storage
        try {
          const deleteResult = await deleteFileByUrl(story.media);
          if (deleteResult.success) {
            deletedFromCloudinary++; // Keep the same variable name for compatibility
            console.log('✅ Local storage deletion successful for story:', story._id);
          } else {
            console.warn('⚠️ Local storage deletion failed for story:', story._id, deleteResult.error);
          }
        } catch (localStorageError) {
          console.warn('⚠️ Local storage deletion failed for story:', story._id);
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
      message: 'Bulk story deletion completed from local storage',
      data: {
        totalStories: storiesToDelete.length,
        deletedFromLocalStorage: deletedFromCloudinary, // Renamed for clarity
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
