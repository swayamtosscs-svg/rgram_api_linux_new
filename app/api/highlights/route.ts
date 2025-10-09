import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import dbConnect from '@/lib/database';
import Highlight from '@/lib/models/Highlight';
import Story from '@/lib/models/Story';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/middleware/auth';

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

// Create new highlight collection
export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization');
    const token = auth?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    const decoded = await verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 });

    await dbConnect();

    const body = await req.json();
    const { name, description, storyIds = [], isPublic = true } = body || {};
    
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ success: false, message: 'Highlight name is required' }, { status: 400 });
    }

    const userId = decoded.userId;
    const user = await (User as any).findById(userId).select('username fullName');
    if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

    // Verify stories exist and belong to user or are accessible
    let validStories = [];
    if (storyIds.length > 0) {
      const stories = await (Story as any).find({
        _id: { $in: storyIds },
        $or: [
          { author: userId },
          { isCloseStory: true, allowedViewers: userId }
        ]
      }).select('_id media');
      
      validStories = stories.map((s: any) => s._id);
    }

    // Create highlight
    const highlight = await Highlight.create({
      name: name.trim(),
      description: description?.trim(),
      author: userId,
      stories: validStories,
      isPublic
    });

    // Copy story media files to highlighted folder
    if (validStories.length > 0) {
      const highlightedDir = join(process.cwd(), 'public', 'assets', 'highlighted', userId.toString());
      await ensureDir(highlightedDir);

      for (const storyId of validStories) {
        const story = await (Story as any).findById(storyId).select('media');
        if (story && story.media && story.media.startsWith('/assets/')) {
          try {
            const sourcePath = join(process.cwd(), 'public', story.media);
            const fileName = uniqueFileName(story.media.split('/').pop() || 'story', 'highlighted');
            const destPath = join(highlightedDir, fileName);
            
            if (existsSync(sourcePath)) {
              const fs = await import('fs');
              fs.copyFileSync(sourcePath, destPath);
            }
          } catch (error) {
            console.error('Error copying story file:', error);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Highlight created successfully',
      data: { highlight }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create highlight error:', error);
    return NextResponse.json({ success: false, message: 'Failed to create highlight', error: error.message }, { status: 500 });
  }
}

// Get user's highlights
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
    const authorId = searchParams.get('authorId');

    const userId = decoded.userId;
    const targetUserId = authorId || userId;

    const [highlights, total] = await Promise.all([
      (Highlight as any)
        .find({ 
          author: targetUserId,
          $or: [
            { isPublic: true },
            { author: userId } // User can see their own private highlights
          ]
        })
        .populate('author', 'username fullName avatar')
        .populate('stories', 'media type caption createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      (Highlight as any).countDocuments({ 
        author: targetUserId,
        $or: [
          { isPublic: true },
          { author: userId }
        ]
      })
    ]);

    return NextResponse.json({
      success: true,
      message: 'Highlights retrieved successfully',
      data: {
        highlights,
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
    console.error('Get highlights error:', error);
    return NextResponse.json({ success: false, message: 'Failed to get highlights', error: error.message }, { status: 500 });
  }
}
