import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '../../../../utils/cloudinary';
import { getUserMediaFolderPath, extractPublicIdFromUrl, deleteFromCloudinary } from '../../../../utils/mediaLibrary';
import User from '../../../../lib/models/User';
import connectDB from '../../../../lib/database';

export async function POST(request: NextRequest) {
  try {
    const { userId, action } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!action || !['migrate', 'cleanup', 'list-old'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be one of: migrate, cleanup, list-old' },
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

    switch (action) {
      case 'migrate':
        return await migrateOldStructure(userId, user);
      
      case 'cleanup':
        return await cleanupUnusedFiles(userId, user);
      
      case 'list-old':
        return await listOldStructureFiles(userId, user);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('DP cleanup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function migrateOldStructure(userId: string, user: any) {
  try {
    // List files in old folder structure
    const oldResult = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'users/dp',
      max_results: 100
    });

    // Find files that belong to this user (by checking if they contain user ID)
    const userOldFiles = oldResult.resources.filter((resource: any) => 
      resource.public_id.includes(userId)
    );

    if (userOldFiles.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No old structure files found for this user',
        data: { migrated: 0, oldFiles: [] }
      });
    }

    const migrationResults = [];
    
    for (const oldFile of userOldFiles) {
      try {
        // Download the old file
        const downloadUrl = cloudinary.url(oldFile.public_id, {
          secure: true,
          format: oldFile.format
        });

        // Upload to new folder structure
        const newFolderPath = getUserMediaFolderPath(user.username, 'dp');
        const newPublicId = `${newFolderPath}/dp_${Date.now()}_migrated`;

        // For now, we'll just log the migration plan
        // In a real implementation, you'd download and re-upload
        migrationResults.push({
          oldPublicId: oldFile.public_id,
          newPublicId,
          status: 'planned',
          message: 'Migration planned - requires download and re-upload'
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        migrationResults.push({
          oldPublicId: oldFile.public_id,
          status: 'error',
          message: errorMessage
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Migration analysis completed',
      data: {
        userId,
        oldFilesFound: userOldFiles.length,
        migrationResults,
        note: 'This is a planning endpoint. Actual migration requires additional implementation.'
      }
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Migration failed' },
      { status: 500 }
    );
  }
}

async function cleanupUnusedFiles(userId: string, user: any) {
  try {
    const newFolderPath = getUserMediaFolderPath(user.username, 'dp');
    
    // List all files in user's new folder
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: newFolderPath,
      max_results: 100
    });

    const currentAvatarPublicId = user.avatar ? extractPublicIdFromUrl(user.avatar) : null;
    const unusedFiles = [];
    const deletedFiles = [];

    for (const resource of result.resources) {
      // Check if this file is the current avatar
      if (resource.public_id === currentAvatarPublicId) {
        continue; // Skip current avatar
      }

      unusedFiles.push({
        publicId: resource.public_id,
        url: resource.secure_url,
        createdAt: resource.created_at
      });

      // Delete unused file
      try {
        const deleted = await deleteFromCloudinary(resource.public_id);
        if (deleted) {
          deletedFiles.push(resource.public_id);
        }
      } catch (error) {
        console.error(`Failed to delete ${resource.public_id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Cleanup completed',
      data: {
        userId,
        totalFiles: result.resources.length,
        unusedFiles: unusedFiles.length,
        deletedFiles: deletedFiles.length,
        currentAvatar: user.avatar,
        unusedFilesList: unusedFiles
      }
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: 'Cleanup failed' },
      { status: 500 }
    );
  }
}

async function listOldStructureFiles(userId: string, user: any) {
  try {
    // List files in old folder structure
    const oldResult = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'users/dp',
      max_results: 100
    });

    // Find files that belong to this user
    const userOldFiles = oldResult.resources.filter((resource: any) => 
      resource.public_id.includes(userId)
    );

    return NextResponse.json({
      success: true,
      message: 'Old structure files listed',
      data: {
        userId,
        oldFolder: 'users/dp',
        totalOldFiles: oldResult.resources.length,
        userOldFiles: userOldFiles.length,
        oldFiles: userOldFiles.map((resource: any) => ({
          publicId: resource.public_id,
          url: resource.secure_url,
          format: resource.format,
          createdAt: resource.created_at,
          isCurrent: user.avatar === resource.secure_url
        }))
      }
    });

  } catch (error) {
    console.error('List old files error:', error);
    return NextResponse.json(
      { error: 'Failed to list old files' },
      { status: 500 }
    );
  }
}
