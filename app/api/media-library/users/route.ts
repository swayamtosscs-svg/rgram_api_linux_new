import { NextRequest, NextResponse } from 'next/server';
import { getUserMediaInfo, ensureUserMediaFolders } from '../../../../utils/mediaLibrary';
import User from '../../../../lib/models/User';
import connectDB from '../../../../lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    // Connect to database
    await connectDB();

    switch (action) {
      case 'overview':
        return await getMediaLibraryOverview();
      
      case 'user-stats':
        const username = searchParams.get('username');
        if (!username) {
          return NextResponse.json(
            { error: 'Username is required for user-stats action' },
            { status: 400 }
          );
        }
        return await getUserMediaStats(username);
      
      default:
        return await getMediaLibraryOverview();
    }

  } catch (error) {
    console.error('Media Library Users GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, username } = await request.json();
    
    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    switch (action) {
      case 'create-all-folders':
        return await createAllUsersMediaFolders();
      
      case 'create-user-folders':
        if (!username) {
          return NextResponse.json(
            { error: 'Username is required for create-user-folders action' },
            { status: 400 }
          );
        }
        return await createUserMediaFolders(username);
      
      case 'list-all-users':
        return await listAllUsersWithMedia();
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Media Library Users POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getMediaLibraryOverview() {
  try {
    // Get all users
    const users = await User.find({}).select('_id username fullName avatar createdAt');
    
    const overview = {
      totalUsers: users.length,
      usersWithMedia: 0,
      totalMediaFiles: 0,
      mediaTypeBreakdown: {
        dp: 0,
        posts: 0,
        stories: 0,
        media: 0
      },
      recentUsers: users.slice(0, 10).map(user => ({
        userId: user._id,
        username: user.username || user.fullName || 'Unknown User',
        hasAvatar: !!user.avatar,
        createdAt: user.createdAt
      }))
    };

    return NextResponse.json({
      success: true,
      message: 'Media Library overview retrieved successfully',
      data: overview
    });

  } catch (error) {
    console.error('Error getting media library overview:', error);
    return NextResponse.json(
      { error: 'Failed to get media library overview' },
      { status: 500 }
    );
  }
}

async function getUserMediaStats(username: string) {
  try {
    const user = await User.findOne({ username }).select('_id username fullName avatar');
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const mediaInfo = await getUserMediaInfo(username);
    if (!mediaInfo) {
      return NextResponse.json(
        { error: 'Failed to get user media info' },
        { status: 500 }
      );
    }

    // Add userId to the response
    mediaInfo.userId = user._id.toString();

    return NextResponse.json({
      success: true,
      message: 'User media stats retrieved successfully',
      data: mediaInfo
    });

  } catch (error) {
    console.error('Error getting user media stats:', error);
    return NextResponse.json(
      { error: 'Failed to get user media stats' },
      { status: 500 }
    );
  }
}

async function createAllUsersMediaFolders() {
  try {
    // Get all users
    const users = await User.find({}).select('_id username fullName');
    
    const results = [];
    
    for (const user of users) {
      try {
        const success = await ensureUserMediaFolders(user.username);
        results.push({
          userId: user._id,
          username: user.username || user.fullName || 'Unknown User',
          success,
          message: success ? 'Folders created/verified' : 'Failed to create folders'
        });
      } catch (error) {
        results.push({
          userId: user._id,
          username: user.username || user.fullName || 'Unknown User',
          success: false,
          message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `Media folders creation completed: ${successful} successful, ${failed} failed`,
      data: {
        totalUsers: users.length,
        successful,
        failed,
        results
      }
    });

  } catch (error) {
    console.error('Error creating all users media folders:', error);
    return NextResponse.json(
      { error: 'Failed to create all users media folders' },
      { status: 500 }
    );
  }
}

async function createUserMediaFolders(username: string) {
  try {
    const user = await User.findOne({ username }).select('_id username fullName');
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const success = await ensureUserMediaFolders(username);
    
    return NextResponse.json({
      success: true,
      message: success ? 'User media folders created/verified successfully' : 'Failed to create user media folders',
      data: {
        username,
        userId: user._id.toString(),
        success,
        message: success ? 'Folders will be created automatically when files are uploaded' : 'Folder creation failed'
      }
    });

  } catch (error) {
    console.error('Error creating user media folders:', error);
    return NextResponse.json(
      { error: 'Failed to create user media folders' },
      { status: 500 }
    );
  }
}

async function listAllUsersWithMedia() {
  try {
    // Get all users with basic info
    const users = await User.find({}).select('_id username fullName avatar createdAt');
    
    const usersWithMedia = [];
    
    for (const user of users) {
      try {
        const mediaInfo = await getUserMediaInfo(user.username);
        if (mediaInfo) {
          usersWithMedia.push({
            userId: user._id,
            username: user.username || user.fullName || 'Unknown User',
            avatar: user.avatar,
            createdAt: user.createdAt,
            totalFiles: mediaInfo.totalFiles,
            filesByType: mediaInfo.filesByType,
            folders: mediaInfo.folders
          });
        }
      } catch (error) {
        console.error(`Error getting media info for user ${user.username}:`, error);
        usersWithMedia.push({
          userId: user._id,
          username: user.username || user.fullName || 'Unknown User',
          avatar: user.avatar,
          createdAt: user.createdAt,
          totalFiles: 0,
          filesByType: { dp: 0, posts: 0, stories: 0, media: 0 },
          folders: {},
          error: 'Failed to get media info'
        });
      }
    }

    // Sort by total files (descending)
    usersWithMedia.sort((a, b) => b.totalFiles - a.totalFiles);

    return NextResponse.json({
      success: true,
      message: 'All users with media information retrieved successfully',
      data: {
        totalUsers: usersWithMedia.length,
        usersWithMedia,
        summary: {
          totalFiles: usersWithMedia.reduce((sum, user) => sum + user.totalFiles, 0),
          usersWithFiles: usersWithMedia.filter(user => user.totalFiles > 0).length,
          usersWithoutFiles: usersWithMedia.filter(user => user.totalFiles === 0).length
        }
      }
    });

  } catch (error) {
    console.error('Error listing all users with media:', error);
    return NextResponse.json(
      { error: 'Failed to list all users with media' },
      { status: 500 }
    );
  }
}
