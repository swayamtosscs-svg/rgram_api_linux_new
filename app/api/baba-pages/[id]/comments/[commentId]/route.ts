import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import BabaPost from '@/lib/models/BabaPost';
import BabaVideo from '@/lib/models/BabaVideo';
import BabaStory from '@/lib/models/BabaStory';
import mongoose from 'mongoose';

// Update a comment
export async function PUT(request: NextRequest, { params }: { params: { id: string; commentId: string } }) {
  try {
    await connectDB();
    
    const { contentId, contentType, userId, content } = await request.json();
    const { commentId } = params;
    
    // Validate required fields
    if (!contentId || !contentType || !userId || !content) {
      return NextResponse.json(
        { success: false, message: 'contentId, contentType, userId, and content are required' },
        { status: 400 }
      );
    }

    if (!['post', 'video', 'story'].includes(contentType)) {
      return NextResponse.json(
        { success: false, message: 'Content type must be post, video, or story' },
        { status: 400 }
      );
    }

    if (content.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Comment content cannot be empty' },
        { status: 400 }
      );
    }

    if (content.length > 500) {
      return NextResponse.json(
        { success: false, message: 'Comment must be less than 500 characters' },
        { status: 400 }
      );
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(contentId) || 
        !mongoose.Types.ObjectId.isValid(userId) || 
        !mongoose.Types.ObjectId.isValid(commentId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid contentId, userId, or commentId' },
        { status: 400 }
      );
    }

    let targetContent;
    let Model;
    switch (contentType) {
      case 'post':
        targetContent = await BabaPost.findById(contentId).lean();
        Model = BabaPost;
        break;
      case 'video':
        targetContent = await BabaVideo.findById(contentId).lean();
        Model = BabaVideo;
        break;
      case 'story':
        targetContent = await BabaStory.findById(contentId).lean();
        Model = BabaStory;
        break;
      default:
        return NextResponse.json(
          { success: false, message: 'Invalid content type' },
          { status: 400 }
        );
    }

    if (!targetContent) {
      return NextResponse.json(
        { success: false, message: 'Content not found' },
        { status: 404 }
      );
    }

    // Find the comment
    const comment = targetContent.comments.find(
      (c: any) => c._id.toString() === commentId
    );

    if (!comment) {
      return NextResponse.json(
        { success: false, message: 'Comment not found' },
        { status: 404 }
      );
    }

    // Check if user owns the comment
    if (comment.userId.toString() !== userId) {
      return NextResponse.json(
        { success: false, message: 'You can only update your own comments' },
        { status: 403 }
      );
    }

    // Update the comment
    let updatedContent;
    switch (contentType) {
      case 'post':
        updatedContent = await BabaPost.findOneAndUpdate(
          { 
            _id: contentId, 
            'comments._id': commentId 
          },
          {
            $set: {
              'comments.$.content': content.trim(),
              'comments.$.updatedAt': new Date()
            }
          },
          { new: true }
        );
        break;
      case 'video':
        updatedContent = await BabaVideo.findOneAndUpdate(
          { 
            _id: contentId, 
            'comments._id': commentId 
          },
          {
            $set: {
              'comments.$.content': content.trim(),
              'comments.$.updatedAt': new Date()
            }
          },
          { new: true }
        );
        break;
      case 'story':
        updatedContent = await BabaStory.findOneAndUpdate(
          { 
            _id: contentId, 
            'comments._id': commentId 
          },
          {
            $set: {
              'comments.$.content': content.trim(),
              'comments.$.updatedAt': new Date()
            }
          },
          { new: true }
        );
        break;
    }

    if (!updatedContent) {
      return NextResponse.json(
        { success: false, message: 'Failed to update comment' },
        { status: 500 }
      );
    }

    // Find the updated comment
    const updatedComment = updatedContent.comments.find(
      (c: any) => c._id.toString() === commentId
    );

    return NextResponse.json({
      success: true,
      message: 'Comment updated successfully',
      data: {
        comment: updatedComment
      }
    });

  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete a comment
export async function DELETE(request: NextRequest, { params }: { params: { id: string; commentId: string } }) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('contentId');
    const contentType = searchParams.get('contentType');
    const userId = searchParams.get('userId');
    const { commentId } = params;
    
    // Validate required fields
    if (!contentId || !contentType || !userId) {
      return NextResponse.json(
        { success: false, message: 'contentId, contentType, and userId are required' },
        { status: 400 }
      );
    }

    if (!['post', 'video', 'story'].includes(contentType)) {
      return NextResponse.json(
        { success: false, message: 'Content type must be post, video, or story' },
        { status: 400 }
      );
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(contentId) || 
        !mongoose.Types.ObjectId.isValid(userId) || 
        !mongoose.Types.ObjectId.isValid(commentId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid contentId, userId, or commentId' },
        { status: 400 }
      );
    }

    let targetContent;
    let Model;
    switch (contentType) {
      case 'post':
        targetContent = await BabaPost.findById(contentId).lean();
        Model = BabaPost;
        break;
      case 'video':
        targetContent = await BabaVideo.findById(contentId).lean();
        Model = BabaVideo;
        break;
      case 'story':
        targetContent = await BabaStory.findById(contentId).lean();
        Model = BabaStory;
        break;
      default:
        return NextResponse.json(
          { success: false, message: 'Invalid content type' },
          { status: 400 }
        );
    }

    if (!targetContent) {
      return NextResponse.json(
        { success: false, message: 'Content not found' },
        { status: 404 }
      );
    }

    // Find the comment
    const comment = targetContent.comments.find(
      (c: any) => c._id.toString() === commentId
    );

    if (!comment) {
      return NextResponse.json(
        { success: false, message: 'Comment not found' },
        { status: 404 }
      );
    }

    // Check if user owns the comment
    if (comment.userId.toString() !== userId) {
      return NextResponse.json(
        { success: false, message: 'You can only delete your own comments' },
        { status: 403 }
      );
    }

    // Remove the comment
    let updatedContent;
    switch (contentType) {
      case 'post':
        updatedContent = await BabaPost.findByIdAndUpdate(
          contentId,
          {
            $pull: { comments: { _id: commentId } },
            $inc: { commentsCount: -1 }
          },
          { new: true }
        );
        break;
      case 'video':
        updatedContent = await BabaVideo.findByIdAndUpdate(
          contentId,
          {
            $pull: { comments: { _id: commentId } },
            $inc: { commentsCount: -1 }
          },
          { new: true }
        );
        break;
      case 'story':
        updatedContent = await BabaStory.findByIdAndUpdate(
          contentId,
          {
            $pull: { comments: { _id: commentId } },
            $inc: { commentsCount: -1 }
          },
          { new: true }
        );
        break;
    }

    if (!updatedContent) {
      return NextResponse.json(
        { success: false, message: 'Failed to delete comment' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Comment deleted successfully',
      data: {
        commentsCount: updatedContent.commentsCount
      }
    });

  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get a specific comment
export async function GET(request: NextRequest, { params }: { params: { id: string; commentId: string } }) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('contentId');
    const contentType = searchParams.get('contentType');
    const { commentId } = params;
    
    // Validate required fields
    if (!contentId || !contentType) {
      return NextResponse.json(
        { success: false, message: 'contentId and contentType are required' },
        { status: 400 }
      );
    }

    if (!['post', 'video', 'story'].includes(contentType)) {
      return NextResponse.json(
        { success: false, message: 'Content type must be post, video, or story' },
        { status: 400 }
      );
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(contentId) || 
        !mongoose.Types.ObjectId.isValid(commentId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid contentId or commentId' },
        { status: 400 }
      );
    }

    let content;
    switch (contentType) {
      case 'post':
        content = await BabaPost.findById(contentId)
          .select('comments')
          .populate('comments.userId', 'name email avatar')
          .lean();
        break;
      case 'video':
        content = await BabaVideo.findById(contentId)
          .select('comments')
          .populate('comments.userId', 'name email avatar')
          .lean();
        break;
      case 'story':
        content = await BabaStory.findById(contentId)
          .select('comments')
          .populate('comments.userId', 'name email avatar')
          .lean();
        break;
      default:
        return NextResponse.json(
          { success: false, message: 'Invalid content type' },
          { status: 400 }
        );
    }

    if (!content) {
      return NextResponse.json(
        { success: false, message: 'Content not found' },
        { status: 404 }
      );
    }

    // Find the specific comment
    const comment = content.comments.find(
      (c: any) => c._id.toString() === commentId
    );

    if (!comment) {
      return NextResponse.json(
        { success: false, message: 'Comment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        comment
      }
    });

  } catch (error) {
    console.error('Error getting comment:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
