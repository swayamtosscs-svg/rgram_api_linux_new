import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import Story from '@/lib/models/Story';
import Notification from '@/lib/models/Notification';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/middleware/auth';
import mongoose from 'mongoose';

export const runtime = 'nodejs';

// Highlight/Unhighlight close story
export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization');
    const token = auth?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    const decoded = await verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 });

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const storyId = searchParams.get('id');
    if (!storyId) return NextResponse.json({ success: false, message: 'Story id is required' }, { status: 400 });

    const userId = decoded.userId;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const storyObjectId = new mongoose.Types.ObjectId(storyId);

    // First ensure the story has highlight fields initialized
    await (Story as any).updateOne(
      { _id: storyObjectId },
      { 
        $setOnInsert: { 
          highlightedBy: [], 
          highlightedCount: 0,
          likes: [], 
          likesCount: 0,
          comments: [],
          commentsCount: 0,
          isCloseStory: true
        }
      },
      { upsert: false }
    );

    // Check if already highlighted
    const story = await (Story as any).findById(storyObjectId).select('author highlightedBy highlightedCount');
    if (!story) return NextResponse.json({ success: false, message: 'Story not found' }, { status: 404 });

    const alreadyHighlighted = Array.isArray(story.highlightedBy) && story.highlightedBy.some((u: any) => String(u) === String(userObjectId));

    if (alreadyHighlighted) {
      // Unhighlight
      await (Story as any).updateOne(
        { _id: storyObjectId },
        { $pull: { highlightedBy: userObjectId } }
      );
      
      const updated = await (Story as any).findById(storyObjectId).select('highlightedBy');
      const count = Array.isArray(updated?.highlightedBy) ? updated!.highlightedBy.length : 0;
      await (Story as any).updateOne({ _id: storyObjectId }, { $set: { highlightedCount: count } });

      return NextResponse.json({ success: true, message: 'Unhighlighted', data: { highlightedCount: count } });
    } else {
      // Highlight - try addToSet first
      const addResult = await (Story as any).updateOne(
        { _id: storyObjectId },
        { $addToSet: { highlightedBy: userObjectId } }
      );

      // Fetch fresh document
      let updatedStory = await (Story as any).findById(storyObjectId).select('author highlightedBy highlightedCount');
      if (!updatedStory) return NextResponse.json({ success: false, message: 'Story not found' }, { status: 404 });

      let highlightedArray = Array.isArray(updatedStory.highlightedBy) ? updatedStory.highlightedBy : [];

      // Fallback: if still not present, try push
      if (!highlightedArray.some((u: any) => String(u) === String(userObjectId))) {
        await (Story as any).updateOne(
          { _id: storyObjectId },
          { $push: { highlightedBy: userObjectId } }
        );
        updatedStory = await (Story as any).findById(storyObjectId).select('author highlightedBy highlightedCount');
        highlightedArray = Array.isArray(updatedStory?.highlightedBy) ? updatedStory!.highlightedBy : [];
      }

      const newHighlightedCount = highlightedArray.length;
      if ((updatedStory.highlightedCount || 0) !== newHighlightedCount) {
        await (Story as any).updateOne({ _id: storyObjectId }, { $set: { highlightedCount: newHighlightedCount } });
      }

      // Send notification to story author (if not self)
      if (updatedStory.author.toString() !== userId) {
        const highlighter = await (User as any).findById(userId).select('username fullName');
        await Notification.create({
          recipient: updatedStory.author,
          sender: userId,
          type: 'like', // Using 'like' type for highlight notification
          content: `${highlighter?.username || 'Someone'} highlighted your close story`,
          relatedStory: updatedStory._id
        });
      }

      return NextResponse.json({ success: true, message: 'Highlighted', data: { highlightedCount: newHighlightedCount } });
    }

  } catch (error: any) {
    console.error('Close story highlight error:', error);
    return NextResponse.json({ success: false, message: 'Failed to highlight story', error: error.message }, { status: 500 });
  }
}

// Get highlighted stories for a user
export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization');
    const token = auth?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    const decoded = await verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 });

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const userId = decoded.userId;

    // Find stories highlighted by this user
    const [stories, total] = await Promise.all([
      (Story as any)
        .find({ 
          highlightedBy: userId,
          $or: [
            { isCloseStory: true },
            { isCloseStory: { $exists: false } }
          ]
        })
        .populate('author', 'username fullName avatar')
        .populate('mentions', 'username fullName avatar')
        .populate('views', 'username fullName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      (Story as any).countDocuments({ 
        highlightedBy: userId,
        $or: [
          { isCloseStory: true },
          { isCloseStory: { $exists: false } }
        ]
      })
    ]);

    // Transform stories for UI compatibility
    const transformedStories = stories.map((s: any) => {
      const contentType = (s.type === 'video') ? 'video' : 'image';
      return {
        ...s,
        mediaUrl: s.media,
        mediaObject: { url: s.media, type: contentType },
        contentType,
        viewsCount: s.viewsCount || 0,
        likesCount: s.likesCount || 0,
        commentsCount: s.commentsCount || 0,
        highlightedCount: s.highlightedCount || 0
      };
    });

    return NextResponse.json({
      success: true,
      message: 'Highlighted stories retrieved successfully',
      data: {
        stories: transformedStories,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit) || 1,
          total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error: any) {
    console.error('Get highlighted stories error:', error);
    return NextResponse.json({ success: false, message: 'Failed to get highlighted stories', error: error.message }, { status: 500 });
  }
}
