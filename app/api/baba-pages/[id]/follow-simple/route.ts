import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import BabaPage from '@/lib/models/BabaPage';
import User from '@/lib/models/User';
import mongoose from 'mongoose';
import { verifyToken } from '@/lib/utils/auth';

// Simple follow API without BabaPageFollow model
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;
    console.log('Follow request for page ID:', id);

    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      console.log('No token provided');
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      console.log('Invalid token');
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const followerId = decoded.userId;
    console.log('Follower ID:', followerId);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('Invalid page ID format');
      return NextResponse.json(
        { success: false, message: 'Invalid page ID' },
        { status: 400 }
      );
    }

    // Check if page exists
    const babaPage = await BabaPage.findById(id);
    if (!babaPage) {
      console.log('Page not found');
      return NextResponse.json(
        { success: false, message: 'Baba Ji page not found' },
        { status: 404 }
      );
    }

    console.log('Page found:', babaPage.name);

    // Check if user exists
    const user = await User.findById(followerId);
    if (!user) {
      console.log('User not found');
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    console.log('User found:', user.username);

    // Check if already following (using the followers array)
    const isAlreadyFollowing = babaPage.followers.includes(new mongoose.Types.ObjectId(followerId));
    if (isAlreadyFollowing) {
      console.log('Already following this page');
      return NextResponse.json(
        { success: false, message: 'Already following this page' },
        { status: 400 }
      );
    }

    // Update page with new follower
    await BabaPage.findByIdAndUpdate(id, {
      $inc: { followersCount: 1 },
      $addToSet: { followers: followerId }
    });

    // Update user's following count
    await User.findByIdAndUpdate(followerId, {
      $inc: { followingCount: 1 }
    });

    console.log('Successfully followed the page');

    return NextResponse.json({
      success: true,
      message: 'Successfully followed the page',
      data: {
        pageId: id,
        followerId: followerId,
        pageName: babaPage.name
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

// Simple unfollow API
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;
    console.log('Unfollow request for page ID:', id);

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

    // Check if following
    const isFollowing = babaPage.followers.includes(new mongoose.Types.ObjectId(followerId));
    if (!isFollowing) {
      return NextResponse.json(
        { success: false, message: 'Not following this page' },
        { status: 400 }
      );
    }

    // Update page to remove follower
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

// Check follow status
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

    // Get page with followers
    const babaPage = await BabaPage.findById(id);
    if (!babaPage) {
      return NextResponse.json(
        { success: false, message: 'Baba Ji page not found' },
        { status: 404 }
      );
    }

    // Check if following
    const isFollowing = babaPage.followers.includes(new mongoose.Types.ObjectId(followerId));

    return NextResponse.json({
      success: true,
      data: {
        isFollowing: isFollowing,
        pageId: id,
        followerId: followerId
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
