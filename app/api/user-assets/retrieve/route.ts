import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import UserAssets from '../../../../models/UserAssets';
import User from '@/lib/models/User';

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Starting user assets retrieval...');
    
    await dbConnect();
    console.log('✅ Database connected');

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const assetId = searchParams.get('assetId');
    const fileType = searchParams.get('type') as 'image' | 'video' | null;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'uploadedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const search = searchParams.get('search') || '';
    const tags = searchParams.get('tags') || '';

    // If specific asset ID is provided, return single asset
    if (assetId) {
      if (!/^[0-9a-fA-F]{24}$/.test(assetId)) {
        return NextResponse.json(
          { error: 'Invalid asset ID format' },
          { status: 400 }
        );
      }

      const asset = await UserAssets.findById(assetId).populate('userId', 'username fullName avatar');
      
      if (!asset) {
        return NextResponse.json(
          { error: 'Asset not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          asset: {
            id: asset._id,
            fileName: asset.fileName,
            originalName: asset.originalName,
            publicUrl: asset.publicUrl,
            fileType: asset.fileType,
            mimeType: asset.mimeType,
            fileSize: asset.fileSize,
            dimensions: {
              width: asset.width,
              height: asset.height
            },
            duration: asset.duration,
            title: asset.title,
            description: asset.description,
            tags: asset.tags,
            isPublic: asset.isPublic,
            uploadedAt: asset.uploadedAt,
            lastAccessed: asset.lastAccessed,
            user: {
              id: asset.userId._id,
              username: asset.userId.username,
              fullName: asset.userId.fullName,
              avatar: asset.userId.avatar
            }
          }
        }
      });
    }

    // Validate userId for listing assets
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

    // Build filter object
    const filter: any = { userId: userId };
    
    if (fileType && ['image', 'video'].includes(fileType)) {
      filter.fileType = fileType;
    }

    // Add search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { originalName: { $regex: search, $options: 'i' } }
      ];
    }

    // Add tags filter
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      if (tagArray.length > 0) {
        filter.tags = { $in: tagArray };
      }
    }

    // Build sort object
    const sort: any = {};
    const validSortFields = ['uploadedAt', 'lastAccessed', 'fileSize', 'originalName'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'uploadedAt';
    sort[sortField] = sortOrder === 'desc' ? -1 : 1;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    console.log('🔍 Filter:', filter);
    console.log('📊 Sort:', sort);
    console.log('📄 Pagination:', { page, limit, skip });

    // Get assets with pagination
    const assets = await UserAssets.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('userId', 'username fullName avatar');

    // Get total count for pagination
    const total = await UserAssets.countDocuments(filter);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Get file type counts
    const imageCount = await UserAssets.countDocuments({ ...filter, fileType: 'image' });
    const videoCount = await UserAssets.countDocuments({ ...filter, fileType: 'video' });

    console.log('✅ Assets retrieved successfully');

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          fullName: user.fullName,
          avatar: user.avatar
        },
        assets: assets.map(asset => ({
          id: asset._id,
          fileName: asset.fileName,
          originalName: asset.originalName,
          publicUrl: asset.publicUrl,
          fileType: asset.fileType,
          mimeType: asset.mimeType,
          fileSize: asset.fileSize,
          dimensions: {
            width: asset.width,
            height: asset.height
          },
          duration: asset.duration,
          title: asset.title,
          description: asset.description,
          tags: asset.tags,
          isPublic: asset.isPublic,
          uploadedAt: asset.uploadedAt,
          lastAccessed: asset.lastAccessed
        })),
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage,
          hasPrevPage
        },
        summary: {
          totalAssets: total,
          imageCount,
          videoCount,
          totalSize: assets.reduce((sum, asset) => sum + asset.fileSize, 0)
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Retrieve error:', error);
    return NextResponse.json(
      { 
        error: 'Error retrieving assets',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
