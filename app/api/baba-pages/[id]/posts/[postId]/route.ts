import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import BabaPage from '@/lib/models/BabaPage';
import BabaPost from '@/lib/models/BabaPost';
import mongoose from 'mongoose';
import { deleteBabaPageFileByUrl } from '@/utils/babaPagesLocalStorage';

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

    // Delete media files from local storage
    let localDeleteResults = [];
    for (const media of post.media) {
      try {
        // Check if media has local storage URL
        if (media.url && media.url.startsWith('/uploads/')) {
          console.log(`Deleting media from local storage: ${media.url}, type: ${media.type}`);
          const deleteResult = await deleteBabaPageFileByUrl(media.url);
          localDeleteResults.push({
            url: media.url,
            fileName: media.fileName || 'unknown',
            success: deleteResult.success,
            error: deleteResult.error
          });
          
          if (deleteResult.success) {
            console.log(`Successfully deleted from local storage: ${media.url}`);
          } else {
            console.error(`Failed to delete from local storage: ${media.url} - ${deleteResult.error}`);
          }
        } else {
          console.warn(`Skipping non-local storage URL: ${media.url}`);
        }
      } catch (fileError) {
        console.error('Error deleting media file:', fileError);
        localDeleteResults.push({
          url: media.url || 'unknown',
          fileName: media.fileName || 'unknown',
          success: false,
          error: fileError instanceof Error ? fileError.message : 'Unknown error'
        });
      }
    }

    // Delete post from MongoDB
    await BabaPost.findByIdAndDelete(postId);

    // Update page posts count
    await BabaPage.findByIdAndUpdate(id, { $inc: { postsCount: -1 } });

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully from MongoDB and local storage',
      data: {
        deletedPost: {
          id: post._id,
          content: post.content,
          mediaCount: post.media.length
        },
        deletedMedia: localDeleteResults,
        deletedAt: new Date().toISOString(),
        deletionStatus: {
          localStorage: localDeleteResults.every(r => r.success) ? 'success' : 'partial',
          database: 'success'
        }
      }
    });

  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
