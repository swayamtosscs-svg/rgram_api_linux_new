import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import dbConnect from '@/lib/database';
import BabaVideo from '../../../../models/BabaVideo';
import Baba from '../../../../models/Baba';
import sharp from 'sharp';

export async function POST(req: NextRequest) {
  try {
    console.log('🎥 Creating baba video...');
    
    await dbConnect();
    console.log('✅ Database connected');

    // Check content type
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { 
          error: 'Invalid content type',
          details: 'Request must be multipart/form-data'
        },
        { status: 400 }
      );
    }

    // Parse form data
    const formData = await req.formData();
    const videoFile = formData.get('video') as File | null;
    const thumbnailFile = formData.get('thumbnail') as File | null;
    const babaId = formData.get('babaId') as string | null;
    const title = formData.get('title') as string | null;
    const description = formData.get('description') as string | null;
    const category = formData.get('category') as string | null;
    const tags = formData.get('tags') as string | null;
    const isPublic = formData.get('isPublic') as string | null;

    // Validate required fields
    if (!babaId || !title || !videoFile) {
      return NextResponse.json(
        { error: 'Missing required fields: babaId, title, video' },
        { status: 400 }
      );
    }

    // Check if baba exists
    const baba = await Baba.findOne({ babaId });
    if (!baba) {
      return NextResponse.json(
        { error: 'Baba not found' },
        { status: 404 }
      );
    }

    // Validate video file type
    const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm', 'video/mkv'];
    if (!allowedVideoTypes.includes(videoFile.type)) {
      return NextResponse.json(
        { error: 'Invalid video file type. Only MP4, AVI, MOV, WMV, WebM, MKV are allowed' },
        { status: 400 }
      );
    }

    // Validate video file size (max 500MB)
    const maxVideoSize = 500 * 1024 * 1024; // 500MB
    if (videoFile.size > maxVideoSize) {
      return NextResponse.json(
        { error: 'Video file too large. Maximum size is 500MB' },
        { status: 400 }
      );
    }

    // Create baba-specific directory structure
    const babaDir = join(process.cwd(), 'public', 'babaji-pages', babaId, 'videos');
    
    // Create directories if they don't exist
    if (!existsSync(babaDir)) {
      await mkdir(babaDir, { recursive: true });
    }

    // Generate unique filename for video
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const videoExtension = videoFile.name.split('.').pop();
    const videoFileName = `video_${timestamp}_${randomString}.${videoExtension}`;
    const videoPath = join(babaDir, videoFileName);

    // Save video file
    const videoBytes = await videoFile.arrayBuffer();
    const videoBuffer = Buffer.from(videoBytes);
    await writeFile(videoPath, videoBuffer);

    const videoUrl = `/babaji-pages/${babaId}/videos/${videoFileName}`;
    const publicUrl = videoUrl;

    // Handle thumbnail generation/upload
    let thumbnailUrl = '';
    let thumbnailPath = '';

    if (thumbnailFile) {
      // Validate thumbnail file type
      const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedImageTypes.includes(thumbnailFile.type)) {
        return NextResponse.json(
          { error: 'Invalid thumbnail file type. Only images are allowed' },
          { status: 400 }
        );
      }

      // Process thumbnail with Sharp
      const thumbnailBytes = await thumbnailFile.arrayBuffer();
      const thumbnailBuffer = Buffer.from(thumbnailBytes);
      
      const thumbnailFileName = `thumb_${timestamp}_${randomString}.webp`;
      const thumbnailFilePath = join(babaDir, thumbnailFileName);

      try {
        const thumbnail = sharp(thumbnailBuffer);
        const optimizedThumbnail = await thumbnail
          .resize(640, 360, { 
            fit: 'cover',
            position: 'center'
          })
          .webp({ quality: 90 })
          .toBuffer();
        
        await writeFile(thumbnailFilePath, optimizedThumbnail);
        thumbnailUrl = `/babaji-pages/${babaId}/videos/${thumbnailFileName}`;
        thumbnailPath = thumbnailFilePath;
        console.log('✅ Thumbnail processed and saved');
      } catch (error) {
        console.error('❌ Thumbnail processing error:', error);
        // Fallback: save original thumbnail
        await writeFile(thumbnailFilePath, thumbnailBuffer);
        thumbnailUrl = `/babaji-pages/${babaId}/videos/${thumbnailFileName}`;
        thumbnailPath = thumbnailFilePath;
      }
    }

    // Parse tags if provided
    let parsedTags: string[] = [];
    if (tags) {
      try {
        parsedTags = JSON.parse(tags);
        if (!Array.isArray(parsedTags)) {
          parsedTags = [];
        }
      } catch (error) {
        console.warn('Invalid tags format, using empty array');
      }
    }

    // Create video record
    const video = await BabaVideo.create({
      babaId,
      title,
      description: description || '',
      videoUrl,
      videoPath,
      publicUrl,
      thumbnailUrl,
      thumbnailPath,
      duration: 0, // Will be updated later with actual duration
      fileSize: videoFile.size,
      format: videoExtension || 'mp4',
      category: category || 'satsang',
      tags: parsedTags,
      isPublic: isPublic !== 'false'
    });

    // Update baba's video count
    await Baba.findOneAndUpdate(
      { babaId },
      { $inc: { videosCount: 1 } }
    );

    console.log('✅ Baba video created successfully');

    return NextResponse.json({
      success: true,
      message: 'Video uploaded successfully',
      data: {
        videoId: video._id,
        babaId: video.babaId,
        title: video.title,
        description: video.description,
        videoUrl: video.videoUrl,
        publicUrl: video.publicUrl,
        thumbnailUrl: video.thumbnailUrl,
        fileSize: video.fileSize,
        format: video.format,
        category: video.category,
        tags: video.tags,
        isPublic: video.isPublic,
        likesCount: video.likesCount,
        viewsCount: video.viewsCount,
        publishedAt: video.publishedAt
      }
    });

  } catch (error: any) {
    console.error('❌ Create video error:', error);
    return NextResponse.json(
      { 
        error: 'Error uploading video',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    console.log('🎬 Retrieving baba videos...');
    
    await dbConnect();
    console.log('✅ Database connected');

    const { searchParams } = new URL(req.url);
    const babaId = searchParams.get('babaId');
    const videoId = searchParams.get('videoId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';

    // If specific videoId is provided
    if (videoId) {
      const video = await BabaVideo.findById(videoId);
      
      if (!video) {
        return NextResponse.json(
          { error: 'Video not found' },
          { status: 404 }
        );
      }

      // Increment view count
      await BabaVideo.findByIdAndUpdate(videoId, { $inc: { viewsCount: 1 } });

      return NextResponse.json({
        success: true,
        data: {
          video: {
            id: video._id,
            babaId: video.babaId,
            title: video.title,
            description: video.description,
            videoUrl: video.videoUrl,
            publicUrl: video.publicUrl,
            thumbnailUrl: video.thumbnailUrl,
            duration: video.duration,
            fileSize: video.fileSize,
            format: video.format,
            category: video.category,
            tags: video.tags,
            isPublic: video.isPublic,
            isLive: video.isLive,
            likesCount: video.likesCount,
            viewsCount: video.viewsCount + 1,
            sharesCount: video.sharesCount,
            commentsCount: video.commentsCount,
            featured: video.featured,
            publishedAt: video.publishedAt,
            createdAt: video.createdAt
          }
        }
      });
    }

    // Validate babaId for listing videos
    if (!babaId) {
      return NextResponse.json(
        { error: 'Baba ID is required' },
        { status: 400 }
      );
    }

    // Build filter
    const filter: any = { babaId, isPublic: true };
    
    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get videos with pagination
    const videos = await BabaVideo.find(filter)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await BabaVideo.countDocuments(filter);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    console.log('✅ Baba videos retrieved successfully');

    return NextResponse.json({
      success: true,
      data: {
        videos: videos.map(video => ({
          id: video._id,
          babaId: video.babaId,
          title: video.title,
          description: video.description,
          videoUrl: video.videoUrl,
          publicUrl: video.publicUrl,
          thumbnailUrl: video.thumbnailUrl,
          duration: video.duration,
          fileSize: video.fileSize,
          format: video.format,
          category: video.category,
          tags: video.tags,
          isPublic: video.isPublic,
          isLive: video.isLive,
          likesCount: video.likesCount,
          viewsCount: video.viewsCount,
          sharesCount: video.sharesCount,
          commentsCount: video.commentsCount,
          featured: video.featured,
          publishedAt: video.publishedAt,
          createdAt: video.createdAt
        })),
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage,
          hasPrevPage
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Retrieve videos error:', error);
    return NextResponse.json(
      { 
        error: 'Error retrieving videos',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    console.log('🗑️ Deleting baba video...');
    
    await dbConnect();
    console.log('✅ Database connected');

    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get('videoId');

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    // Find video
    const video = await BabaVideo.findById(videoId);
    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    // Delete video file if exists
    if (video.videoPath && existsSync(video.videoPath)) {
      try {
        const { unlink } = await import('fs/promises');
        await unlink(video.videoPath);
        console.log('✅ Video file deleted');
      } catch (error) {
        console.warn('⚠️ Could not delete video file:', error);
      }
    }

    // Delete thumbnail file if exists
    if (video.thumbnailPath && existsSync(video.thumbnailPath)) {
      try {
        const { unlink } = await import('fs/promises');
        await unlink(video.thumbnailPath);
        console.log('✅ Thumbnail file deleted');
      } catch (error) {
        console.warn('⚠️ Could not delete thumbnail file:', error);
      }
    }

    // Delete video from database
    await BabaVideo.findByIdAndDelete(videoId);

    // Update baba's video count
    await Baba.findOneAndUpdate(
      { babaId: video.babaId },
      { $inc: { videosCount: -1 } }
    );

    console.log('✅ Baba video deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully',
      data: {
        videoId: video._id,
        babaId: video.babaId,
        title: video.title,
        deletedAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ Delete video error:', error);
    return NextResponse.json(
      { 
        error: 'Error deleting video',
        details: error.message
      },
      { status: 500 }
    );
  }
}
