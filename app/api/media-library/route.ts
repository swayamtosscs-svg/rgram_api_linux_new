import { NextRequest, NextResponse } from 'next/server';
import { 
  getUserMediaInfo, 
  ensureUserMediaFolders, 
  getUserAllMediaFolders,
  listUserMediaFiles,
  cleanupUnusedUserMedia
} from '../../../utils/mediaLibrary';
import User from '../../../lib/models/User';
import connectDB from '../../../lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const action = searchParams.get('action');
    
    if (!username) {
      return NextResponse.json(
        { error: 'Username is required as query parameter' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Get user by username
    const user = await User.findOne({ username });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'folders':
        return await getUserFolders(username, user);
      
      case 'files':
        const mediaType = searchParams.get('mediaType') || 'dp';
        return await getUserFiles(username, mediaType, user);
      
      case 'stats':
        return await getUserStats(username, user);
      
      default:
        return await getUserFolders(username, user);
    }

  } catch (error) {
    console.error('Media Library GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { username, action, mediaType, subFolder } = await request.json();
    
    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Get user by username
    const user = await User.findOne({ username });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'create-folders':
        return await createUserFolders(username, user);
      
      case 'cleanup':
        return await cleanupUserMedia(username, mediaType, user);
      
      case 'list-all':
        return await listAllUserMedia(username, user);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Media Library POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getUserFolders(username: string, user: any) {
  try {
    const mediaInfo = await getUserMediaInfo(username);
    
    if (!mediaInfo) {
      return NextResponse.json(
        { error: 'Failed to get media info' },
        { status: 500 }
      );
    }

    // Add userId to the response
    mediaInfo.userId = user._id.toString();

    return NextResponse.json({
      success: true,
      message: 'User media folders retrieved successfully',
      data: mediaInfo
    });

  } catch (error) {
    console.error('Error getting user folders:', error);
    return NextResponse.json(
      { error: 'Failed to get user folders' },
      { status: 500 }
    );
  }
}

async function getUserFiles(username: string, mediaType: string, user: any) {
  try {
    const files = await listUserMediaFiles(username, mediaType);
    
    return NextResponse.json({
      success: true,
      message: `User ${mediaType} files retrieved successfully`,
      data: {
        username,
        userId: user._id.toString(),
        mediaType,
        totalFiles: files.length,
        files
      }
    });

  } catch (error) {
    console.error('Error getting user files:', error);
    return NextResponse.json(
      { error: 'Failed to get user files' },
      { status: 500 }
    );
  }
}

async function getUserStats(username: string, user: any) {
  try {
    const mediaInfo = await getUserMediaInfo(username);
    
    if (!mediaInfo) {
      return NextResponse.json(
        { error: 'Failed to get media stats' },
        { status: 500 }
      );
    }

    // Calculate total size (this would require additional API calls to get file sizes)
    const totalSize = 0; // Placeholder

    return NextResponse.json({
      success: true,
      message: 'User media stats retrieved successfully',
      data: {
        username,
        userId: user._id.toString(),
        totalFiles: mediaInfo.totalFiles,
        totalSize,
        filesByType: mediaInfo.filesByType,
        folders: mediaInfo.folders
      }
    });

  } catch (error) {
    console.error('Error getting user stats:', error);
    return NextResponse.json(
      { error: 'Failed to get user stats' },
      { status: 500 }
    );
  }
}

async function createUserFolders(username: string, user: any) {
  try {
    const success = await ensureUserMediaFolders(username);
    
    if (success) {
      const folders = getUserAllMediaFolders(username);
      
      return NextResponse.json({
        success: true,
        message: 'User media folders structure created/verified successfully',
        data: {
          username,
          userId: user._id.toString(),
          folders,
          message: 'Folders will be created automatically when files are uploaded'
        }
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to create user folders' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error creating user folders:', error);
    return NextResponse.json(
      { error: 'Failed to create user folders' },
      { status: 500 }
    );
  }
}

async function cleanupUserMedia(username: string, mediaType: string, user: any) {
  try {
    // Get current files in use (this would need to be implemented based on your data model)
    const currentFileUrls: string[] = [];
    
    const result = await cleanupUnusedUserMedia(username, mediaType, currentFileUrls);
    
    return NextResponse.json({
      success: true,
      message: 'User media cleanup completed',
      data: {
        username,
        userId: user._id.toString(),
        mediaType,
        deleted: result.deleted,
        errors: result.errors,
        message: `Cleanup completed: ${result.deleted} files deleted, ${result.errors} errors`
      }
    });

  } catch (error) {
    console.error('Error cleaning up user media:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup user media' },
      { status: 500 }
    );
  }
}

async function listAllUserMedia(username: string, user: any) {
  try {
    const mediaTypes = ['dp', 'posts', 'stories', 'media'];
    const allMedia: any = {};
    
    for (const mediaType of mediaTypes) {
      const files = await listUserMediaFiles(username, mediaType);
      allMedia[mediaType] = files;
    }
    
    const totalFiles = Object.values(allMedia).reduce((sum: any, files: any) => sum + files.length, 0);
    
    return NextResponse.json({
      success: true,
      message: 'All user media retrieved successfully',
      data: {
        username,
        userId: user._id.toString(),
        totalFiles,
        media: allMedia
      }
    });

  } catch (error) {
    console.error('Error listing all user media:', error);
    return NextResponse.json(
      { error: 'Failed to list all user media' },
      { status: 500 }
    );
  }
}
