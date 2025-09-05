import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import Image from '@/models/Image';
import User from '@/lib/models/User';

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Starting image retrieval...');
    
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');
    const imageId = searchParams.get('id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // If specific image ID is provided
    if (imageId) {
      console.log('🔍 Fetching specific image:', imageId);
      
      const image = await Image.findById(imageId).populate('uploadedBy', 'username fullName avatar');
      
      if (!image) {
        return NextResponse.json(
          { error: 'Image not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          image,
          user: image.uploadedBy
        }
      });
    }

    // If username is provided, get all images for that user
    if (username) {
      console.log('🔍 Fetching images for username:', username);
      
      // Check if user exists - try both exact match and case-insensitive
      let user = await User.findOne({ username: username });
      if (!user) {
        user = await User.findOne({ username: username.toLowerCase() });
      }
      if (!user) {
        user = await User.findOne({ username: username.toUpperCase() });
      }
      
      if (!user) {
        console.log('❌ User not found for username:', username);
        return NextResponse.json(
          { 
            error: 'User not found',
            searchedUsername: username
          },
          { status: 404 }
        );
      }

      // Build sort object
      const sort: any = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Calculate skip value for pagination
      const skip = (page - 1) * limit;

      // Get images with pagination
      const images = await Image.find({ username: username.toLowerCase() })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('uploadedBy', 'username fullName avatar');

      // Get total count for pagination
      const total = await Image.countDocuments({ username: username.toLowerCase() });

      // Calculate pagination info
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return NextResponse.json({
        success: true,
        data: {
          user: {
            id: user._id,
            username: user.username,
            fullName: user.fullName,
            avatar: user.avatar,
            postsCount: user.postsCount
          },
          images,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems: total,
            itemsPerPage: limit,
            hasNextPage,
            hasPrevPage
          }
        }
      });
    }

    // If no specific parameters, return all images (admin function)
    console.log('🔍 Fetching all images...');
    
    const skip = (page - 1) * limit;
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const images = await Image.find()
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('uploadedBy', 'username fullName avatar');

    const total = await Image.countDocuments();

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: {
        images,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage,
          hasPrevPage
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Retrieve error:', error);
    return NextResponse.json(
      { 
        error: 'Error retrieving images',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// POST method for advanced search/filtering
export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Starting advanced image search...');
    
    await dbConnect();

    const body = await req.json();
    const {
      username,
      tags,
      mimeType,
      minSize,
      maxSize,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = body;

    // Build filter object
    const filter: any = {};

    if (username) {
      filter.username = username.toLowerCase();
    }

    if (tags && Array.isArray(tags) && tags.length > 0) {
      filter.tags = { $in: tags };
    }

    if (mimeType) {
      filter.mimeType = { $regex: mimeType, $options: 'i' };
    }

    if (minSize || maxSize) {
      filter.fileSize = {};
      if (minSize) filter.fileSize.$gte = minSize;
      if (maxSize) filter.fileSize.$lte = maxSize;
    }

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    console.log('🔍 Filter applied:', filter);

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Execute search
    const images = await Image.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('uploadedBy', 'username fullName avatar');

    // Get total count
    const total = await Image.countDocuments(filter);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: {
        images,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage,
          hasPrevPage
        },
        filters: {
          username,
          tags,
          mimeType,
          minSize,
          maxSize,
          dateFrom,
          dateTo
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Search error:', error);
    return NextResponse.json(
      { 
        error: 'Error searching images',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
