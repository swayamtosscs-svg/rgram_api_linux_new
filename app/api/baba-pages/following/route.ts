import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import BabaPage from '@/lib/models/BabaPage';
import BabaPageFollow from '@/lib/models/BabaPageFollow';
import mongoose from 'mongoose';
import { verifyToken } from '@/lib/utils/auth';

// Get pages that user is following
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = decoded.userId;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const skip = (page - 1) * limit;

    // Get followed pages with pagination
    const [follows, total] = await Promise.all([
      BabaPageFollow.find({ follower: userId, status: 'accepted' })
        .populate('page', 'name description avatar location religion website followersCount postsCount videosCount storiesCount createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BabaPageFollow.countDocuments({ follower: userId, status: 'accepted' })
    ]);

    // Format pages data
    const pages = follows.map(follow => ({
      ...follow.page,
      followedAt: follow.createdAt
    }));

    return NextResponse.json({
      success: true,
      data: {
        pages,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });

  } catch (error) {
    console.error('Error fetching followed pages:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
