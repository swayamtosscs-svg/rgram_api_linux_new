import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import dbConnect from '@/lib/database';
import User from '@/lib/models/User';
import Image from '@/models/Image';

export async function POST(req: NextRequest) {
  try {
    console.log('🖼️ Starting image upload...');
    
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
          details: parseError.message
        },
        { status: 400 }
      );
    }

    const file = formData.get('file') as File | null;
    const username = formData.get('username') as string | null;
    const title = formData.get('title') as string | null;
    const description = formData.get('description') as string | null;
    const tags = formData.get('tags') as string | null;

    console.log('📁 File received:', file ? `${file.name} (${file.size} bytes, ${file.type})` : 'No file');
    console.log('👤 Username:', username);

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB' },
        { status: 400 }
      );
    }

    // Check if user exists - try both exact match and case-insensitive
    let user = await User.findOne({ username: username });
    if (!user) {
      user = await User.findOne({ username: username.toLowerCase() });
    }
    if (!user) {
      user = await User.findOne({ username: username.toUpperCase() });
    }
    
    if (!user) {
      console.log('❌ User not found for username:', username);
      console.log('🔍 Searching for users with similar usernames...');
      
      // Try to find users with similar usernames for debugging
      const similarUsers = await User.find({ 
        username: { $regex: username, $options: 'i' } 
      }).select('username email fullName').limit(5);
      
      console.log('🔍 Similar users found:', similarUsers);
      
      return NextResponse.json(
        { 
          error: 'User not found',
          searchedUsername: username,
          suggestions: similarUsers.map(u => u.username)
        },
        { status: 404 }
      );
    }
    
    console.log('✅ User found:', {
      id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName
    });

    // Create user-specific directory structure
    const userDir = join(process.cwd(), 'public', 'assets', username.toLowerCase());
    const imagesDir = join(userDir, 'images');
    
    // Ensure directories exist
    await mkdir(imagesDir, { recursive: true });
    console.log('📁 Created directory:', imagesDir);

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${username}_${timestamp}_${randomString}.${fileExtension}`;
    const filePath = join(imagesDir, fileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);
    console.log('💾 File saved to:', filePath);

    // Create relative URL for serving
    const relativeUrl = `/assets/${username.toLowerCase()}/images/${fileName}`;
    const fullUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${relativeUrl}`;

    // Save image metadata to MongoDB
    const imageData = {
      fileName,
      originalName: file.name,
      filePath: relativeUrl,
      fullUrl,
      fileSize: file.size,
      mimeType: file.type,
      uploadedBy: user._id,
      username: user.username,
      title: title || undefined,
      description: description || undefined,
      tags: tags ? JSON.parse(tags) : undefined,
      dimensions: {
        width: 0, // Will be updated if we add image processing
        height: 0
      }
    };

    const image = await Image.create(imageData);
    console.log('💾 Image metadata saved to database');

    // Update user's posts count
    await User.findByIdAndUpdate(user._id, { $inc: { postsCount: 1 } });

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        imageId: image._id,
        fileName,
        originalName: file.name,
        filePath: relativeUrl,
        fullUrl,
        fileSize: file.size,
        mimeType: file.type,
        uploadedBy: user._id,
        username: user.username,
        title: title || null,
        description: description || null,
        tags: tags ? JSON.parse(tags) : null,
        uploadedAt: image.createdAt
      }
    });

  } catch (error: any) {
    console.error('❌ Upload error:', error);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json(
      { 
        error: 'Error uploading image',
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
    const username = searchParams.get('username');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required as query parameter' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get images with pagination
    const images = await Image.find({ username: username.toLowerCase() })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('uploadedBy', 'username fullName avatar');

    // Get total count for pagination
    const total = await Image.countDocuments({ username: username.toLowerCase() });

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
        images,
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
    console.error('❌ Fetch error:', error);
    return NextResponse.json(
      { 
        error: 'Error fetching images',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
