import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import Story from '@/lib/models/Story';
import Notification from '@/lib/models/Notification';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/middleware/auth';
import { ChatThread, Message } from '@/lib/models/Chat';

export const runtime = 'nodejs';

async function sendMentionChat(senderId: string, recipientId: string, messageText: string) {
  const participants = [senderId, recipientId].sort();
  let thread = await ChatThread.findOne({ participants: { $all: participants } });
  if (!thread) {
    thread = await ChatThread.create({ participants, lastMessageAt: new Date(), unreadCount: { [recipientId]: 0 } });
  }
  const message = await Message.create({
    thread: thread._id,
    sender: senderId,
    recipient: recipientId,
    content: messageText,
    messageType: 'text',
    isRead: false
  });
  thread.lastMessage = message._id;
  thread.lastMessageAt = new Date();
  const currentUnread = thread.unreadCount.get(recipientId) || 0;
  thread.unreadCount.set(recipientId, currentUnread + 1);
  await thread.save();
}

// Add mentions to existing close story
export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization');
    const token = auth?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    const decoded = await verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 });

    await dbConnect();

    const body = await req.json();
    const { storyId, mentions = [], mentionBack = false } = body || {};
    if (!storyId) return NextResponse.json({ success: false, message: 'storyId is required' }, { status: 400 });

    const story = await (Story as any).findById(storyId);
    if (!story) return NextResponse.json({ success: false, message: 'Story not found' }, { status: 404 });

    // Only author can add mentions
    if (story.author.toString() !== decoded.userId) {
      return NextResponse.json({ success: false, message: 'Only author can add mentions' }, { status: 403 });
    }

    const userId = decoded.userId;
    const user = await (User as any).findById(userId).select('username fullName');
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

    // Add new mentions to existing ones (avoid duplicates)
    const existingMentions = Array.isArray(story.mentions) ? story.mentions.map((m: any) => String(m)) : [];
    const newMentions = Array.isArray(mentions) ? mentions.filter((m: string) => !existingMentions.includes(m)) : [];
    
    if (newMentions.length === 0) {
      return NextResponse.json({ success: true, message: 'No new mentions to add', data: { mentions: story.mentions } });
    }

    // Update story with new mentions
    story.mentions = [...existingMentions, ...newMentions];
    await story.save();

    // Send notifications to newly mentioned users
    for (const mentionId of newMentions) {
      if (mentionId !== userId) {
        await Notification.create({
          recipient: mentionId,
          sender: userId,
          type: 'mention',
          content: `${user.username || 'Someone'} mentioned you in a close story`,
          relatedStory: story._id
        });

        if (mentionBack) {
          await sendMentionChat(userId, mentionId, `You were mentioned by ${user.username || 'someone'} in a close story.`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Mentions added successfully',
      data: { 
        mentions: story.mentions,
        newMentionsAdded: newMentions.length
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Add mentions error:', error);
    return NextResponse.json({ success: false, message: 'Failed to add mentions', error: error.message }, { status: 500 });
  }
}

// Remove mentions from close story
export async function DELETE(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization');
    const token = auth?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    const decoded = await verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 });

    await dbConnect();

    const body = await req.json();
    const { storyId, mentions = [] } = body || {};
    if (!storyId) return NextResponse.json({ success: false, message: 'storyId is required' }, { status: 400 });

    const story = await (Story as any).findById(storyId);
    if (!story) return NextResponse.json({ success: false, message: 'Story not found' }, { status: 404 });

    // Only author can remove mentions
    if (story.author.toString() !== decoded.userId) {
      return NextResponse.json({ success: false, message: 'Only author can remove mentions' }, { status: 403 });
    }

    // Remove specified mentions
    const existingMentions = Array.isArray(story.mentions) ? story.mentions.map((m: any) => String(m)) : [];
    const mentionsToRemove = Array.isArray(mentions) ? mentions : [];
    const updatedMentions = existingMentions.filter((m: string) => !mentionsToRemove.includes(m));

    story.mentions = updatedMentions;
    await story.save();

    return NextResponse.json({
      success: true,
      message: 'Mentions removed successfully',
      data: { mentions: story.mentions }
    }, { status: 200 });

  } catch (error: any) {
    console.error('Remove mentions error:', error);
    return NextResponse.json({ success: false, message: 'Failed to remove mentions', error: error.message }, { status: 500 });
  }
}
