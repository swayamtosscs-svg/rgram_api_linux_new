import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import BabaPage from '@/lib/models/BabaPage';
import BabaPost from '@/lib/models/BabaPost';
import mongoose from 'mongoose';
import { deleteBabaPageMedia, extractPublicIdFromBabaPageUrl } from '@/utils/babaPagesCloudinary';

// Get a specific post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; postId: string } }
) {
  try {
    await connectDB();
    
    const { id, postId } = params;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid page ID or post ID' },
        { status: 400 }
      );
    }

    const post = await BabaPost.findOne({ 
      _id: postId, 
      babaPageId: id, 
      isActive: true 
    }).lean();

    if (!post) {
      return NextResponse.json(
        { success: false, message: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: post
    });

  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update a post
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; postId: string } }
) {
  try {
    await connectDB();
    
    const { id, postId } = params;
    const body = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid page ID or post ID' },
        { status: 400 }
      );
    }

    const post = await BabaPost.findOne({ 
      _id: postId, 
      babaPageId: id, 
      isActive: true 
    });

    if (!post) {
      return NextResponse.json(
        { success: false, message: 'Post not found' },
        { status: 404 }
      );
    }

    // Update content
    if (body.content) {
      post.content = body.content.trim();
    }

    await post.save();

    return NextResponse.json({
      success: true,
      message: 'Post updated successfully',
      data: post
    });

  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete a post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; postId: string } }
) {
  try {
    await connectDB();
    
    const { id, postId } = params;

    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid page ID or post ID' },
        { status: 400 }
      );
    }

    const post = await BabaPost.findOne({ 
      _id: postId, 
      babaPageId: id, 
      isActive: true 
    });

    if (!post) {
      return NextResponse.json(
        { success: false, message: 'Post not found' },
        { status: 404 }
      );
    }

    // Delete media files from Cloudinary
    let cloudinaryDeleteResults = [];
    for (const media of post.media) {
      try {
        // Check if media has publicId (new Cloudinary format) or extract from URL
        let publicId = (media as any).publicId;
        if (!publicId) {
          publicId = extractPublicIdFromBabaPageUrl(media.url);
        }
        
        if (publicId) {
          console.log(`Deleting media from Cloudinary: ${publicId}, type: ${media.type}`);
          const deleteResult = await deleteBabaPageMedia(publicId, media.type);
          cloudinaryDeleteResults.push({
            publicId,
            success: deleteResult.success,
            error: deleteResult.error
          });
          
          if (deleteResult.success) {
            console.log(`Successfully deleted from Cloudinary: ${publicId}`);
          } else {
            console.error(`Failed to delete from Cloudinary: ${publicId} - ${deleteResult.error}`);
          }
        } else {
          console.warn(`Could not extract publicId from URL: ${media.url}`);
        }
      } catch (fileError) {
        console.error('Error deleting media file:', fileError);
        cloudinaryDeleteResults.push({
          publicId: 'unknown',
          success: false,
          error: fileError instanceof Error ? fileError.message : 'Unknown error'
        });
      }
    }

    // Soft delete post
    post.isActive = false;
    await post.save();

    // Update page posts count
    await BabaPage.findByIdAndUpdate(id, { $inc: { postsCount: -1 } });

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
