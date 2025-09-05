import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import dbConnect from '@/lib/database';
import BabaPost from '../../../../models/BabaPost';
import Baba from '../../../../models/Baba';
import sharp from 'sharp';

export async function POST(req: NextRequest) {
  try {
    console.log('📝 Creating baba post...');
    
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
    const file = formData.get('image') as File | null;
    const babaId = formData.get('babaId') as string | null;
    const title = formData.get('title') as string | null;
    const content = formData.get('content') as string | null;
    const category = formData.get('category') as string | null;
    const tags = formData.get('tags') as string | null;
    const isPublic = formData.get('isPublic') as string | null;

    // Validate required fields
    if (!babaId || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: babaId, title, content' },
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

    let imageUrl = '';
    let imagePath = '';
    let publicUrl = '';

    // Handle image upload if provided
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: 'Invalid file type. Only images are allowed' },
          { status: 400 }
        );
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: 'File too large. Maximum size is 10MB' },
          { status: 400 }
        );
      }

      // Create baba-specific directory structure
      const babaDir = join(process.cwd(), 'public', 'babaji-pages', babaId, 'posts');
      
      // Create directories if they don't exist
      if (!existsSync(babaDir)) {
        await mkdir(babaDir, { recursive: true });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const fileExtension = file.name.split('.').pop();
      const fileName = `post_${timestamp}_${randomString}.webp`;
      const filePath = join(babaDir, fileName);

      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Process image with Sharp
      try {
        const image = sharp(buffer);
        const metadata = await image.metadata();
        
        // Optimize image
        const optimizedBuffer = await image
          .resize(1200, 800, { 
            fit: 'inside', 
            withoutEnlargement: true 
          })
          .webp({ quality: 85 })
          .toBuffer();
        
        await writeFile(filePath, optimizedBuffer);
        console.log('✅ Image processed and saved');
        
        imageUrl = `/babaji-pages/${babaId}/posts/${fileName}`;
        imagePath = filePath;
        publicUrl = imageUrl;
      } catch (error) {
        console.error('❌ Image processing error:', error);
        // Fallback: save original file
        await writeFile(filePath, buffer);
        imageUrl = `/babaji-pages/${babaId}/posts/${fileName}`;
        imagePath = filePath;
        publicUrl = imageUrl;
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

    // Create post
    const post = await BabaPost.create({
      babaId,
      title,
      content,
      imageUrl,
      imagePath,
      publicUrl,
      category: category || 'spiritual',
      tags: parsedTags,
      isPublic: isPublic !== 'false'
    });

    // Update baba's post count
    await Baba.findOneAndUpdate(
      { babaId },
      { $inc: { postsCount: 1 } }
    );

    console.log('✅ Baba post created successfully');

    return NextResponse.json({
      success: true,
      message: 'Post created successfully',
      data: {
        postId: post._id,
        babaId: post.babaId,
        title: post.title,
        content: post.content,
        imageUrl: post.imageUrl,
        publicUrl: post.publicUrl,
        category: post.category,
        tags: post.tags,
        isPublic: post.isPublic,
        likesCount: post.likesCount,
        commentsCount: post.commentsCount,
        viewsCount: post.viewsCount,
        publishedAt: post.publishedAt
      }
    });

  } catch (error: any) {
    console.error('❌ Create post error:', error);
    return NextResponse.json(
      { 
        error: 'Error creating post',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    console.log('📖 Retrieving baba posts...');
    
    await dbConnect();
    console.log('✅ Database connected');

    const { searchParams } = new URL(req.url);
    const babaId = searchParams.get('babaId');
    const postId = searchParams.get('postId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';

    // If specific postId is provided
    if (postId) {
      const post = await BabaPost.findById(postId);
      
      if (!post) {
        return NextResponse.json(
          { error: 'Post not found' },
          { status: 404 }
        );
      }

      // Increment view count
      await BabaPost.findByIdAndUpdate(postId, { $inc: { viewsCount: 1 } });

      return NextResponse.json({
        success: true,
        data: {
          post: {
            id: post._id,
            babaId: post.babaId,
            title: post.title,
            content: post.content,
            imageUrl: post.imageUrl,
            publicUrl: post.publicUrl,
            category: post.category,
            tags: post.tags,
            isPublic: post.isPublic,
            likesCount: post.likesCount,
            commentsCount: post.commentsCount,
            sharesCount: post.sharesCount,
            viewsCount: post.viewsCount + 1,
            featured: post.featured,
            publishedAt: post.publishedAt,
            createdAt: post.createdAt
          }
        }
      });
    }

    // Validate babaId for listing posts
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
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get posts with pagination
    const posts = await BabaPost.find(filter)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await BabaPost.countDocuments(filter);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    console.log('✅ Baba posts retrieved successfully');

    return NextResponse.json({
      success: true,
      data: {
        posts: posts.map(post => ({
          id: post._id,
          babaId: post.babaId,
          title: post.title,
          content: post.content,
          imageUrl: post.imageUrl,
          publicUrl: post.publicUrl,
          category: post.category,
          tags: post.tags,
          isPublic: post.isPublic,
          likesCount: post.likesCount,
          commentsCount: post.commentsCount,
          sharesCount: post.sharesCount,
          viewsCount: post.viewsCount,
          featured: post.featured,
          publishedAt: post.publishedAt,
          createdAt: post.createdAt
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
    console.error('❌ Retrieve posts error:', error);
    return NextResponse.json(
      { 
        error: 'Error retrieving posts',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    console.log('🗑️ Deleting baba post...');
    
    await dbConnect();
    console.log('✅ Database connected');

    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Find post
    const post = await BabaPost.findById(postId);
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    // Delete image file if exists
    if (post.imagePath && existsSync(post.imagePath)) {
      try {
        const { unlink } = await import('fs/promises');
        await unlink(post.imagePath);
        console.log('✅ Image file deleted');
      } catch (error) {
        console.warn('⚠️ Could not delete image file:', error);
      }
    }

    // Delete post from database
    await BabaPost.findByIdAndDelete(postId);

    // Update baba's post count
    await Baba.findOneAndUpdate(
      { babaId: post.babaId },
      { $inc: { postsCount: -1 } }
    );

    console.log('✅ Baba post deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
      data: {
        postId: post._id,
        babaId: post.babaId,
        title: post.title,
        deletedAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ Delete post error:', error);
    return NextResponse.json(
      { 
        error: 'Error deleting post',
        details: error.message
      },
      { status: 500 }
    );
  }
}
