import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import BabaPage from '@/lib/models/BabaPage';
import BabaVideo from '@/lib/models/BabaVideo';
import mongoose from 'mongoose';
import { deleteBabaPageMedia, extractPublicIdFromBabaPageUrl } from '@/utils/babaPagesCloudinary';

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

    // Delete video file from Cloudinary
    if (video.video && video.video.url) {
      try {
        // Check if video has publicId (new Cloudinary format) or extract from URL
        let publicId = (video.video as any).publicId;
        if (!publicId) {
          publicId = extractPublicIdFromBabaPageUrl(video.video.url);
        }
        
        if (publicId) {
          const deleteResult = await deleteBabaPageMedia(publicId, 'video');
          if (!deleteResult.success) {
            console.error('Failed to delete video from Cloudinary:', deleteResult.error);
          }
        }
      } catch (fileError) {
        console.error('Error deleting video file:', fileError);
      }
    }

    // Delete thumbnail file from Cloudinary if exists
    if (video.thumbnail && video.thumbnail.url) {
      try {
        // Check if thumbnail has publicId (new Cloudinary format) or extract from URL
        let publicId = (video.thumbnail as any).publicId;
        if (!publicId) {
          publicId = extractPublicIdFromBabaPageUrl(video.thumbnail.url);
        }
        
        if (publicId) {
          const deleteResult = await deleteBabaPageMedia(publicId, 'image');
          if (!deleteResult.success) {
            console.error('Failed to delete thumbnail from Cloudinary:', deleteResult.error);
          }
        }
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
