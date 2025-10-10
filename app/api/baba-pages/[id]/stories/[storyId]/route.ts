import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import BabaPage from '@/lib/models/BabaPage';
import BabaStory from '@/lib/models/BabaStory';
import mongoose from 'mongoose';
import { deleteBabaPageFileByUrl } from '@/utils/babaPagesLocalStorage';
import { verifyToken } from '@/lib/utils/auth';

// Get a specific story
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; storyId: string } }
) {
  try {
    await connectDB();
    
    const { id, storyId } = params;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(storyId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid page ID or story ID' },
        { status: 400 }
      );
    }

    const story = await BabaStory.findOne({ 
      _id: storyId, 
      babaPageId: id, 
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).lean();

    if (!story) {
      return NextResponse.json(
        { success: false, message: 'Story not found or expired' },
        { status: 404 }
      );
    }

    // Increment view count
    await BabaStory.findByIdAndUpdate(storyId, { $inc: { viewsCount: 1 } });

    return NextResponse.json({
      success: true,
      data: story
    });

  } catch (error) {
    console.error('Error fetching story:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete a story (manual deletion by user)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; storyId: string } }
) {
  try {
    await connectDB();
    
    const { id, storyId } = params;

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
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(storyId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid page ID or story ID' },
        { status: 400 }
      );
    }

    // Check if page exists and user is the creator
    const babaPage = await BabaPage.findById(id);
    if (!babaPage) {
      return NextResponse.json(
        { success: false, message: 'Baba Ji page not found' },
        { status: 404 }
      );
    }

    if (babaPage.createdBy.toString() !== decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'Only the page creator can delete stories' },
        { status: 403 }
      );
    }

    const story = await BabaStory.findOne({ 
      _id: storyId, 
      babaPageId: id, 
      isActive: true 
    });

    if (!story) {
      return NextResponse.json(
        { success: false, message: 'Story not found' },
        { status: 404 }
      );
    }

    // Delete media file from local storage
    let mediaDeleteSuccess = false;
    if (story.media && story.media.url && story.media.url.startsWith('/uploads/')) {
      try {
        const deleteResult = await deleteBabaPageFileByUrl(story.media.url);
        if (deleteResult.success) {
          mediaDeleteSuccess = true;
          console.log('Successfully deleted story media from local storage:', story.media.url);
        } else {
          console.error('Failed to delete story media from local storage:', deleteResult.error);
        }
      } catch (fileError) {
        console.error('Error deleting story media file:', fileError);
      }
    }

    // Delete story from MongoDB
    await BabaStory.findByIdAndDelete(storyId);

    // Update page stories count
    await BabaPage.findByIdAndUpdate(id, { $inc: { storiesCount: -1 } });

    return NextResponse.json({
      success: true,
      message: 'Story deleted successfully from MongoDB and local storage',
      data: {
        deletedStory: {
          id: story._id,
          content: story.content,
          mediaType: story.media?.type || 'unknown'
        },
        deletedMedia: {
          url: story.media?.url || '',
          fileName: story.media?.fileName || 'unknown',
          success: mediaDeleteSuccess
        },
        deletedAt: new Date().toISOString(),
        deletionStatus: {
          localStorage: mediaDeleteSuccess ? 'success' : 'partial',
          database: 'success'
        }
      }
    });

  } catch (error) {
    console.error('Error deleting story:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
