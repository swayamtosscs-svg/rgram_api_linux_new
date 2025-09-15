import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import BabaPage from '@/lib/models/BabaPage';
import mongoose from 'mongoose';

// Get a specific Baba Ji page by ID
export async function GET(
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

    const babaPage = await BabaPage.findById(id).lean();

    if (!babaPage) {
      return NextResponse.json(
        { success: false, message: 'Baba Ji page not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: babaPage
    });

  } catch (error) {
    console.error('Error fetching Baba Ji page:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update a Baba Ji page
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;
    const body = await request.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid page ID' },
        { status: 400 }
      );
    }

    const babaPage = await BabaPage.findById(id);

    if (!babaPage) {
      return NextResponse.json(
        { success: false, message: 'Baba Ji page not found' },
        { status: 404 }
      );
    }

    // Update fields
    if (body.name) babaPage.name = body.name.trim();
    if (body.description !== undefined) babaPage.description = body.description.trim();
    if (body.location !== undefined) babaPage.location = body.location.trim();
    if (body.religion !== undefined) babaPage.religion = body.religion.trim();
    if (body.website !== undefined) babaPage.website = body.website.trim();

    await babaPage.save();

    return NextResponse.json({
      success: true,
      message: 'Baba Ji page updated successfully',
      data: babaPage
    });

  } catch (error) {
    console.error('Error updating Baba Ji page:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete a Baba Ji page
export async function DELETE(
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

    const babaPage = await BabaPage.findById(id);

    if (!babaPage) {
      return NextResponse.json(
        { success: false, message: 'Baba Ji page not found' },
        { status: 404 }
      );
    }

    // Import models for cascading delete
    const BabaPost = (await import('@/lib/models/BabaPost')).default;
    const BabaVideo = (await import('@/lib/models/BabaVideo')).default;
    const BabaStory = (await import('@/lib/models/BabaStory')).default;
    const { deleteBabaPageFileByUrl } = await import('@/utils/babaPagesLocalStorage');

    // Delete all associated posts and their media
    const posts = await BabaPost.find({ babaPageId: id });
    for (const post of posts) {
      // Delete post media files
      for (const media of post.media) {
        if (media.url && media.url.startsWith('/uploads/')) {
          try {
            await deleteBabaPageFileByUrl(media.url);
          } catch (error) {
            console.warn('Error deleting post media:', error);
          }
        }
      }
    }
    await BabaPost.deleteMany({ babaPageId: id });

    // Delete all associated videos and their media
    const videos = await BabaVideo.find({ babaPageId: id });
    for (const video of videos) {
      // Delete video files
      if (video.video?.url && video.video.url.startsWith('/uploads/')) {
        try {
          await deleteBabaPageFileByUrl(video.video.url);
        } catch (error) {
          console.warn('Error deleting video file:', error);
        }
      }
      // Delete thumbnail files
      if (video.thumbnail?.url && video.thumbnail.url.startsWith('/uploads/')) {
        try {
          await deleteBabaPageFileByUrl(video.thumbnail.url);
        } catch (error) {
          console.warn('Error deleting thumbnail file:', error);
        }
      }
    }
    await BabaVideo.deleteMany({ babaPageId: id });

    // Delete all associated stories and their media
    const stories = await BabaStory.find({ babaPageId: id });
    for (const story of stories) {
      // Delete story media files
      if (story.media?.url && story.media.url.startsWith('/uploads/')) {
        try {
          await deleteBabaPageFileByUrl(story.media.url);
        } catch (error) {
          console.warn('Error deleting story media:', error);
        }
      }
    }
    await BabaStory.deleteMany({ babaPageId: id });

    // Delete page avatar and cover image
    if (babaPage.avatar && babaPage.avatar.startsWith('/uploads/')) {
      try {
        await deleteBabaPageFileByUrl(babaPage.avatar);
      } catch (error) {
        console.warn('Error deleting page avatar:', error);
      }
    }
    if (babaPage.coverImage && babaPage.coverImage.startsWith('/uploads/')) {
      try {
        await deleteBabaPageFileByUrl(babaPage.coverImage);
      } catch (error) {
        console.warn('Error deleting page cover image:', error);
      }
    }

    // Delete the page from MongoDB
    await BabaPage.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Baba Ji page deleted successfully from MongoDB',
      data: {
        deletedPage: {
          id: babaPage._id,
          name: babaPage.name,
          postsCount: posts.length,
          videosCount: videos.length,
          storiesCount: stories.length
        },
        deletedAt: new Date().toISOString(),
        message: 'Baba Ji page and all associated data deleted from MongoDB'
      }
    });

  } catch (error) {
    console.error('Error deleting Baba Ji page:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
