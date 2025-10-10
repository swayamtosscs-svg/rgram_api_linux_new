import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import Media from '@/models/Media';

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = req.nextUrl;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Media ID is required' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { title, description, tags } = body;

    if (!title && !description && !tags) {
      return NextResponse.json(
        { error: 'No update data provided' },
        { status: 400 }
      );
    }

    // Find and update media in MongoDB
    const media = await Media.findByIdAndUpdate(
      id,
      {
        ...(title && { title }),
        ...(description && { description }),
        ...(tags && { tags }),
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!media) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: media
    });

  } catch (error: any) {
    console.error('Rename error:', error);
    return NextResponse.json(
      { 
        error: 'Error renaming media',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
