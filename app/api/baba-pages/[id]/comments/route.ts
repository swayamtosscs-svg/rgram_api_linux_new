import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import BabaPost from '@/lib/models/BabaPost';
import BabaVideo from '@/lib/models/BabaVideo';
import BabaStory from '@/lib/models/BabaStory';
import mongoose from 'mongoose';

// Create a new comment
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    
    const { contentId, contentType, userId, content } = await request.json();
    
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
    if (!mongoose.Types.ObjectId.isValid(contentId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid contentId or userId' },
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

    // Create new comment
    const newComment = {
      _id: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(userId),
      content: content.trim(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add comment to content
    let updatedContent;
    switch (contentType) {
      case 'post':
        updatedContent = await BabaPost.findByIdAndUpdate(
          contentId,
          {
            $push: { comments: newComment },
            $inc: { commentsCount: 1 }
          },
          { new: true }
        );
        break;
      case 'video':
        updatedContent = await BabaVideo.findByIdAndUpdate(
          contentId,
          {
            $push: { comments: newComment },
            $inc: { commentsCount: 1 }
          },
          { new: true }
        );
        break;
      case 'story':
        updatedContent = await BabaStory.findByIdAndUpdate(
          contentId,
          {
            $push: { comments: newComment },
            $inc: { commentsCount: 1 }
          },
          { new: true }
        );
        break;
    }

    if (!updatedContent) {
      return NextResponse.json(
        { success: false, message: 'Failed to add comment' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Comment added successfully',
      data: {
        comment: newComment,
        commentsCount: updatedContent.commentsCount
      }
    });

  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get all comments for content
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('contentId');
    const contentType = searchParams.get('contentType');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
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

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(contentId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid contentId' },
        { status: 400 }
      );
    }

    let content;
    switch (contentType) {
      case 'post':
        content = await BabaPost.findById(contentId)
          .select('comments commentsCount')
          .populate('comments.userId', 'name email avatar')
          .lean();
        break;
      case 'video':
        content = await BabaVideo.findById(contentId)
          .select('comments commentsCount')
          .populate('comments.userId', 'name email avatar')
          .lean();
        break;
      case 'story':
        content = await BabaStory.findById(contentId)
          .select('comments commentsCount')
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

    // Paginate comments
    const skip = (page - 1) * limit;
    const comments = content.comments.slice(skip, skip + limit);
    const totalComments = content.comments.length;

    return NextResponse.json({
      success: true,
      data: {
        comments,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalComments / limit),
          totalComments,
          commentsPerPage: limit
        }
      }
    });

  } catch (error) {
    console.error('Error getting comments:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
