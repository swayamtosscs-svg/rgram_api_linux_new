import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import dbConnect from '@/lib/database';
import BabaStory from '../../../../models/BabaStory';
import Baba from '../../../../models/Baba';
import sharp from 'sharp';

export async function POST(req: NextRequest) {
  try {
    console.log('📱 Creating baba story...');
    
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
    const mediaFile = formData.get('media') as File | null;
    const babaId = formData.get('babaId') as string | null;
    const content = formData.get('content') as string | null;
    const category = formData.get('category') as string | null;

    // Validate required fields
    if (!babaId || !mediaFile) {
      return NextResponse.json(
        { error: 'Missing required fields: babaId, media' },
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

    // Determine media type
    let mediaType: 'image' | 'video';
    const originalFileName = mediaFile.name.toLowerCase();
    if (originalFileName.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg|avif)$/)) {
      mediaType = 'image';
    } else if (originalFileName.match(/\.(mp4|avi|mov|wmv|flv|webm|mkv|m4v)$/)) {
      mediaType = 'video';
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Only images and videos are allowed' },
        { status: 400 }
      );
    }

    // Validate file size
    const maxSize = mediaType === 'image' ? 10 * 1024 * 1024 : 100 * 1024 * 1024; // 10MB for images, 100MB for videos
    if (mediaFile.size > maxSize) {
      return NextResponse.json(
        { 
          error: `File too large. Maximum size is ${mediaType === 'image' ? '10MB' : '100MB'}`,
          receivedSize: mediaFile.size,
          maxSize: maxSize
        },
        { status: 400 }
      );
    }

    // Create baba-specific directory structure
    const babaDir = join(process.cwd(), 'public', 'babaji-pages', babaId, 'stories');
    
    // Create directories if they don't exist
    if (!existsSync(babaDir)) {
      await mkdir(babaDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileExtension = mediaFile.name.split('.').pop();
    const fileName = `story_${timestamp}_${randomString}.${fileExtension}`;
    const filePath = join(babaDir, fileName);

    // Convert file to buffer
    const bytes = await mediaFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let mediaUrl = '';
    let mediaPath = '';
    let publicUrl = '';
    let thumbnailUrl = '';
    let thumbnailPath = '';
    let duration = 0;
    let format = fileExtension || '';

    // Process media based on type
    if (mediaType === 'image') {
      try {
        const image = sharp(buffer);
        const metadata = await image.metadata();
        
        // Optimize image for story (square format)
        const optimizedBuffer = await image
          .resize(1080, 1080, { 
            fit: 'cover',
            position: 'center'
          })
          .webp({ quality: 90 })
          .toBuffer();
        
        await writeFile(filePath, optimizedBuffer);
        console.log('✅ Story image processed and saved');
        
        mediaUrl = `/babaji-pages/${babaId}/stories/${fileName}`;
        mediaPath = filePath;
        publicUrl = mediaUrl;
        format = 'webp';
      } catch (error) {
        console.error('❌ Image processing error:', error);
        // Fallback: save original file
        await writeFile(filePath, buffer);
        mediaUrl = `/babaji-pages/${babaId}/stories/${fileName}`;
        mediaPath = filePath;
        publicUrl = mediaUrl;
        format = fileExtension || '';
      }
    } else {
      // For videos, save as-is
      await writeFile(filePath, buffer);
      console.log('✅ Story video saved');
      
      mediaUrl = `/babaji-pages/${babaId}/stories/${fileName}`;
      mediaPath = filePath;
      publicUrl = mediaUrl;
      format = fileExtension || '';
      
      // Generate thumbnail for video
      try {
        const thumbnailFileName = `thumb_${timestamp}_${randomString}.webp`;
        const thumbnailFilePath = join(babaDir, thumbnailFileName);
        
        // For now, we'll use a placeholder thumbnail
        // In production, you might want to use ffmpeg to extract a frame
        const thumbnailBuffer = await sharp({
          create: {
            width: 640,
            height: 640,
            channels: 3,
            background: { r: 0, g: 0, b: 0 }
          }
        })
        .webp({ quality: 90 })
        .toBuffer();
        
        await writeFile(thumbnailFilePath, thumbnailBuffer);
        thumbnailUrl = `/babaji-pages/${babaId}/stories/${thumbnailFileName}`;
        thumbnailPath = thumbnailFilePath;
        console.log('✅ Video thumbnail generated');
      } catch (error) {
        console.warn('⚠️ Could not generate video thumbnail:', error);
      }
    }

    // Create story record
    const story = await BabaStory.create({
      babaId,
      content: content || '',
      mediaType,
      mediaUrl,
      mediaPath,
      publicUrl,
      thumbnailUrl,
      thumbnailPath,
      duration,
      fileSize: mediaFile.size,
      format,
      category: category || 'daily'
    });

    // Update baba's story count
    await Baba.findOneAndUpdate(
      { babaId },
      { $inc: { storiesCount: 1 } }
    );

    console.log('✅ Baba story created successfully');

    return NextResponse.json({
      success: true,
      message: 'Story created successfully',
      data: {
        storyId: story._id,
        babaId: story.babaId,
        content: story.content,
        mediaType: story.mediaType,
        mediaUrl: story.mediaUrl,
        publicUrl: story.publicUrl,
        thumbnailUrl: story.thumbnailUrl,
        duration: story.duration,
        fileSize: story.fileSize,
        format: story.format,
        category: story.category,
        viewsCount: story.viewsCount,
        likesCount: story.likesCount,
        expiresAt: story.expiresAt,
        publishedAt: story.publishedAt
      }
    });

  } catch (error: any) {
    console.error('❌ Create story error:', error);
    return NextResponse.json(
      { 
        error: 'Error creating story',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    console.log('📱 Retrieving baba stories...');
    
    await dbConnect();
    console.log('✅ Database connected');

    const { searchParams } = new URL(req.url);
    const babaId = searchParams.get('babaId');
    const storyId = searchParams.get('storyId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category') || '';

    // If specific storyId is provided
    if (storyId) {
      const story = await BabaStory.findById(storyId);
      
      if (!story) {
        return NextResponse.json(
          { error: 'Story not found' },
          { status: 404 }
        );
      }

      // Check if story has expired
      if (story.expiresAt && new Date() > story.expiresAt) {
        // Auto-delete expired story
        try {
          // Delete media file if exists
          if (story.mediaPath && existsSync(story.mediaPath)) {
            const { unlink } = await import('fs/promises');
            await unlink(story.mediaPath);
            console.log('✅ Auto-deleted expired story media file');
          }
          
          // Delete thumbnail file if exists
          if (story.thumbnailPath && existsSync(story.thumbnailPath)) {
            const { unlink } = await import('fs/promises');
            await unlink(story.thumbnailPath);
            console.log('✅ Auto-deleted expired story thumbnail file');
          }
          
          // Delete from database
          await BabaStory.findByIdAndDelete(storyId);
          
          // Update baba's story count
          await Baba.findOneAndUpdate(
            { babaId: story.babaId },
            { $inc: { storiesCount: -1 } }
          );
          
          console.log('✅ Auto-deleted expired story from database');
        } catch (error) {
          console.warn('⚠️ Error auto-deleting expired story:', error);
        }
        
        return NextResponse.json(
          { error: 'Story has expired and been automatically deleted' },
          { status: 410 }
        );
      }

      // Increment view count
      await BabaStory.findByIdAndUpdate(storyId, { $inc: { viewsCount: 1 } });

      return NextResponse.json({
        success: true,
        data: {
          story: {
            id: story._id,
            babaId: story.babaId,
            content: story.content,
            mediaType: story.mediaType,
            mediaUrl: story.mediaUrl,
            publicUrl: story.publicUrl,
            thumbnailUrl: story.thumbnailUrl,
            duration: story.duration,
            fileSize: story.fileSize,
            format: story.format,
            category: story.category,
            isPublic: story.isPublic,
            viewsCount: story.viewsCount + 1,
            likesCount: story.likesCount,
            sharesCount: story.sharesCount,
            expiresAt: story.expiresAt,
            publishedAt: story.publishedAt,
            createdAt: story.createdAt
          }
        }
      });
    }

    // Validate babaId for listing stories
    if (!babaId) {
      return NextResponse.json(
        { error: 'Baba ID is required' },
        { status: 400 }
      );
    }

    // Build filter
    const filter: any = { 
      babaId, 
      isPublic: true,
      expiresAt: { $gt: new Date() } // Only non-expired stories
    };
    
    if (category) {
      filter.category = category;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get stories with pagination
    const stories = await BabaStory.find(filter)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await BabaStory.countDocuments(filter);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    console.log('✅ Baba stories retrieved successfully');

    return NextResponse.json({
      success: true,
      data: {
        stories: stories.map(story => ({
          id: story._id,
          babaId: story.babaId,
          content: story.content,
          mediaType: story.mediaType,
          mediaUrl: story.mediaUrl,
          publicUrl: story.publicUrl,
          thumbnailUrl: story.thumbnailUrl,
          duration: story.duration,
          fileSize: story.fileSize,
          format: story.format,
          category: story.category,
          isPublic: story.isPublic,
          viewsCount: story.viewsCount,
          likesCount: story.likesCount,
          sharesCount: story.sharesCount,
          expiresAt: story.expiresAt,
          publishedAt: story.publishedAt,
          createdAt: story.createdAt
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
    console.error('❌ Retrieve stories error:', error);
    return NextResponse.json(
      { 
        error: 'Error retrieving stories',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    console.log('🗑️ Deleting baba story...');
    
    await dbConnect();
    console.log('✅ Database connected');

    const { searchParams } = new URL(req.url);
    const storyId = searchParams.get('storyId');

    if (!storyId) {
      return NextResponse.json(
        { error: 'Story ID is required' },
        { status: 400 }
      );
    }

    // Find story
    const story = await BabaStory.findById(storyId);
    if (!story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    // Delete media file if exists
    if (story.mediaPath && existsSync(story.mediaPath)) {
      try {
        const { unlink } = await import('fs/promises');
        await unlink(story.mediaPath);
        console.log('✅ Media file deleted');
      } catch (error) {
        console.warn('⚠️ Could not delete media file:', error);
      }
    }

    // Delete thumbnail file if exists
    if (story.thumbnailPath && existsSync(story.thumbnailPath)) {
      try {
        const { unlink } = await import('fs/promises');
        await unlink(story.thumbnailPath);
        console.log('✅ Thumbnail file deleted');
      } catch (error) {
        console.warn('⚠️ Could not delete thumbnail file:', error);
      }
    }

    // Delete story from database
    await BabaStory.findByIdAndDelete(storyId);

    // Update baba's story count
    await Baba.findOneAndUpdate(
      { babaId: story.babaId },
      { $inc: { storiesCount: -1 } }
    );

    console.log('✅ Baba story deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Story deleted successfully',
      data: {
        storyId: story._id,
        babaId: story.babaId,
        content: story.content,
        deletedAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ Delete story error:', error);
    return NextResponse.json(
      { 
        error: 'Error deleting story',
        details: error.message
      },
      { status: 500 }
    );
  }
}
