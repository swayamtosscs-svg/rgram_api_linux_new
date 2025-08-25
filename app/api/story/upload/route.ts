import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import dbConnect from '@/lib/database';
import Story from '@/lib/models/Story';
import User from '@/lib/models/User';

interface CloudinaryUploadResult {
  url: string;
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  duration?: number;
  resource_type: string;
  folder?: string;
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert buffer to base64
    const base64String = buffer.toString('base64');
    const fileType = file.type;
    const dataURI = `data:${fileType};base64,${base64String}`;

    // Create user-specific story folder structure in Cloudinary organized by media type
    const cloudinaryFolder = `users/${user.username}/story/${mediaType}`;
    console.log('📁 Cloudinary story folder path:', cloudinaryFolder);
    console.log('👤 Username for folder:', user.username);
    console.log('📁 Media type folder:', mediaType);

    // Upload to Cloudinary with user-specific story folder organized by media type
    const uploadResult = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const uploadOptions = {
        resource_type: mediaType,
        folder: cloudinaryFolder,
        public_id: `${user.username}_story_${Date.now()}`,
        use_filename: false,
        unique_filename: false,
        overwrite: false,
      };

      console.log('☁️ Uploading story to Cloudinary with options:', uploadOptions);
      
      cloudinary.uploader.upload(
        dataURI,
        uploadOptions,
        (error, result: any) => {
          if (error) {
            console.error('❌ Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('✅ Cloudinary story upload successful:', {
              public_id: result.public_id,
              folder: result.folder,
              url: result.secure_url
            });
            resolve(result as CloudinaryUploadResult);
          }
        }
      );
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
      media: uploadResult.secure_url,
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
      message: 'Story uploaded successfully',
      data: {
        storyId: story._id,
        publicId: uploadResult.public_id,
        secureUrl: uploadResult.secure_url,
        folderPath: cloudinaryFolder,
        fileName: `${uploadResult.public_id}.${uploadResult.format}`,
        mediaType: mediaType,
        fileSize: file.size,
        dimensions: {
          width: uploadResult.width,
          height: uploadResult.height,
        },
        duration: uploadResult.duration,
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
        createdAt: story.createdAt
      }
    });

  } catch (error: any) {
    console.error('Story upload error:', error);
    console.error('Error stack:', error.stack);
    
    // Handle specific Cloudinary errors
    if (error.http_code === 400) {
      return NextResponse.json(
        { 
          error: 'Invalid file format or size',
          details: error.message 
        },
        { status: 400 }
      );
    }

    if (error.http_code === 413) {
      return NextResponse.json(
        { 
          error: 'File too large',
          details: 'Maximum file size exceeded' 
        },
        { status: 413 }
      );
    }

    // Handle environment variable errors
    if (error.message && error.message.includes('CLOUDINARY')) {
      return NextResponse.json(
        { 
          error: 'Cloudinary configuration error',
          details: 'Please check your Cloudinary environment variables'
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
        error: 'Error uploading story',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
