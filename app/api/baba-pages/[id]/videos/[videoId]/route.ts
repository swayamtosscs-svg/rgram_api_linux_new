import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import BabaPage from '@/lib/models/BabaPage';
import BabaVideo from '@/lib/models/BabaVideo';
import mongoose from 'mongoose';
import { deleteBabaPageFileByUrl } from '@/utils/babaPagesLocalStorage';

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

    // Delete video file from local storage
    let videoDeleteSuccess = false;
    if (video.video && video.video.url && video.video.url.startsWith('/uploads/')) {
      try {
        const deleteResult = await deleteBabaPageFileByUrl(video.video.url);
        if (deleteResult.success) {
          videoDeleteSuccess = true;
          console.log('Successfully deleted video from local storage:', video.video.url);
        } else {
          console.error('Failed to delete video from local storage:', deleteResult.error);
        }
      } catch (fileError) {
        console.error('Error deleting video file:', fileError);
      }
    }

    // Delete thumbnail file from local storage if exists
    let thumbnailDeleteSuccess = false;
    if (video.thumbnail && video.thumbnail.url && video.thumbnail.url.startsWith('/uploads/')) {
      try {
        const deleteResult = await deleteBabaPageFileByUrl(video.thumbnail.url);
        if (deleteResult.success) {
          thumbnailDeleteSuccess = true;
          console.log('Successfully deleted thumbnail from local storage:', video.thumbnail.url);
        } else {
          console.error('Failed to delete thumbnail from local storage:', deleteResult.error);
        }
      } catch (fileError) {
        console.error('Error deleting thumbnail file:', fileError);
      }
    }

    // Delete video from MongoDB
    await BabaVideo.findByIdAndDelete(videoId);

    // Update page videos count
    await BabaPage.findByIdAndUpdate(id, { $inc: { videosCount: -1 } });

    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully from MongoDB and local storage',
      data: {
        deletedVideo: {
          id: video._id,
          title: video.title,
          category: video.category
        },
        deletedFiles: {
          video: {
            url: video.video?.url || '',
            success: videoDeleteSuccess
          },
          thumbnail: {
            url: video.thumbnail?.url || '',
            success: thumbnailDeleteSuccess
          }
        },
        deletedAt: new Date().toISOString(),
        deletionStatus: {
          localStorage: videoDeleteSuccess && thumbnailDeleteSuccess ? 'success' : 'partial',
          database: 'success'
        }
      }
    });

  } catch (error) {
    console.error('Error deleting video:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
