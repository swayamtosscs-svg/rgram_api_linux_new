import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import dbConnect from '@/lib/database';
import Media from '@/models/Media';
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

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert buffer to base64
    const base64String = buffer.toString('base64');
    const fileType = file.type;
    const dataURI = `data:${fileType};base64,${base64String}`;

    // Create user-specific folder structure in Cloudinary using username
    const cloudinaryFolder = `users/${user.username}/${detectedType}s`;
    console.log('📁 Cloudinary folder path:', cloudinaryFolder);
    console.log('👤 Username for folder:', user.username);

    // Upload to Cloudinary with user-specific folder
    const uploadResult = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const uploadOptions = {
        resource_type: detectedType,
        folder: cloudinaryFolder, // This will automatically create the folder structure
        tags: tags ? JSON.parse(tags) : undefined,
        public_id: `${user.username}_${Date.now()}`, // Unique public ID using username
        use_filename: false, // Don't use original filename
        unique_filename: false, // Don't add random strings
        overwrite: false, // Don't overwrite existing files
      };

      console.log('☁️ Uploading to Cloudinary with options:', uploadOptions);
      
      cloudinary.uploader.upload(
        dataURI,
        uploadOptions,
        (error, result: any) => {
          if (error) {
            console.error('❌ Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('✅ Cloudinary upload successful:', {
              public_id: result.public_id,
              folder: result.folder,
              url: result.secure_url
            });
            resolve(result as CloudinaryUploadResult);
          }
        }
      );
    });

    // Save to MongoDB with user association
    const media = await Media.create({
      publicId: uploadResult.public_id,
      url: uploadResult.url,
      secureUrl: uploadResult.secure_url,
      format: uploadResult.format,
      resourceType: detectedType,
      width: uploadResult.width,
      height: uploadResult.height,
      duration: uploadResult.duration,
      title: title || undefined,
      description: description || undefined,
      tags: tags ? JSON.parse(tags) : undefined,
      uploadedBy: userId, // Associate with specific user
    });

    // Update user's media count based on type
    if (detectedType === 'image') {
      await User.findByIdAndUpdate(userId, { $inc: { postsCount: 1 } });
    } else if (detectedType === 'video') {
      await User.findByIdAndUpdate(userId, { $inc: { videosCount: 1 } });
    }

    // Return success response with secure_url and folder path
    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
              data: {
          mediaId: media._id,
          publicId: uploadResult.public_id,
          secureUrl: uploadResult.secure_url,
          folderPath: cloudinaryFolder,
          fileName: `${uploadResult.public_id}.${uploadResult.format}`,
          fileType: detectedType,
          fileSize: file.size,
          dimensions: {
            width: uploadResult.width,
            height: uploadResult.height,
          },
          duration: uploadResult.duration,
          uploadedBy: userId,
          username: user.username,
          uploadedAt: media.createdAt
        }
    });

  } catch (error: any) {
    console.error('Upload error:', error);
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
        error: 'Error uploading file',
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
