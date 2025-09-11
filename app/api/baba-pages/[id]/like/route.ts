import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import BabaPost from '@/lib/models/BabaPost';
import BabaVideo from '@/lib/models/BabaVideo';
import BabaStory from '@/lib/models/BabaStory';
import mongoose from 'mongoose';

// Like/Unlike content (posts, videos, stories)
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    
    const { contentId, contentType, userId, action } = await request.json();
    
    // Validate required fields
    if (!contentId || !contentType || !userId || !action) {
      return NextResponse.json(
        { success: false, message: 'contentId, contentType, userId, and action are required' },
        { status: 400 }
      );
    }

    if (!['like', 'unlike'].includes(action)) {
      return NextResponse.json(
        { success: false, message: 'Action must be either "like" or "unlike"' },
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
    if (!mongoose.Types.ObjectId.isValid(contentId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid contentId or userId' },
        { status: 400 }
      );
    }

    let content;
    let Model;
    switch (contentType) {
      case 'post':
        content = await BabaPost.findById(contentId).lean();
        Model = BabaPost;
        break;
      case 'video':
        content = await BabaVideo.findById(contentId).lean();
        Model = BabaVideo;
        break;
      case 'story':
        content = await BabaStory.findById(contentId).lean();
        Model = BabaStory;
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

    // Check if user has already liked
    const isLiked = content.likes.some(likeId => likeId.toString() === userId);

    let updatedContent;
    if (action === 'like' && !isLiked) {
      // Add like
      switch (contentType) {
        case 'post':
          updatedContent = await BabaPost.findByIdAndUpdate(
            contentId,
            {
              $addToSet: { likes: new mongoose.Types.ObjectId(userId) },
              $inc: { likesCount: 1 }
            },
            { new: true }
          );
          break;
        case 'video':
          updatedContent = await BabaVideo.findByIdAndUpdate(
            contentId,
            {
              $addToSet: { likes: new mongoose.Types.ObjectId(userId) },
              $inc: { likesCount: 1 }
            },
            { new: true }
          );
          break;
        case 'story':
          updatedContent = await BabaStory.findByIdAndUpdate(
            contentId,
            {
              $addToSet: { likes: new mongoose.Types.ObjectId(userId) },
              $inc: { likesCount: 1 }
            },
            { new: true }
          );
          break;
      }
    } else if (action === 'unlike' && isLiked) {
      // Remove like
      switch (contentType) {
        case 'post':
          updatedContent = await BabaPost.findByIdAndUpdate(
            contentId,
            {
              $pull: { likes: new mongoose.Types.ObjectId(userId) },
              $inc: { likesCount: -1 }
            },
            { new: true }
          );
          break;
        case 'video':
          updatedContent = await BabaVideo.findByIdAndUpdate(
            contentId,
            {
              $pull: { likes: new mongoose.Types.ObjectId(userId) },
              $inc: { likesCount: -1 }
            },
            { new: true }
          );
          break;
        case 'story':
          updatedContent = await BabaStory.findByIdAndUpdate(
            contentId,
            {
              $pull: { likes: new mongoose.Types.ObjectId(userId) },
              $inc: { likesCount: -1 }
            },
            { new: true }
          );
          break;
      }
    } else {
      // No change needed
      updatedContent = content;
    }

    if (!updatedContent) {
      return NextResponse.json(
        { success: false, message: 'Failed to update like status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Content ${action}d successfully`,
      data: {
        contentId,
        contentType,
        isLiked: action === 'like',
        likesCount: updatedContent.likesCount
      }
    });

  } catch (error) {
    console.error('Error liking/unliking content:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get like status for a user
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('contentId');
    const contentType = searchParams.get('contentType');
    const userId = searchParams.get('userId');
    
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
    if (!mongoose.Types.ObjectId.isValid(contentId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid contentId or userId' },
        { status: 400 }
      );
    }

    let content;
    switch (contentType) {
      case 'post':
        content = await BabaPost.findById(contentId).select('likes likesCount');
        break;
      case 'video':
        content = await BabaVideo.findById(contentId).select('likes likesCount');
        break;
      case 'story':
        content = await BabaStory.findById(contentId).select('likes likesCount');
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

    const isLiked = content.likes.some(likeId => likeId.toString() === userId);

    return NextResponse.json({
      success: true,
      data: {
        contentId,
        contentType,
        isLiked,
        likesCount: content.likesCount
      }
    });

  } catch (error) {
    console.error('Error getting like status:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
