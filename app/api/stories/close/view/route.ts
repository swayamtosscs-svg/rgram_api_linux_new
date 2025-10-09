import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import Story from '@/lib/models/Story';
import User from '@/lib/models/User';
import Notification from '@/lib/models/Notification';
import { verifyToken } from '@/lib/middleware/auth';

export const runtime = 'nodejs';

// Mark view for a close story
export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization');
    const token = auth?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    const decoded = await verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 });

    await dbConnect();

    const body = await req.json();
    const { storyId } = body || {};
    if (!storyId) return NextResponse.json({ success: false, message: 'storyId is required' }, { status: 400 });

    const story = await (Story as any).findById(storyId);
    if (!story) return NextResponse.json({ success: false, message: 'Story not found' }, { status: 404 });
    
    // Check if it's a close story or treat as close story if missing field
    const isCloseStory = story.isCloseStory === true || story.isCloseStory === undefined;
    if (!isCloseStory) return NextResponse.json({ success: false, message: 'Not a close story' }, { status: 400 });
    
    if (new Date(story.expiresAt) <= new Date()) return NextResponse.json({ success: false, message: 'Story expired' }, { status: 410 });

    // Only author or allowed viewers can view
    const isAuthor = story.author.toString() === decoded.userId;
    const isAllowed = Array.isArray(story.allowedViewers) && story.allowedViewers.map((v: any) => String(v)).includes(decoded.userId);
    if (!isAuthor && !isAllowed) return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 403 });

    // Add view if not already
    const alreadyViewed = Array.isArray(story.views) && story.views.some((v: any) => String(v) === decoded.userId);
    if (!alreadyViewed) {
      story.views = [...(story.views || []), decoded.userId];
      story.viewsCount = (story.viewsCount || 0) + 1;
      await story.save();

      // Optional: notify author that someone viewed (if needed)
      if (story.author.toString() !== decoded.userId) {
        const viewer = await (User as any).findById(decoded.userId).select('username fullName');
        await Notification.create({
          recipient: story.author,
          sender: decoded.userId,
          type: 'story_view',
          content: `${viewer?.username || 'Someone'} viewed your close story`,
          relatedStory: story._id
        });
      }
    }

    return NextResponse.json({ success: true, message: 'View recorded', data: { viewsCount: story.viewsCount } });
  } catch (error: any) {
    console.error('Close story view error:', error);
    return NextResponse.json({ success: false, message: 'Failed to record view', error: error.message }, { status: 500 });
  }
}

// List viewers for a close story with basic user info
export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization');
    const token = auth?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    const decoded = await verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 });

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const storyId = searchParams.get('id');
    if (!storyId) return NextResponse.json({ success: false, message: 'id is required' }, { status: 400 });

    const story = await (Story as any).findById(storyId).populate('author', 'username fullName avatar');
    if (!story) return NextResponse.json({ success: false, message: 'Story not found' }, { status: 404 });
    
    // Check if it's a close story or treat as close story if missing field
    const isCloseStory = story.isCloseStory === true || story.isCloseStory === undefined;
    if (!isCloseStory) return NextResponse.json({ success: false, message: 'Not a close story' }, { status: 400 });

    // Only author can list all viewers
    if (String(story.author._id || story.author) !== decoded.userId) {
      return NextResponse.json({ success: false, message: 'Only author can see viewers' }, { status: 403 });
    }

    // Fetch viewer users
    const viewerIds = Array.isArray(story.views) ? story.views.map((v: any) => String(v)) : [];
    const viewers = viewerIds.length > 0
      ? await (User as any).find({ _id: { $in: viewerIds } }).select('username fullName avatar').lean()
      : [];

    return NextResponse.json({ success: true, message: 'Viewers retrieved', data: { viewsCount: story.viewsCount || 0, viewers } });
  } catch (error: any) {
    console.error('Close story viewers error:', error);
    return NextResponse.json({ success: false, message: 'Failed to get viewers', error: error.message }, { status: 500 });
  }
}


