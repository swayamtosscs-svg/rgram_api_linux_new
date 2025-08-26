import { NextRequest, NextResponse } from 'next/server';
import User from '../../../../lib/models/User';
import connectDB from '../../../../lib/database';

export async function GET(request: NextRequest) {
  try {
    // Get user ID from query params
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required as query parameter' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Get user by ID
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has a profile picture
    if (!user.avatar) {
      return NextResponse.json({
        success: true,
        message: 'No profile picture found',
        data: {
          avatar: null,
          hasAvatar: false
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Profile picture retrieved successfully',
      data: {
        avatar: user.avatar,
        hasAvatar: true,
        userId: user._id,
        username: user.username
      }
    });

  } catch (error) {
    console.error('DP retrieve error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get DP by user ID (public endpoint)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Get user
    const user = await User.findById(userId).select('avatar username fullName');
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile picture retrieved successfully',
      data: {
        avatar: user.avatar || null,
        hasAvatar: !!user.avatar,
        username: user.username,
        fullName: user.fullName
      }
    });

  } catch (error) {
    console.error('DP retrieve by ID error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
