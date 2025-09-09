import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import BabaPage from '@/lib/models/BabaPage';
import BabaStory from '@/lib/models/BabaStory';
import mongoose from 'mongoose';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

// Create a new story for a Baba Ji page
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid page ID' },
        { status: 400 }
      );
    }

    // Check if page exists
    const babaPage = await BabaPage.findById(id);
    if (!babaPage) {
      return NextResponse.json(
        { success: false, message: 'Baba Ji page not found' },
        { status: 404 }
      );
    }

    // Check if request is JSON or form data
    const contentType = request.headers.get('content-type') || '';
    let content: string;
    let mediaFile: File | null = null;

    if (contentType.includes('application/json')) {
      // Handle JSON request
      const body = await request.json();
      content = body.content || '';
      mediaFile = null; // No media file for JSON requests
    } else {
      // Handle form data request
      const formData = await request.formData();
      content = formData.get('content') as string;
      mediaFile = formData.get('media') as File;
    }

    if (mediaFile && mediaFile.size === 0) {
      return NextResponse.json(
        { success: false, message: 'Media file is required' },
        { status: 400 }
      );
    }

    // Process media file (only if provided)
    let mediaData = null;

    if (mediaFile && mediaFile.size > 0) {
      const mediaBytes = await mediaFile.arrayBuffer();
      const mediaBuffer = Buffer.from(mediaBytes);
      
      // Create directory if it doesn't exist
      const pageDir = join(process.cwd(), 'public', 'assets', 'baba-pages', id, 'stories');
      await mkdir(pageDir, { recursive: true });
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = mediaFile.name.split('.').pop();
      const filename = `story_${timestamp}_${randomString}.${fileExtension}`;
      const filepath = join(pageDir, filename);
      
      // Save file
      await writeFile(filepath, mediaBuffer);
      
      // Determine file type
      const mimeType = mediaFile.type;
      const fileType = mimeType.startsWith('video/') ? 'video' : 'image';

      mediaData = {
        type: fileType,
        url: `/assets/baba-pages/${id}/stories/${filename}`,
        filename: filename,
        size: mediaFile.size,
        mimeType: mimeType
      };
    }

    // Create story (will auto-expire in 24 hours)
    const story = new BabaStory({
      babaPageId: id,
      content: content?.trim() || '',
      media: mediaData || {
        type: 'image',
        url: '',
        filename: '',
        size: 0,
        mimeType: ''
      }
    });

    await story.save();

    // Update page stories count
    await BabaPage.findByIdAndUpdate(id, { $inc: { storiesCount: 1 } });

    return NextResponse.json({
      success: true,
      message: 'Story created successfully',
      data: story
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating story:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error details:', errorMessage);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { success: false, message: 'Internal server error: ' + errorMessage },
      { status: 500 }
    );
  }
}

// Get all active stories for a Baba Ji page
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid page ID' },
        { status: 400 }
      );
    }

    // Check if page exists
    const babaPage = await BabaPage.findById(id);
    if (!babaPage) {
      return NextResponse.json(
        { success: false, message: 'Baba Ji page not found' },
        { status: 404 }
      );
    }

    // Get active stories (not expired)
    const stories = await BabaStory.find({ 
      babaPageId: id, 
      isActive: true,
      expiresAt: { $gt: new Date() }
    })
    .sort({ createdAt: -1 })
    .lean();

    return NextResponse.json({
      success: true,
      data: stories
    });

  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
