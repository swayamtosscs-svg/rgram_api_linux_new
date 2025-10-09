import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import Story from '@/lib/models/Story';
import { verifyToken } from '@/lib/middleware/auth';

export const runtime = 'nodejs';

// Fix existing story to be a close story
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

    // Only author can fix their story
    if (story.author.toString() !== decoded.userId) {
      return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 403 });
    }

    // Update to close story
    await (Story as any).updateOne(
      { _id: storyId },
      { 
        $set: { 
          isCloseStory: true,
          likes: story.likes || [],
          likesCount: story.likesCount || 0,
          comments: story.comments || [],
          commentsCount: story.commentsCount || 0
        }
      }
    );

    return NextResponse.json({ success: true, message: 'Story updated to close story' });
  } catch (error: any) {
    console.error('Fix story error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fix story', error: error.message }, { status: 500 });
  }
}
