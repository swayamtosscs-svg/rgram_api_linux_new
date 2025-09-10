import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import BabaPage from '@/lib/models/BabaPage';
import mongoose from 'mongoose';

// Get profile picture (DP) of a Baba Ji page
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

    // Get page details
    const babaPage = await BabaPage.findById(id).select('name avatar followersCount').lean();

    if (!babaPage) {
      return NextResponse.json(
        { success: false, message: 'Baba Ji page not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        pageId: id,
        pageName: babaPage.name,
        avatar: babaPage.avatar || null,
        hasAvatar: !!babaPage.avatar,
        followersCount: babaPage.followersCount,
        avatarInfo: babaPage.avatar ? {
          url: babaPage.avatar,
          publicId: babaPage.avatar.split('/').slice(-2).join('/').split('.')[0],
          isCloudinary: babaPage.avatar.includes('cloudinary')
        } : null
      }
    });

  } catch (error) {
    console.error('Error retrieving profile picture:', error);
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
