import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import Story from '@/lib/models/Story';
import User from '@/lib/models/User';
import { uploadFileToLocal } from '@/utils/localStorage';

export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Starting story media upload...');
    
    // Check content type
    const contentType = req.headers.get('content-type');
    console.log('📋 Content-Type:', contentType);
    
    if (!contentType || !contentType.includes('multipart/form-data')) {
      console.log('❌ Invalid content type');
      return NextResponse.json(
        { 
          error: 'Invalid content type',
          details: 'Request must be multipart/form-data',
          received: contentType
        },
        { status: 400 }
      );
    }
    
    await dbConnect();
    console.log('✅ Database connected');

    console.log('📋 Parsing form data...');
    let formData;
    try {
      formData = await req.formData();
      console.log('✅ Form data parsed successfully');
    } catch (parseError: any) {
      console.error('❌ Form data parsing error:', parseError);
      return NextResponse.json(
        { 
          error: 'Failed to parse form data',
          details: parseError.message,
          type: parseError.constructor.name
        },
        { status: 400 }
      );
    }

    const file = formData.get('file') as File | null;
    const userId = formData.get('userId') as string | null;
    const caption = formData.get('caption') as string | null;
    const mentions = formData.get('mentions') as string | null;
    const hashtags = formData.get('hashtags') as string | null;
    const location = formData.get('location') as string | null;

    console.log('📁 File received:', file ? `${file.name} (${file.size} bytes, ${file.type})` : 'No file');
    console.log('👤 User ID:', userId);
    console.log('📝 Caption:', caption);

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate user ID format (MongoDB ObjectId)
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

    // Auto-detect file type
    const fileName = file.name.toLowerCase();
    let mediaType: 'image' | 'video';
    
    if (fileName.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/)) {
      mediaType = 'image';
    } else if (fileName.match(/\.(mp4|avi|mov|wmv|flv|webm|mkv)$/)) {
      mediaType = 'video';
    } else {
      return NextResponse.json(
        { error: 'Unsupported file format. Please upload image or video files only.' },
        { status: 400 }
      );
    }

    // Upload to local storage
    console.log('📁 Uploading story to local storage...');
    const uploadResult = await uploadFileToLocal(file, userId, 'stories');
    
    if (!uploadResult.success || !uploadResult.data) {
      return NextResponse.json(
        { error: 'Failed to upload story to local storage', details: uploadResult.error },
        { status: 500 }
      );
    }

    console.log('✅ Local storage upload successful:', {
      fileName: uploadResult.data.fileName,
      publicUrl: uploadResult.data.publicUrl,
      fileSize: uploadResult.data.fileSize
    });

    // Parse mentions and hashtags
    let parsedMentions: string[] = [];
    let parsedHashtags: string[] = [];

    if (mentions) {
      try {
        parsedMentions = JSON.parse(mentions);
      } catch (e) {
        console.warn('⚠️ Invalid mentions format, using empty array');
      }
    }

    if (hashtags) {
      try {
        parsedHashtags = JSON.parse(hashtags);
      } catch (e) {
        console.warn('⚠️ Invalid hashtags format, using empty array');
      }
    }

    // Create story in database
    const story = await Story.create({
      author: userId,
      media: uploadResult.data.publicUrl,
      type: mediaType,
      caption: caption || undefined,
      mentions: parsedMentions,
      hashtags: parsedHashtags,
      location: location || undefined,
      isActive: true,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      views: [],
      viewsCount: 0
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Story uploaded successfully to local storage',
      data: {
        storyId: story._id,
        fileName: uploadResult.data.fileName,
        publicUrl: uploadResult.data.publicUrl,
        filePath: uploadResult.data.filePath,
        mediaType: mediaType,
        fileSize: uploadResult.data.fileSize,
        dimensions: uploadResult.data.dimensions,
        duration: uploadResult.data.duration,
        author: {
          id: user._id,
          username: user.username,
          fullName: user.fullName
        },
        caption: story.caption,
        mentions: story.mentions,
        hashtags: story.hashtags,
        location: story.location,
        expiresAt: story.expiresAt,
        createdAt: story.createdAt,
        storageType: 'local'
      }
    });

  } catch (error: any) {
    console.error('Story upload error:', error);
    console.error('Error stack:', error.stack);
    
    // Handle file system errors
    if (error.code === 'ENOENT') {
      return NextResponse.json(
        { 
          error: 'File system error',
          details: 'Directory or file not found'
        },
        { status: 500 }
      );
    }

    if (error.code === 'EACCES') {
      return NextResponse.json(
        { 
          error: 'Permission denied',
          details: 'Insufficient permissions to write file'
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
        error: 'Error uploading story to local storage',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
