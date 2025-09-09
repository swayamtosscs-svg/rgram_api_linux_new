import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import BabaPage from '@/lib/models/BabaPage';
import BabaVideo from '@/lib/models/BabaVideo';
import mongoose from 'mongoose';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// Create a new video/reel for a Baba Ji page
export async function POST(
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

    // Check if request is JSON or form data
    const contentType = request.headers.get('content-type') || '';
    let title: string;
    let description: string;
    let category: string;
    let videoFile: File | null = null;
    let thumbnailFile: File | null = null;

    if (contentType.includes('application/json')) {
      // Handle JSON request
      const body = await request.json();
      title = body.title;
      description = body.description || '';
      category = body.category || 'video';
      videoFile = null; // No video file for JSON requests
      thumbnailFile = null;
    } else {
      // Handle form data request
      const formData = await request.formData();
      title = formData.get('title') as string;
      description = formData.get('description') as string;
      category = formData.get('category') as string;
      videoFile = formData.get('video') as File;
      thumbnailFile = formData.get('thumbnail') as File;
    }

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Title is required' },
        { status: 400 }
      );
    }

    if (videoFile && videoFile.size === 0) {
      return NextResponse.json(
        { success: false, message: 'Video file is required' },
        { status: 400 }
      );
    }

    if (!category || !['reel', 'video'].includes(category)) {
      return NextResponse.json(
        { success: false, message: 'Category must be either "reel" or "video"' },
        { status: 400 }
      );
    }

    // Process video file (only if provided)
    let videoData = null;
    let thumbnailData = null;

    if (videoFile && videoFile.size > 0) {
      const videoBytes = await videoFile.arrayBuffer();
      const videoBuffer = Buffer.from(videoBytes);
      
      // Create directory if it doesn't exist
      const pageDir = join(process.cwd(), 'public', 'assets', 'baba-pages', id, 'videos');
      await mkdir(pageDir, { recursive: true });
      
      // Generate unique filename for video
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const videoExtension = videoFile.name.split('.').pop();
      const videoFilename = `video_${timestamp}_${randomString}.${videoExtension}`;
      const videoFilepath = join(pageDir, videoFilename);
      
      // Save video file
      await writeFile(videoFilepath, videoBuffer);

      videoData = {
        url: `/assets/baba-pages/${id}/videos/${videoFilename}`,
        filename: videoFilename,
        size: videoFile.size,
        duration: 0, // You might want to extract this from the video file
        mimeType: videoFile.type
      };

      // Process thumbnail file if provided
      if (thumbnailFile && thumbnailFile.size > 0) {
        const thumbnailBytes = await thumbnailFile.arrayBuffer();
        const thumbnailBuffer = Buffer.from(thumbnailBytes);
        
        const thumbnailExtension = thumbnailFile.name.split('.').pop();
        const thumbnailFilename = `thumb_${timestamp}_${randomString}.${thumbnailExtension}`;
        const thumbnailFilepath = join(pageDir, thumbnailFilename);
        
        // Save thumbnail file
        await writeFile(thumbnailFilepath, thumbnailBuffer);
        
        thumbnailData = {
          url: `/assets/baba-pages/${id}/videos/${thumbnailFilename}`,
          filename: thumbnailFilename,
          size: thumbnailFile.size,
          mimeType: thumbnailFile.type
        };
      }
    }

    // Create video record
    const videoDataToSave: any = {
      babaPageId: id,
      title: title.trim(),
      description: description?.trim() || '',
      category: category as 'reel' | 'video'
    };

    // Only add video and thumbnail if they exist
    if (videoData) {
      videoDataToSave.video = videoData;
    } else {
      // Add empty video object with defaults
      videoDataToSave.video = {
        url: '',
        filename: '',
        size: 0,
        duration: 0,
        mimeType: ''
      };
    }

    if (thumbnailData) {
      videoDataToSave.thumbnail = thumbnailData;
    }

    console.log('Creating video with data:', JSON.stringify(videoDataToSave, null, 2));
    const video = new BabaVideo(videoDataToSave);

    await video.save();

    // Update page videos count
    await BabaPage.findByIdAndUpdate(id, { $inc: { videosCount: 1 } });

    return NextResponse.json({
      success: true,
      message: 'Video created successfully',
      data: video
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating video:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { success: false, message: 'Internal server error: ' + errorMessage },
      { status: 500 }
    );
  }
}

// Get all videos for a Baba Ji page
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category') || '';

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

    const query: any = { babaPageId: id, isActive: true };
    if (category && ['reel', 'video'].includes(category)) {
      query.category = category;
    }

    const skip = (page - 1) * limit;

    const [videos, total] = await Promise.all([
      BabaVideo.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BabaVideo.countDocuments(query)
    ]);

    return NextResponse.json({
      success: true,
      data: {
        videos,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });

  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
