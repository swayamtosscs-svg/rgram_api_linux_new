import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import UserAssets from '@/models/UserAssets';
import User from '@/lib/models/User';

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Starting user assets overview...');
    
    await dbConnect();
    console.log('✅ Database connected');

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate user ID format
    if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get asset statistics
    const totalAssets = await UserAssets.countDocuments({ userId });
    const imageCount = await UserAssets.countDocuments({ userId, fileType: 'image' });
    const videoCount = await UserAssets.countDocuments({ userId, fileType: 'video' });
    
    // Get total storage used
    const assets = await UserAssets.find({ userId }, 'fileSize');
    const totalSize = assets.reduce((sum, asset) => sum + asset.fileSize, 0);

    // Get recent assets (last 5)
    const recentAssets = await UserAssets.find({ userId })
      .sort({ uploadedAt: -1 })
      .limit(5)
      .select('fileName originalName fileType publicUrl uploadedAt fileSize');

    // Get storage breakdown by type
    const imageSize = assets
      .filter(asset => asset.fileType === 'image')
      .reduce((sum, asset) => sum + asset.fileSize, 0);
    
    const videoSize = assets
      .filter(asset => asset.fileType === 'video')
      .reduce((sum, asset) => sum + asset.fileSize, 0);

    console.log('✅ User assets overview retrieved');

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          fullName: user.fullName,
          avatar: user.avatar
        },
        statistics: {
          totalAssets,
          imageCount,
          videoCount,
          totalSize,
          storageBreakdown: {
            images: {
              count: imageCount,
              size: imageSize,
              percentage: totalSize > 0 ? Math.round((imageSize / totalSize) * 100) : 0
            },
            videos: {
              count: videoCount,
              size: videoSize,
              percentage: totalSize > 0 ? Math.round((videoSize / totalSize) * 100) : 0
            }
          }
        },
        recentAssets: recentAssets.map(asset => ({
          id: asset._id,
          fileName: asset.fileName,
          originalName: asset.originalName,
          fileType: asset.fileType,
          publicUrl: asset.publicUrl,
          fileSize: asset.fileSize,
          uploadedAt: asset.uploadedAt
        })),
        apiEndpoints: {
          upload: '/api/user-assets/upload',
          retrieve: '/api/user-assets/retrieve',
          delete: '/api/user-assets/delete',
          overview: '/api/user-assets'
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Overview error:', error);
    return NextResponse.json(
      { 
        error: 'Error retrieving user assets overview',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Update asset metadata
export async function PUT(req: NextRequest) {
  try {
    console.log('🔍 Starting asset metadata update...');
    
    await dbConnect();
    console.log('✅ Database connected');

    const body = await req.json();
    const { assetId, userId, title, description, tags, isPublic } = body;

    if (!assetId) {
      return NextResponse.json(
        { error: 'Asset ID is required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate IDs
    if (!/^[0-9a-fA-F]{24}$/.test(assetId) || !/^[0-9a-fA-F]{24}$/.test(userId)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    // Find asset and verify ownership
    const asset = await UserAssets.findOne({ _id: assetId, userId });
    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found or access denied' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags : [];
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    // Update asset
    const updatedAsset = await UserAssets.findByIdAndUpdate(
      assetId,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'username fullName avatar');

    console.log('✅ Asset metadata updated');

    return NextResponse.json({
      success: true,
      message: 'Asset metadata updated successfully',
      data: {
        asset: {
          id: updatedAsset._id,
          fileName: updatedAsset.fileName,
          originalName: updatedAsset.originalName,
          publicUrl: updatedAsset.publicUrl,
          fileType: updatedAsset.fileType,
          title: updatedAsset.title,
          description: updatedAsset.description,
          tags: updatedAsset.tags,
          isPublic: updatedAsset.isPublic,
          updatedAt: updatedAsset.updatedAt
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Update error:', error);
    return NextResponse.json(
      { 
        error: 'Error updating asset metadata',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
