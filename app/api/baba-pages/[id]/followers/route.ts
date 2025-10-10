import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import BabaPage from '@/lib/models/BabaPage';
import BabaPageFollow from '@/lib/models/BabaPageFollow';
import User from '@/lib/models/User';
import mongoose from 'mongoose';

// Get followers of a Baba Ji page
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

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

    const skip = (page - 1) * limit;

    // Get followers with pagination
    const [follows, total] = await Promise.all([
      BabaPageFollow.find({ page: id, status: 'accepted' })
        .populate('follower', 'username email profilePicture firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BabaPageFollow.countDocuments({ page: id, status: 'accepted' })
    ]);

    // Format followers data
    const followers = follows.map(follow => ({
      id: follow.follower._id,
      username: follow.follower.username,
      email: follow.follower.email,
      profilePicture: follow.follower.profilePicture,
      firstName: follow.follower.firstName,
      lastName: follow.follower.lastName,
      followedAt: follow.createdAt
    }));

    return NextResponse.json({
      success: true,
      data: {
        followers,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        },
        pageInfo: {
          pageId: id,
          pageName: babaPage.name,
          totalFollowers: babaPage.followersCount
        }
      }
    });

  } catch (error) {
    console.error('Error fetching followers:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
