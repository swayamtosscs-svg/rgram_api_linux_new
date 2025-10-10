import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import Media from '@/models/Media';
import User from '@/lib/models/User';
import { uploadFileToLocal, validateFileType, validateFileSize } from '@/utils/localStorage';

export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Starting media upload...');
    console.log('📝 Request headers:', Object.fromEntries(req.headers.entries()));
    
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
      console.error('❌ Error details:', parseError.message);
      console.error('❌ Error stack:', parseError.stack);
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
    const type = formData.get('type') as 'image' | 'video' | null;
    const userId = formData.get('userId') as string | null;
    const title = formData.get('title') as string | null;
    const description = formData.get('description') as string | null;
    const tags = formData.get('tags') as string | null;

    console.log('📁 File received:', file ? `${file.name} (${file.size} bytes, ${file.type})` : 'No file');
    console.log('👤 User ID:', userId);
    console.log('🏷️ Type:', type);
    console.log('📝 Title:', title);

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Auto-detect file type if not provided
    let detectedType = type;
    if (!detectedType) {
      const fileName = file.name.toLowerCase();
      if (fileName.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/)) {
        detectedType = 'image';
      } else if (fileName.match(/\.(mp4|avi|mov|wmv|flv|webm|mkv)$/)) {
        detectedType = 'video';
      } else {
        return NextResponse.json(
          { error: 'Media type is required. Please provide type=image or type=video' },
          { status: 400 }
        );
      }
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

    // Validate media type
    if (!['image', 'video'].includes(detectedType)) {
      return NextResponse.json(
        { error: 'Invalid media type. Type must be either "image" or "video"' },
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

    // Validate file type
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml'];
    const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm', 'video/mkv'];
    const allowedTypes = detectedType === 'image' ? allowedImageTypes : allowedVideoTypes;
    
    if (!validateFileType(file, allowedTypes)) {
      return NextResponse.json(
        { error: `Invalid file type for ${detectedType}. Allowed types: ${allowedTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (!validateFileSize(file, maxSize)) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 100MB' },
        { status: 400 }
      );
    }

    // Upload to local storage
    console.log('📁 Uploading to local storage...');
    const uploadResult = await uploadFileToLocal(file, userId, detectedType === 'image' ? 'images' : 'videos');
    
    if (!uploadResult.success || !uploadResult.data) {
      return NextResponse.json(
        { error: 'Failed to upload file to local storage', details: uploadResult.error },
        { status: 500 }
      );
    }

    console.log('✅ Local storage upload successful:', {
      fileName: uploadResult.data.fileName,
      publicUrl: uploadResult.data.publicUrl,
      fileSize: uploadResult.data.fileSize
    });

    // Save to MongoDB with user association
    const media = await Media.create({
      // Local storage fields
      fileName: uploadResult.data.fileName,
      filePath: uploadResult.data.filePath,
      publicUrl: uploadResult.data.publicUrl,
      fileSize: uploadResult.data.fileSize,
      mimeType: uploadResult.data.mimeType,
      
      // Common fields
      format: file.name.split('.').pop() || 'unknown',
      resourceType: detectedType,
      width: uploadResult.data.dimensions?.width,
      height: uploadResult.data.dimensions?.height,
      duration: uploadResult.data.duration,
      title: title || undefined,
      description: description || undefined,
      tags: tags ? JSON.parse(tags) : undefined,
      uploadedBy: userId, // Associate with specific user
      storageType: 'local'
    });

    // Update user's media count based on type
    if (detectedType === 'image') {
      await User.findByIdAndUpdate(userId, { $inc: { postsCount: 1 } });
    } else if (detectedType === 'video') {
      await User.findByIdAndUpdate(userId, { $inc: { videosCount: 1 } });
    }

    // Return success response with local storage data
    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully to local storage',
      data: {
        mediaId: media._id,
        fileName: uploadResult.data.fileName,
        publicUrl: uploadResult.data.publicUrl,
        filePath: uploadResult.data.filePath,
        fileType: detectedType,
        fileSize: uploadResult.data.fileSize,
        mimeType: uploadResult.data.mimeType,
        dimensions: uploadResult.data.dimensions,
        duration: uploadResult.data.duration,
        uploadedBy: userId,
        username: user.username,
        uploadedAt: media.createdAt,
        storageType: 'local'
      }
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    console.error('Error stack:', error.stack);
    
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

    return NextResponse.json(
      { 
        error: 'Error uploading file to local storage',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required as query parameter' },
        { status: 400 }
      );
    }

    // Validate user ID format
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

    // Get query parameters for pagination and filtering
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type') as 'image' | 'video' | null;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build filter object
    const filter: any = { uploadedBy: userId };
    if (type && ['image', 'video'].includes(type)) {
      filter.resourceType = type;
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get media with pagination
    const media = await Media.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('uploadedBy', 'username fullName avatar');

    // Get total count for pagination
    const total = await Media.countDocuments(filter);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          fullName: user.fullName,
          avatar: user.avatar
        },
        media,
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
    console.error('Fetch error:', error);
    return NextResponse.json(
      { 
        error: 'Error fetching media',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
