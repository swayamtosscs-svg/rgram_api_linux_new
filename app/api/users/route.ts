import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/database';
import User from '../../../lib/models/User';

export async function GET(request: NextRequest) {
  try {
    console.log('👥 Getting users...');
    
    // Connect to database
    await connectDB();
    console.log('✅ Database connected');
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Get users (excluding password)
    const users = await User.find({})
      .select('_id username fullName email isVerified createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count for pagination
    const totalUsers = await User.countDocuments({});
    const totalPages = Math.ceil(totalUsers / limit);
    
    console.log('✅ Found', users.length, 'users');
    
    return NextResponse.json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error getting users:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get users',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('👤 Creating new user...');
    
    // Connect to database
    await connectDB();
    console.log('✅ Database connected');
    
    // Parse request body
    const body = await request.json();
    const { email, password, username, fullName } = body;
    
    console.log('📝 Request data:', { email, username, fullName });
    
    // Validate required fields
    if (!email || !password || !username || !fullName) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: email, password, username, and fullName are required'
      }, { status: 400 });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });
    
    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'User with this email or username already exists'
      }, { status: 409 });
    }
    
    // Create new user
    const newUser = new User({
      email,
      password,
      username,
      fullName
    });
    
    await newUser.save();
    console.log('✅ User created:', newUser._id);
    
    // Return user without password
    const userResponse = {
      _id: newUser._id,
      email: newUser.email,
      username: newUser.username,
      fullName: newUser.fullName,
      isVerified: newUser.isVerified,
      createdAt: newUser.createdAt
    };
    
    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      data: userResponse
    });
    
  } catch (error) {
    console.error('❌ Error creating user:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
