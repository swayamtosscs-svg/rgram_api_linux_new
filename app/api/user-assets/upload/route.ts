import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import dbConnect from '@/lib/database';
import UserAssets from '@/models/UserAssets';
import User from '@/lib/models/User';
import sharp from 'sharp';

export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Starting user assets upload...');
    
    // Check content type
    const contentType = req.headers.get('content-type');
    console.log('📋 Content-Type:', contentType);
    
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { 
          error: 'Invalid content type',
          details: 'Request must be multipart/form-data',
          received: contentType
        },
        { status: 400 }
      );
    }
    
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
          details: parseError.message
        },
        { status: 400 }
      );
    }
    
    await dbConnect();
    console.log('✅ Database connected');

    // Extract form data
    const file = formData.get('file') as File | null;
    const userId = formData.get('userId') as string | null;
    const title = formData.get('title') as string | null;
    const description = formData.get('description') as string | null;
    const tags = formData.get('tags') as string | null;
    const isPublic = formData.get('isPublic') as string | null;

    console.log('📁 File received:', file ? `${file.name} (${file.size} bytes, ${file.type})` : 'No file');
    console.log('👤 User ID:', userId);

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
    console.log('🔍 Checking if user exists...');
    const user = await User.findById(userId);
    if (!user) {
      console.log('❌ User not found');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    console.log('✅ User found:', user.username);

    // Determine file type
    let fileType: 'image' | 'video';
    const originalFileName = file.name.toLowerCase();
    if (originalFileName.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg|avif)$/)) {
      fileType = 'image';
    } else if (originalFileName.match(/\.(mp4|avi|mov|wmv|flv|webm|mkv|m4v)$/)) {
      fileType = 'video';
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Only images and videos are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB for images, 200MB for videos)
    const maxSize = fileType === 'image' ? 50 * 1024 * 1024 : 200 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { 
          error: `File too large. Maximum size is ${fileType === 'image' ? '50MB' : '200MB'}`,
          receivedSize: file.size,
          maxSize: maxSize
        },
        { status: 400 }
      );
    }

    // Create user-specific directory structure
    console.log('📁 Creating directory structure...');
    const userDir = join(process.cwd(), 'public', 'assets', user.username);
    const typeDir = join(userDir, fileType === 'image' ? 'images' : 'videos');
    
    console.log('📁 User directory:', userDir);
    console.log('📁 Type directory:', typeDir);
    
    // Create directories if they don't exist
    try {
      if (!existsSync(userDir)) {
        await mkdir(userDir, { recursive: true });
        console.log('✅ Created user directory');
      }
      if (!existsSync(typeDir)) {
        await mkdir(typeDir, { recursive: true });
        console.log('✅ Created type directory');
      }
    } catch (dirError: any) {
      console.error('❌ Directory creation error:', dirError);
      return NextResponse.json(
        { 
          error: 'Failed to create directories',
          details: dirError.message
        },
        { status: 500 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${user.username}_${timestamp}_${randomString}.${fileExtension}`;
    const filePath = join(typeDir, fileName);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let fileMetadata: any = {
      width: undefined,
      height: undefined,
      duration: undefined
    };

    // Process file based on type
    if (fileType === 'image') {
      try {
        const image = sharp(buffer);
        const metadata = await image.metadata();
        fileMetadata.width = metadata.width;
        fileMetadata.height = metadata.height;
        
        // Optimize image (resize if too large, convert to webp for better compression)
        const optimizedBuffer = await image
          .resize(1920, 1080, { 
            fit: 'inside', 
            withoutEnlargement: true 
          })
          .webp({ quality: 85 })
          .toBuffer();
        
        await writeFile(filePath, optimizedBuffer);
        console.log('✅ Image processed and saved with optimization');
      } catch (error) {
        console.error('❌ Image processing error:', error);
        // Fallback: save original file
        await writeFile(filePath, buffer);
        console.log('✅ Image saved (fallback - no optimization)');
      }
    } else {
      // For videos, save as-is (could add video processing here if needed)
      await writeFile(filePath, buffer);
      console.log('✅ Video saved');
    }

    // Generate public URL
    const publicUrl = `/assets/${user.username}/${fileType === 'image' ? 'images' : 'videos'}/${fileName}`;

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

    // Save to database
    console.log('💾 Saving to database...');
    let userAsset;
    try {
      userAsset = await UserAssets.create({
        userId: userId,
        fileName: fileName,
        originalName: file.name,
        filePath: filePath,
        publicUrl: publicUrl,
        fileType: fileType,
        mimeType: file.type,
        fileSize: file.size,
        width: fileMetadata.width,
        height: fileMetadata.height,
        duration: fileMetadata.duration,
        title: title || undefined,
        description: description || undefined,
        tags: parsedTags,
        isPublic: isPublic !== 'false' // Default to true unless explicitly set to false
      });
      console.log('✅ Asset saved to database');
    } catch (dbError: any) {
      console.error('❌ Database save error:', dbError);
      return NextResponse.json(
        { 
          error: 'Failed to save asset to database',
          details: dbError.message
        },
        { status: 500 }
      );
    }

    // Update user's asset count
    try {
      if (fileType === 'image') {
        await User.findByIdAndUpdate(userId, { $inc: { postsCount: 1 } });
      } else {
        await User.findByIdAndUpdate(userId, { $inc: { videosCount: 1 } });
      }
      console.log('✅ User asset counts updated');
    } catch (countError: any) {
      console.warn('⚠️ Failed to update user counts:', countError.message);
      // Don't fail the upload for this
    }

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        assetId: userAsset._id,
        fileName: fileName,
        originalName: file.name,
        publicUrl: publicUrl,
        fileType: fileType,
        fileSize: file.size,
        dimensions: {
          width: fileMetadata.width,
          height: fileMetadata.height
        },
        duration: fileMetadata.duration,
        uploadedBy: {
          userId: user._id,
          username: user.username,
          fullName: user.fullName
        },
        uploadedAt: userAsset.uploadedAt,
        isPublic: userAsset.isPublic
      }
    });

  } catch (error: any) {
    console.error('❌ Upload error:', error);
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
