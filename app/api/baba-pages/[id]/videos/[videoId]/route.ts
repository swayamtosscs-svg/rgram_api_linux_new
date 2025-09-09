import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import BabaPage from '@/lib/models/BabaPage';
import BabaVideo from '@/lib/models/BabaVideo';
import mongoose from 'mongoose';
import { unlink } from 'fs/promises';
import { join } from 'path';

// Get a specific video
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; videoId: string } }
) {
  try {
    await connectDB();
    
    const { id, videoId } = params;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(videoId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid page ID or video ID' },
        { status: 400 }
      );
    }

    const video = await BabaVideo.findOne({ 
      _id: videoId, 
      babaPageId: id, 
      isActive: true 
    }).lean();

    if (!video) {
      return NextResponse.json(
        { success: false, message: 'Video not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await BabaVideo.findByIdAndUpdate(videoId, { $inc: { viewsCount: 1 } });

    return NextResponse.json({
      success: true,
      data: video
    });

  } catch (error) {
    console.error('Error fetching video:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update a video
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; videoId: string } }
) {
  try {
    await connectDB();
    
    const { id, videoId } = params;
    const body = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(videoId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid page ID or video ID' },
        { status: 400 }
      );
    }

    const video = await BabaVideo.findOne({ 
      _id: videoId, 
      babaPageId: id, 
      isActive: true 
    });

    if (!video) {
      return NextResponse.json(
        { success: false, message: 'Video not found' },
        { status: 404 }
      );
    }

    // Update fields
    if (body.title) video.title = body.title.trim();
    if (body.description !== undefined) video.description = body.description.trim();

    await video.save();

    return NextResponse.json({
      success: true,
      message: 'Video updated successfully',
      data: video
    });

  } catch (error) {
    console.error('Error updating video:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete a video
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; videoId: string } }
) {
  try {
    await connectDB();
    
    const { id, videoId } = params;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(videoId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid page ID or video ID' },
        { status: 400 }
      );
    }

    const video = await BabaVideo.findOne({ 
      _id: videoId, 
      babaPageId: id, 
      isActive: true 
    });

    if (!video) {
      return NextResponse.json(
        { success: false, message: 'Video not found' },
        { status: 404 }
      );
    }

    // Delete video file from filesystem
    if (video.video && video.video.url) {
      try {
        const videoPath = join(process.cwd(), 'public', video.video.url);
        await unlink(videoPath);
      } catch (fileError) {
        console.error('Error deleting video file:', fileError);
      }
    }

    // Delete thumbnail file if exists
    if (video.thumbnail && video.thumbnail.url) {
      try {
        const thumbnailPath = join(process.cwd(), 'public', video.thumbnail.url);
        await unlink(thumbnailPath);
      } catch (fileError) {
        console.error('Error deleting thumbnail file:', fileError);
      }
    }

    // Soft delete video
    video.isActive = false;
    await video.save();

    // Update page videos count
    await BabaPage.findByIdAndUpdate(id, { $inc: { videosCount: -1 } });

    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting video:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
