import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import Notification from '@/lib/models/Notification';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/middleware/auth';

export const runtime = 'nodejs';

// Test all notification types for close stories
export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization');
    const token = auth?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    const decoded = await verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 });

    await dbConnect();

    const body = await req.json();
    const { storyId, targetUserId } = body || {};
    if (!storyId || !targetUserId) return NextResponse.json({ success: false, message: 'storyId and targetUserId are required' }, { status: 400 });

    const sender = await (User as any).findById(decoded.userId).select('username fullName');
    if (!sender) return NextResponse.json({ success: false, message: 'Sender not found' }, { status: 404 });

    const targetUser = await (User as any).findById(targetUserId).select('username fullName');
    if (!targetUser) return NextResponse.json({ success: false, message: 'Target user not found' }, { status: 404 });

    // Create test notifications for all types
    const notifications = [];

    // Test like notification (to story author)
    const likeNotification = await Notification.create({
      recipient: targetUserId,
      sender: decoded.userId,
      type: 'like',
      content: `${sender.username || 'Someone'} liked your close story`,
      relatedStory: storyId
    });
    notifications.push({ type: 'like', id: likeNotification._id });

    // Test comment notification (to story author)
    const commentNotification = await Notification.create({
      recipient: targetUserId,
      sender: decoded.userId,
      type: 'comment',
      content: `${sender.username || 'Someone'} commented on your close story`,
      relatedStory: storyId
    });
    notifications.push({ type: 'comment', id: commentNotification._id });

    // Test mention notification (to mentioned user)
    const mentionNotification = await Notification.create({
      recipient: targetUserId,
      sender: decoded.userId,
      type: 'mention',
      content: `${sender.username || 'Someone'} mentioned you in a close story`,
      relatedStory: storyId
    });
    notifications.push({ type: 'mention', id: mentionNotification._id });

    return NextResponse.json({ 
      success: true, 
      message: 'Test notifications created successfully',
      data: { 
        notifications,
        targetUser: { username: targetUser.username, fullName: targetUser.fullName }
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Test notifications error:', error);
    return NextResponse.json({ success: false, message: 'Failed to create test notifications', error: error.message }, { status: 500 });
  }
}
