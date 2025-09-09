import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import BabaPage from '@/lib/models/BabaPage';
import BabaStory from '@/lib/models/BabaStory';
import mongoose from 'mongoose';
import { unlink } from 'fs/promises';
import { join } from 'path';

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

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(storyId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid page ID or story ID' },
        { status: 400 }
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

    // Delete media file from filesystem
    if (story.media && story.media.url) {
      try {
        const filePath = join(process.cwd(), 'public', story.media.url);
        await unlink(filePath);
      } catch (fileError) {
        console.error('Error deleting story media file:', fileError);
      }
    }

    // Soft delete story
    story.isActive = false;
    await story.save();

    // Update page stories count
    await BabaPage.findByIdAndUpdate(id, { $inc: { storiesCount: -1 } });

    return NextResponse.json({
      success: true,
      message: 'Story deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting story:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
