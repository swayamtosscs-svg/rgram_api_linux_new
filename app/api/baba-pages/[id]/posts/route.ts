import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import BabaPage from '@/lib/models/BabaPage';
import BabaPost from '@/lib/models/BabaPost';
import mongoose from 'mongoose';
import { uploadBabaPageMedia, deleteBabaPageMedia, extractPublicIdFromBabaPageUrl } from '@/utils/babaPagesCloudinary';

// Create a new post for a Baba Ji page
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
    let content: string;
    let mediaArray: any[] = [];

    if (contentType.includes('application/json')) {
      // Handle JSON request
      const body = await request.json();
      content = body.content;
      mediaArray = []; // No media for JSON requests
    } else {
      // Handle form data request
      const formData = await request.formData();
      content = formData.get('content') as string;
      const mediaFiles = formData.getAll('media') as File[];

      // Process media files with Cloudinary
      for (const file of mediaFiles) {
        if (file.size > 0) {
          const uploadResult = await uploadBabaPageMedia(file, id, 'posts');
          
          if (uploadResult.success && uploadResult.data) {
            // Determine file type
            const mimeType = file.type;
            const fileType = mimeType.startsWith('video/') ? 'video' : 'image';
            
            mediaArray.push({
              type: fileType,
              url: uploadResult.data.url,
              filename: uploadResult.data.publicId.split('/').pop() || '',
              size: uploadResult.data.size,
              mimeType: mimeType,
              publicId: uploadResult.data.publicId
            });
          } else {
            console.error('Failed to upload media to Cloudinary:', uploadResult.error);
            return NextResponse.json(
              { success: false, message: 'Failed to upload media: ' + uploadResult.error },
              { status: 500 }
            );
          }
        }
      }
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Content is required' },
        { status: 400 }
      );
    }

    // Create post
    const post = new BabaPost({
      babaPageId: id,
      content: content.trim(),
      media: mediaArray
    });

    await post.save();

    // Update page posts count
    await BabaPage.findByIdAndUpdate(id, { $inc: { postsCount: 1 } });

    return NextResponse.json({
      success: true,
      message: 'Post created successfully',
      data: post
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get all posts for a Baba Ji page
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

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      BabaPost.find({ babaPageId: id, isActive: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BabaPost.countDocuments({ babaPageId: id, isActive: true })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        posts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });

  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
