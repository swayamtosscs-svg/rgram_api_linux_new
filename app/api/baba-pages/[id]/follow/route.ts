import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import BabaPage from '@/lib/models/BabaPage';
import BabaPageFollow from '@/lib/models/BabaPageFollow';
import User from '@/lib/models/User';
import mongoose from 'mongoose';
import { verifyToken } from '@/lib/utils/auth';

// Follow a Baba Ji page
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;

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

    const followerId = decoded.userId;

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

    // Check if user exists
    const user = await User.findById(followerId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if already following
    const existingFollow = await BabaPageFollow.findOne({
      follower: followerId,
      page: id
    });

    if (existingFollow) {
      return NextResponse.json(
        { success: false, message: 'Already following this page' },
        { status: 400 }
      );
    }

    // Create follow relationship
    const follow = new BabaPageFollow({
      follower: followerId,
      page: id,
      status: 'accepted'
    });

    await follow.save();

    // Update followers count and add to followers array
    await BabaPage.findByIdAndUpdate(id, {
      $inc: { followersCount: 1 },
      $addToSet: { followers: followerId }
    });

    // Update user's following count (ensure field exists)
    await User.findByIdAndUpdate(followerId, {
      $inc: { followingCount: 1 }
    }, { upsert: false });

    return NextResponse.json({
      success: true,
      message: 'Successfully followed the page',
      data: {
        followId: follow._id,
        pageId: id,
        followerId: followerId
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error following Baba Ji page:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
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

// Unfollow a Baba Ji page
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;

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

    const followerId = decoded.userId;

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

    // Find and delete follow relationship
    const follow = await BabaPageFollow.findOneAndDelete({
      follower: followerId,
      page: id
    });

    if (!follow) {
      return NextResponse.json(
        { success: false, message: 'Not following this page' },
        { status: 400 }
      );
    }

    // Update followers count and remove from followers array
    await BabaPage.findByIdAndUpdate(id, {
      $inc: { followersCount: -1 },
      $pull: { followers: followerId }
    });

    // Update user's following count
    await User.findByIdAndUpdate(followerId, {
      $inc: { followingCount: -1 }
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully unfollowed the page'
    });

  } catch (error) {
    console.error('Error unfollowing Baba Ji page:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
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

// Check if user is following the page
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;

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

    const followerId = decoded.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid page ID' },
        { status: 400 }
      );
    }

    // Check if following
    const follow = await BabaPageFollow.findOne({
      follower: followerId,
      page: id
    });

    return NextResponse.json({
      success: true,
      data: {
        isFollowing: !!follow,
        followId: follow?._id || null
      }
    });

  } catch (error) {
    console.error('Error checking follow status:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
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
