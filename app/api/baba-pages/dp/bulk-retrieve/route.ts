import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import BabaPage from '@/lib/models/BabaPage';
import mongoose from 'mongoose';

// Get profile pictures (DPs) for multiple Baba Ji pages
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { pageIds } = body;

    if (!pageIds || !Array.isArray(pageIds) || pageIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Page IDs array is required' },
        { status: 400 }
      );
    }

    // Validate all page IDs
    const validPageIds = pageIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    
    if (validPageIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid page IDs provided' },
        { status: 400 }
      );
    }

    // Get pages with their DPs
    const pages = await BabaPage.find({
      _id: { $in: validPageIds }
    }).select('name avatar followersCount').lean();

    // Format response data
    const pageDps = pages.map(page => ({
      pageId: page._id,
      pageName: page.name,
      avatar: page.avatar || null,
      hasAvatar: !!page.avatar,
      followersCount: page.followersCount,
      avatarInfo: page.avatar ? {
        url: page.avatar,
        publicId: page.avatar.split('/').slice(-2).join('/').split('.')[0],
        isCloudinary: page.avatar.includes('cloudinary')
      } : null
    }));

    return NextResponse.json({
      success: true,
      data: {
        pages: pageDps,
        totalPages: pageDps.length,
        requestedCount: pageIds.length,
        validCount: validPageIds.length
      }
    });

  } catch (error) {
    console.error('Error retrieving bulk profile pictures:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
      },
      { status: 500 }
    );
  }
}
