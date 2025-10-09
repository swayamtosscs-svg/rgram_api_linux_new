import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import dbConnect from '@/lib/database';
import Highlight from '@/lib/models/Highlight';
import Story from '@/lib/models/Story';
import { verifyToken } from '@/lib/middleware/auth';

export const runtime = 'nodejs';

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

// Add story to highlight
export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization');
    const token = auth?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    const decoded = await verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 });

    await dbConnect();

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const highlightId = pathParts[pathParts.length - 1];
    if (!highlightId) return NextResponse.json({ success: false, message: 'Highlight id is required' }, { status: 400 });

    const body = await req.json();
    const { storyId } = body || {};
    if (!storyId) return NextResponse.json({ success: false, message: 'storyId is required' }, { status: 400 });

    const userId = decoded.userId;

    // Verify highlight exists and belongs to user
    const highlight = await (Highlight as any).findById(highlightId);
    if (!highlight) return NextResponse.json({ success: false, message: 'Highlight not found' }, { status: 404 });
    if (highlight.author.toString() !== userId) return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 403 });

    // Verify story exists and is accessible
    const story = await (Story as any).findById(storyId);
    if (!story) return NextResponse.json({ success: false, message: 'Story not found' }, { status: 404 });
    
    const isAccessible = story.author.toString() === userId || 
      (story.isCloseStory && Array.isArray(story.allowedViewers) && story.allowedViewers.map((v: any) => String(v)).includes(userId));
    
    if (!isAccessible) return NextResponse.json({ success: false, message: 'Story not accessible' }, { status: 403 });

    // Check if story already in highlight
    if (highlight.stories.some((s: any) => String(s) === String(storyId))) {
      return NextResponse.json({ success: true, message: 'Story already in highlight' });
    }

    // Add story to highlight
    highlight.stories.push(storyId);
    await highlight.save();

    // Copy story file to highlighted folder
    if (story.media && story.media.startsWith('/assets/')) {
      try {
        const highlightedDir = join(process.cwd(), 'public', 'assets', 'highlighted', userId.toString());
        await mkdir(highlightedDir, { recursive: true });
        
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

    return NextResponse.json({ success: true, message: 'Story added to highlight' });

  } catch (error: any) {
    console.error('Add story to highlight error:', error);
    return NextResponse.json({ success: false, message: 'Failed to add story to highlight', error: error.message }, { status: 500 });
  }
}

// Remove story from highlight
export async function DELETE(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization');
    const token = auth?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    const decoded = await verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 });

    await dbConnect();

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const highlightId = pathParts[pathParts.length - 1];
    if (!highlightId) return NextResponse.json({ success: false, message: 'Highlight id is required' }, { status: 400 });

    const body = await req.json();
    const { storyId } = body || {};
    if (!storyId) return NextResponse.json({ success: false, message: 'storyId is required' }, { status: 400 });

    const userId = decoded.userId;

    // Verify highlight exists and belongs to user
    const highlight = await (Highlight as any).findById(highlightId);
    if (!highlight) return NextResponse.json({ success: false, message: 'Highlight not found' }, { status: 404 });
    if (highlight.author.toString() !== userId) return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 403 });

    // Get story data for file deletion
    const story = await (Story as any).findById(storyId).select('media');
    if (!story) return NextResponse.json({ success: false, message: 'Story not found' }, { status: 404 });

    // Remove story from highlight
    highlight.stories = highlight.stories.filter((s: any) => String(s) !== String(storyId));
    await highlight.save();

    // Delete copied story file from highlighted folder
    if (story.media && story.media.startsWith('/assets/')) {
      try {
        const highlightedDir = join(process.cwd(), 'public', 'assets', 'highlighted', userId.toString());
        const fileName = `highlighted_${story.media.split('/').pop()}`;
        const filePath = join(highlightedDir, fileName);
        
        if (existsSync(filePath)) {
          await unlink(filePath);
        }
        
        // Also try to find and delete any file with similar pattern
        const fs = await import('fs');
        const files = fs.readdirSync(highlightedDir);
        const matchingFile = files.find(file => file.includes(story.media.split('/').pop()?.split('.')[0] || ''));
        if (matchingFile) {
          await unlink(join(highlightedDir, matchingFile));
        }
      } catch (error) {
        console.error('Error deleting highlighted story file:', error);
      }
    }

    return NextResponse.json({ success: true, message: 'Story removed from highlight and file deleted' });

  } catch (error: any) {
    console.error('Remove story from highlight error:', error);
    return NextResponse.json({ success: false, message: 'Failed to remove story from highlight', error: error.message }, { status: 500 });
  }
}

// Update highlight (name, description, etc.)
export async function PUT(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization');
    const token = auth?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    const decoded = await verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 });

    await dbConnect();

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const highlightId = pathParts[pathParts.length - 1];
    if (!highlightId) return NextResponse.json({ success: false, message: 'Highlight id is required' }, { status: 400 });

    const body = await req.json();
    const { name, description, isPublic } = body || {};

    const userId = decoded.userId;

    // Verify highlight exists and belongs to user
    const highlight = await (Highlight as any).findById(highlightId);
    if (!highlight) return NextResponse.json({ success: false, message: 'Highlight not found' }, { status: 404 });
    if (highlight.author.toString() !== userId) return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 403 });

    // Update fields
    if (name !== undefined) highlight.name = name.trim();
    if (description !== undefined) highlight.description = description?.trim();
    if (isPublic !== undefined) highlight.isPublic = isPublic;

    await highlight.save();

    return NextResponse.json({ success: true, message: 'Highlight updated successfully', data: { highlight } });

  } catch (error: any) {
    console.error('Update highlight error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update highlight', error: error.message }, { status: 500 });
  }
}
