import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import Story from '@/lib/models/Story';
import Notification from '@/lib/models/Notification';
import User from '@/lib/models/User';
import Comment from '@/lib/models/Comment';
import { verifyToken } from '@/lib/middleware/auth';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization');
    const token = auth?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    const decoded = await verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 });

    await dbConnect();

    const body = await req.json();
    const { storyId, content, parentCommentId } = body || {};
    if (!storyId || !content) {
      return NextResponse.json({ success: false, message: 'storyId and content are required' }, { status: 400 });
    }

    const story = await (Story as any).findById(storyId);
    if (!story) return NextResponse.json({ success: false, message: 'Story not found' }, { status: 404 });

    const comment = await Comment.create({
      content: String(content).trim(),
      author: decoded.userId,
      postId: storyId,
      parentCommentId: parentCommentId || null,
      mediaType: 'story'
    });

    story.comments = [...(story.comments || []), comment._id];
    story.commentsCount = (story.commentsCount || 0) + 1;
    await story.save();

    // Notify story author
    if (story.author.toString() !== decoded.userId) {
      const commenter = await (User as any).findById(decoded.userId).select('username fullName');
      await Notification.create({
        recipient: story.author,
        sender: decoded.userId,
        type: 'comment',
        content: `${commenter?.username || 'Someone'} commented on your close story`,
        relatedStory: story._id
      });
    }

    return NextResponse.json({ success: true, message: 'Comment added', data: { commentId: comment._id, commentsCount: story.commentsCount } }, { status: 201 });
  } catch (error: any) {
    console.error('Close story comment error:', error);
    return NextResponse.json({ success: false, message: 'Failed to add comment', error: error.message }, { status: 500 });
  }
}


