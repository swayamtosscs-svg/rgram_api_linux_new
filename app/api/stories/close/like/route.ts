import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import Story from '@/lib/models/Story';
import Notification from '@/lib/models/Notification';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/middleware/auth';
import mongoose from 'mongoose';

export const runtime = 'nodejs';

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

    // First ensure the story has likes field initialized
    await (Story as any).updateOne(
      { _id: storyObjectId },
      { 
        $setOnInsert: { 
          likes: [], 
          likesCount: 0,
          comments: [],
          commentsCount: 0,
          isCloseStory: true
        }
      },
      { upsert: false }
    );

    // Add like atomically
    const addResult = await (Story as any).updateOne(
      { _id: storyObjectId },
      { $addToSet: { likes: userObjectId } }
    );

    // Fetch fresh document
    let updatedStory = await (Story as any).findById(storyObjectId).select('author likes likesCount');
    if (!updatedStory) return NextResponse.json({ success: false, message: 'Story not found' }, { status: 404 });

    let likesArray = Array.isArray(updatedStory.likes) ? updatedStory.likes : [];

    // Fallback: if still not present, try push
    if (!likesArray.some((u: any) => String(u) === String(userObjectId))) {
      await (Story as any).updateOne(
        { _id: storyObjectId },
        { $push: { likes: userObjectId } }
      );
      updatedStory = await (Story as any).findById(storyObjectId).select('author likes likesCount');
      likesArray = Array.isArray(updatedStory?.likes) ? updatedStory!.likes : [];
    }

    const newLikesCount = likesArray.length;
    if ((updatedStory.likesCount || 0) !== newLikesCount) {
      await (Story as any).updateOne({ _id: storyObjectId }, { $set: { likesCount: newLikesCount } });
    }

    // Determine if like was newly added
    const justLiked = likesArray.some((u: any) => String(u) === String(userObjectId));
    if (justLiked && updatedStory.author.toString() !== userId) {
      const liker = await (User as any).findById(userId).select('username fullName');
      await Notification.create({
        recipient: updatedStory.author,
        sender: userId,
        type: 'like',
        content: `${liker?.username || 'Someone'} liked your close story`,
        relatedStory: updatedStory._id
      });
    }

    return NextResponse.json({ success: true, message: justLiked ? 'Liked' : 'Already liked', data: { likesCount: newLikesCount } });
  } catch (error: any) {
    console.error('Close story like error:', error);
    return NextResponse.json({ success: false, message: 'Failed to like story', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
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

    const story = await (Story as any).findById(storyId).select('likes likesCount');
    if (!story) return NextResponse.json({ success: false, message: 'Story not found' }, { status: 404 });

    const wasLiked = story.likes?.some((u: any) => String(u) === String(userId)) || false;

    if (!wasLiked) {
      return NextResponse.json({ success: true, message: 'Already unliked', data: { likesCount: story.likesCount || 0 } });
    }

    // Pull like and recalc from array to be accurate
    await (Story as any).updateOne(
      { _id: storyId },
      { $pull: { likes: new mongoose.Types.ObjectId(userId) } }
    );

    const updated = await (Story as any).findById(storyId).select('likes');
    const count = Array.isArray(updated?.likes) ? updated!.likes.length : 0;
    await (Story as any).updateOne({ _id: storyId }, { $set: { likesCount: count } });

    return NextResponse.json({ success: true, message: 'Unliked', data: { likesCount: count } });
  } catch (error: any) {
    console.error('Close story unlike error:', error);
    return NextResponse.json({ success: false, message: 'Failed to unlike story', error: error.message }, { status: 500 });
  }
}


