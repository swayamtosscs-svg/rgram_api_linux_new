import { NextRequest, NextResponse } from 'next/server';
import { unlink, existsSync } from 'fs';
import { promisify } from 'util';
import dbConnect from '@/lib/database';
import UserAssets from '../../../../models/UserAssets';
import User from '@/lib/models/User';

const unlinkAsync = promisify(unlink);

export async function DELETE(req: NextRequest) {
  try {
    console.log('🗑️ Starting user asset deletion...');
    
    await dbConnect();
    console.log('✅ Database connected');

    const { searchParams } = new URL(req.url);
    const assetId = searchParams.get('assetId');
    const userId = searchParams.get('userId');

    if (!assetId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Asset ID is required',
          message: 'Please provide a valid asset ID'
        },
        { status: 400 }
      );
    }

    // Validate asset ID format
    if (!/^[0-9a-fA-F]{24}$/.test(assetId)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid asset ID format',
          message: 'Asset ID must be a valid MongoDB ObjectId'
        },
        { status: 400 }
      );
    }

    console.log('🔍 Looking for asset with ID:', assetId);

    // Find asset in database
    const asset = await UserAssets.findById(assetId).populate('userId', 'username fullName');
    
    if (!asset) {
      console.log('❌ Asset not found');
      return NextResponse.json(
        { 
          success: false,
          error: 'Asset not found',
          message: 'The specified asset does not exist'
        },
        { status: 404 }
      );
    }

    // If userId is provided, verify ownership
    if (userId && asset.userId._id.toString() !== userId) {
      console.log('❌ Unauthorized: User does not own this asset');
      return NextResponse.json(
        { 
          success: false,
          error: 'Unauthorized',
          message: 'You can only delete your own assets'
        },
        { status: 403 }
      );
    }

    // Store asset info for response
    const assetInfo = {
      assetId: asset._id,
      fileName: asset.fileName,
      originalName: asset.originalName,
      publicUrl: asset.publicUrl,
      fileType: asset.fileType,
      fileSize: asset.fileSize,
      title: asset.title,
      uploadedBy: {
        id: asset.userId._id,
        username: asset.userId.username,
        fullName: asset.userId.fullName
      }
    };

    console.log('🗑️ Deleting file from filesystem...');

    // Delete file from filesystem
    let fileDeleted = false;
    if (existsSync(asset.filePath)) {
      try {
        await unlinkAsync(asset.filePath);
        fileDeleted = true;
        console.log('✅ File deleted from filesystem');
      } catch (fileError: any) {
        console.error('❌ File deletion error:', fileError);
        // Continue with database deletion even if file deletion fails
      }
    } else {
      console.log('⚠️ File not found on filesystem, continuing with database cleanup');
    }

    console.log('🗑️ Deleting from database...');

    // Delete from database
    await UserAssets.findByIdAndDelete(assetId);
    console.log('✅ Asset deleted from database');

    // Update user's asset count
    if (asset.fileType === 'image') {
      await User.findByIdAndUpdate(asset.userId._id, { $inc: { postsCount: -1 } });
    } else {
      await User.findByIdAndUpdate(asset.userId._id, { $inc: { videosCount: -1 } });
    }

    console.log('✅ User asset counts updated');

    const response = {
      success: true,
      message: 'Asset deleted successfully',
      data: {
        deletedAsset: assetInfo,
        deletedAt: new Date().toISOString(),
        deletionStatus: {
          filesystem: fileDeleted ? 'success' : 'file_not_found',
          database: 'success'
        }
      }
    };

    console.log('✅ Deletion completed successfully');
    return NextResponse.json(response);

  } catch (error: any) {
    console.error('❌ Delete asset error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred while deleting asset',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Bulk delete endpoint
export async function POST(req: NextRequest) {
  try {
    console.log('🗑️ Starting bulk asset deletion...');
    
    await dbConnect();
    console.log('✅ Database connected');

    const body = await req.json();
    const { assetIds, userId } = body;

    if (!assetIds || !Array.isArray(assetIds) || assetIds.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Asset IDs are required',
          message: 'Please provide an array of asset IDs to delete'
        },
        { status: 400 }
      );
    }

    // Validate all asset IDs
    const invalidIds = assetIds.filter(id => !/^[0-9a-fA-F]{24}$/.test(id));
    if (invalidIds.length > 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid asset ID format',
          message: 'All asset IDs must be valid MongoDB ObjectIds',
          invalidIds
        },
        { status: 400 }
      );
    }

    console.log(`🔍 Processing ${assetIds.length} assets for deletion`);

    // Find all assets
    const assets = await UserAssets.find({ 
      _id: { $in: assetIds } 
    }).populate('userId', 'username fullName');

    if (assets.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'No assets found',
          message: 'None of the specified assets exist'
        },
        { status: 404 }
      );
    }

    // If userId is provided, filter to only user's assets
    let userAssets = assets;
    if (userId) {
      userAssets = assets.filter(asset => asset.userId._id.toString() === userId);
      if (userAssets.length === 0) {
        return NextResponse.json(
          { 
            success: false,
            error: 'No accessible assets',
            message: 'You can only delete your own assets'
          },
          { status: 403 }
        );
      }
    }

    const deletedAssets = [];
    const failedDeletions = [];
    let imageCount = 0;
    let videoCount = 0;

    // Process each asset
    for (const asset of userAssets) {
      try {
        // Delete file from filesystem
        let fileDeleted = false;
        if (existsSync(asset.filePath)) {
          try {
            await unlinkAsync(asset.filePath);
            fileDeleted = true;
          } catch (fileError) {
            console.warn(`Failed to delete file: ${asset.filePath}`, fileError);
          }
        }

        // Delete from database
        await UserAssets.findByIdAndDelete(asset._id);

        // Count for user update
        if (asset.fileType === 'image') {
          imageCount++;
        } else {
          videoCount++;
        }

        deletedAssets.push({
          assetId: asset._id,
          fileName: asset.fileName,
          fileType: asset.fileType,
          fileDeleted
        });

      } catch (error) {
        console.error(`Failed to delete asset ${asset._id}:`, error);
        failedDeletions.push({
          assetId: asset._id,
          fileName: asset.fileName,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Update user's asset counts
    if (userAssets.length > 0) {
      const userIdToUpdate = userAssets[0].userId._id;
      await User.findByIdAndUpdate(userIdToUpdate, {
        $inc: {
          postsCount: -imageCount,
          videosCount: -videoCount
        }
      });
    }

    const response = {
      success: true,
      message: `Bulk deletion completed: ${deletedAssets.length} assets deleted`,
      data: {
        deletedAssets,
        failedDeletions,
        summary: {
          totalRequested: assetIds.length,
          totalDeleted: deletedAssets.length,
          totalFailed: failedDeletions.length,
          imageCount,
          videoCount
        },
        deletedAt: new Date().toISOString()
      }
    };

    console.log('✅ Bulk deletion completed');
    return NextResponse.json(response);

  } catch (error: any) {
    console.error('❌ Bulk delete error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred during bulk deletion',
        details: error.message
      },
      { status: 500 }
    );
  }
}
