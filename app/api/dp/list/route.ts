import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '../../../../utils/cloudinary';
import { getUserFolderPath } from '../../../../utils/cloudinaryFolders';
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

    // Get folder path for user's DP
    const folderPath = getUserFolderPath(userId, 'dp');
    
    try {
      // List all resources in the user's DP folder
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: folderPath,
        max_results: 100
      });

      const dpFiles = result.resources.map((resource: any) => ({
        publicId: resource.public_id,
        url: resource.secure_url,
        format: resource.format,
        width: resource.width,
        height: resource.height,
        size: resource.bytes,
        createdAt: resource.created_at,
        isCurrent: user.avatar === resource.secure_url
      }));

      return NextResponse.json({
        success: true,
        message: 'DP files retrieved successfully',
        data: {
          userId: user._id,
          username: user.username,
          folderPath,
          totalFiles: dpFiles.length,
          files: dpFiles,
          currentAvatar: user.avatar
        }
      });

    } catch (cloudinaryError) {
      console.error('Error listing Cloudinary resources:', cloudinaryError);
      return NextResponse.json({
        success: true,
        message: 'User found but could not retrieve DP files from Cloudinary',
        data: {
          userId: user._id,
          username: user.username,
          folderPath,
          totalFiles: 0,
          files: [],
          currentAvatar: user.avatar,
          error: 'Cloudinary listing failed'
        }
      });
    }

  } catch (error) {
    console.error('DP list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    // Get folder path for user's DP
    const folderPath = getUserFolderPath(userId, 'dp');
    
    try {
      // List all resources in the user's DP folder
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: folderPath,
        max_results: 100
      });

      const dpFiles = result.resources.map((resource: any) => ({
        publicId: resource.public_id,
        url: resource.secure_url,
        format: resource.format,
        width: resource.width,
        height: resource.height,
        size: resource.bytes,
        createdAt: resource.created_at,
        isCurrent: user.avatar === resource.secure_url
      }));

      return NextResponse.json({
        success: true,
        message: 'DP files retrieved successfully',
        data: {
          userId: user._id,
          username: user.username,
          fullName: user.fullName,
          folderPath,
          totalFiles: dpFiles.length,
          files: dpFiles,
          currentAvatar: user.avatar
        }
      });

    } catch (cloudinaryError) {
      console.error('Error listing Cloudinary resources:', cloudinaryError);
      return NextResponse.json({
        success: true,
        message: 'User found but could not retrieve DP files from Cloudinary',
        data: {
          userId: user._id,
          username: user.username,
          fullName: user.fullName,
          folderPath,
          totalFiles: 0,
          files: [],
          currentAvatar: user.avatar,
          error: 'Cloudinary listing failed'
        }
      });
    }

  } catch (error) {
    console.error('DP list by ID error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
