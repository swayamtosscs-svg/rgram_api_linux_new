import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import dbConnect from '@/lib/database';
import Story from '@/lib/models/Story';
import Notification from '@/lib/models/Notification';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/middleware/auth';
import { ChatThread, Message } from '@/lib/models/Chat';

export const runtime = 'nodejs';

async function ensureDir(dirPath: string) {
  if (!existsSync(dirPath)) {
    await mkdir(dirPath, { recursive: true });
  }
}

function uniqueFileName(originalName: string, prefix: string) {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const parts = originalName.split('.');
  const ext = parts.length > 1 ? parts.pop() as string : '';
  const base = parts.join('.')
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .substring(0, 50);
  return `${prefix}_${base}_${timestamp}_${randomString}${ext ? '.' + ext : ''}`;
}

function localPathFromUrl(publicUrl: string): string | null {
  if (!publicUrl || typeof publicUrl !== 'string') return null;
  // Only handle assets folder
  if (!publicUrl.startsWith('/assets/')) return null;
  // Remove any leading slashes to build a proper relative path under public
  const relative = publicUrl.replace(/^[\\\/]+/, ''); // handles both / and \\
  return join(process.cwd(), 'public', relative);
}

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

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization');
    const token = auth?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 });
    }

    await dbConnect();

    const formData = await req.formData();

    const media = formData.get('media') as File | null; // image or video
    const song = formData.get('song') as File | null; // optional audio
    const caption = (formData.get('caption') as string | null) || undefined;
    const location = (formData.get('location') as string | null) || undefined;
    const mentionsRaw = (formData.get('mentions') as string | null) || '[]';
    const allowedViewersRaw = (formData.get('allowedViewers') as string | null) || '[]';
    const mentionBack = ((formData.get('mentionBack') as string | null) || 'false') === 'true';

    if (!media) {
      return NextResponse.json({ success: false, message: 'Media file is required' }, { status: 400 });
    }

    const userId = decoded.userId;
    const user = await (User as any).findById(userId).select('username fullName');
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Prepare directories
    const publicDir = join(process.cwd(), 'public');
    const assetsDir = join(publicDir, 'assets');
    const storiesDir = join(assetsDir, 'stories');
    const audioDir = join(assetsDir, 'audio');
    await ensureDir(storiesDir);
    await ensureDir(audioDir);

    // Save media
    const mediaBytes = await media.arrayBuffer();
    const mediaBuffer = Buffer.from(mediaBytes);
    const mediaFileName = uniqueFileName(media.name, 'story');
    const mediaPath = join(storiesDir, mediaFileName);
    await writeFile(mediaPath, mediaBuffer);
    const mediaPublicUrl = `/assets/stories/${mediaFileName}`;

    // Optional song save
    let songData: any = undefined;
    if (song) {
      const songBytes = await song.arrayBuffer();
      const songBuffer = Buffer.from(songBytes);
      const songFileName = uniqueFileName(song.name, 'song');
      const songPath = join(audioDir, songFileName);
      await writeFile(songPath, songBuffer);
      const songTitle = (formData.get('songTitle') as string | null) || undefined;
      const songArtist = (formData.get('songArtist') as string | null) || undefined;
      songData = {
        title: songTitle,
        artist: songArtist,
        url: `/assets/audio/${songFileName}`,
        fileName: songFileName,
        filePath: songPath,
        storageType: 'local' as const
      };
    }

    // Mentions and allowed viewers
    let mentions: string[] = [];
    let allowedViewers: string[] = [];
    try {
      mentions = JSON.parse(mentionsRaw) || [];
      allowedViewers = JSON.parse(allowedViewersRaw) || [];
    } catch {
      // ignore parse errors
    }

    const mediaType = media.type.startsWith('video/') ? 'video' : 'image';

    // Create story
    const story = await (Story as any).create({
      author: userId,
      media: mediaPublicUrl,
      type: mediaType,
      caption,
      location,
      mentions,
      hashtags: [],
      isActive: true,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isCloseStory: true,
      allowedViewers,
      song: songData,
      likes: [],
      likesCount: 0,
      comments: [],
      commentsCount: 0
    });

    // Send notifications to mentioned users
    for (const mentionId of mentions) {
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
      message: 'Close story created successfully',
      data: { story }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create close story error:', error);
    return NextResponse.json({ success: false, message: 'Failed to create close story', error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization');
    const token = auth?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const author = searchParams.get('author');
    const id = searchParams.get('id');
    const skip = (page - 1) * limit;

    const now = new Date();

    // Single-story fetch by id with authorization
    if (id) {
    const story = await (Story as any)
      .findById(id)
      .populate('author', 'username fullName avatar')
      .populate('mentions', 'username fullName avatar')
      .populate('views', 'username fullName avatar')
      .lean();

      if (!story) {
        return NextResponse.json({ success: false, message: 'Story not found' }, { status: 404 });
      }

      // Check if it's a close story or treat as close story if missing field
      const isCloseStory = story.isCloseStory === true || story.isCloseStory === undefined;
      if (!isCloseStory) {
        return NextResponse.json({ success: false, message: 'Not a close story' }, { status: 400 });
      }

      if (!(new Date(story.expiresAt) > now)) {
        return NextResponse.json({ success: false, message: 'Story expired' }, { status: 410 });
      }

      const isAuthor = story.author && story.author._id ? String(story.author._id) === decoded.userId : String(story.author) === decoded.userId;
      const isAllowed = Array.isArray(story.allowedViewers) && story.allowedViewers.map((v: any) => String(v)).includes(decoded.userId);
      if (!isAuthor && !isAllowed) {
        return NextResponse.json({ success: false, message: 'Not authorized to view this story' }, { status: 403 });
      }

      const contentType = (story.type === 'video') ? 'video' : 'image';
      const transformed = {
        ...story,
        mediaUrl: story.media,
        mediaObject: { url: story.media, type: contentType },
        contentType,
        viewsCount: story.viewsCount || 0
      };

      return NextResponse.json({
        success: true,
        message: 'Close story retrieved successfully',
        data: { story: transformed }
      });
    }

    const match: any = {
      $or: [
        { isCloseStory: true },
        { isCloseStory: { $exists: false } } // Include stories without isCloseStory field
      ],
      isActive: true,
      expiresAt: { $gt: now },
      $and: [
        {
          $or: [
            { author: decoded.userId },
            { allowedViewers: decoded.userId }
          ]
        }
      ]
    };

    if (author) {
      match.author = author;
    }

    const [rawStories, total] = await Promise.all([
      (Story as any)
        .find(match)
        .populate('author', 'username fullName avatar')
        .populate('mentions', 'username fullName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      (Story as any).countDocuments(match)
    ]);

    // Compatibility transformation for UI variations
    const stories = rawStories.map((s: any) => {
      const contentType = (s.type === 'video') ? 'video' : 'image';
      return {
        ...s,
        mediaUrl: s.media, // some UIs expect mediaUrl
        mediaObject: { url: s.media, type: contentType }, // some UIs expect media.url
        contentType
      };
    });

    return NextResponse.json({
      success: true,
      message: 'Close stories retrieved successfully',
      data: {
        stories,
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
    console.error('Get close stories error:', error);
    return NextResponse.json({ success: false, message: 'Failed to get stories', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization');
    const token = auth?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }
    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const storyId = searchParams.get('id');
    if (!storyId) {
      return NextResponse.json({ success: false, message: 'Story id is required' }, { status: 400 });
    }

    const story = await (Story as any).findById(storyId);
    if (!story) {
      return NextResponse.json({ success: false, message: 'Story not found' }, { status: 404 });
    }
    if (story.author.toString() !== decoded.userId) {
      return NextResponse.json({ success: false, message: 'Not authorized to delete this story' }, { status: 403 });
    }

    // Attempt to delete local files
    try {
      const mediaPathAbs = localPathFromUrl(story.media);
      if (mediaPathAbs) await unlink(mediaPathAbs).catch(() => {});
      const songUrl: string | undefined = story.song?.url;
      const songPathAbs = songUrl ? localPathFromUrl(songUrl) : null;
      if (songPathAbs) await unlink(songPathAbs).catch(() => {});
    } catch {}

    await story.deleteOne();

    return NextResponse.json({ success: true, message: 'Story deleted successfully' });
  } catch (error: any) {
    console.error('Delete close story error:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete story', error: error.message }, { status: 500 });
  }
}


