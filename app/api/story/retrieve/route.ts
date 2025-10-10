import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import Story from '@/lib/models/Story';
import User from '@/lib/models/User';

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Starting story media retrieval...');
    
    await dbConnect();
    console.log('✅ Database connected');

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const storyId = searchParams.get('storyId');
    const type = searchParams.get('type') as 'image' | 'video' | null;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const includeExpired = searchParams.get('includeExpired') === 'true';

    // If storyId is provided, return specific story
    if (storyId) {
      if (!/^[0-9a-fA-F]{24}$/.test(storyId)) {
        return NextResponse.json(
          { error: 'Invalid story ID format' },
          { status: 400 }
        );
      }

      const story = await Story.findById(storyId)
        .populate('author', 'username fullName avatar')
        .populate('mentions', 'username fullName avatar')
        .populate('views', 'username fullName avatar');

      if (!story) {
        return NextResponse.json(
          { error: 'Story not found' },
          { status: 404 }
        );
      }

      // Check if story is expired
      const isExpired = story.isExpired();
      
      return NextResponse.json({
        success: true,
        data: {
          story: {
            id: story._id,
            media: story.media,
            type: story.type,
            caption: story.caption,
            mentions: story.mentions,
            hashtags: story.hashtags,
            location: story.location,
            isActive: story.isActive,
            isExpired: isExpired,
            expiresAt: story.expiresAt,
            views: story.views,
            viewsCount: story.viewsCount,
            author: story.author,
            createdAt: story.createdAt,
            updatedAt: story.updatedAt
          }
        }
      });
    }

    // If userId is provided, return user's stories
    if (userId) {
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
      const filter: any = { author: userId };
      
      if (type && ['image', 'video'].includes(type)) {
        filter.type = type;
      }

      if (!includeExpired) {
        filter.expiresAt = { $gt: new Date() };
        filter.isActive = true;
      }

      // Build sort object
      const sort: any = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Calculate skip value for pagination
      const skip = (page - 1) * limit;

      // Get stories with pagination
      const stories = await Story.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('author', 'username fullName avatar')
        .populate('mentions', 'username fullName avatar')
        .populate('views', 'username fullName avatar');

      // Get total count for pagination
      const total = await Story.countDocuments(filter);

      // Calculate pagination info
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      // Process stories to add expiration status
      const processedStories = stories.map(story => ({
        id: story._id,
        media: story.media,
        type: story.type,
        caption: story.caption,
        mentions: story.mentions,
        hashtags: story.hashtags,
        location: story.location,
        isActive: story.isActive,
        isExpired: story.isExpired(),
        expiresAt: story.expiresAt,
        views: story.views,
        viewsCount: story.viewsCount,
        author: story.author,
        createdAt: story.createdAt,
        updatedAt: story.updatedAt
      }));

      return NextResponse.json({
        success: true,
        data: {
          user: {
            id: user._id,
            username: user.username,
            fullName: user.fullName,
            avatar: user.avatar
          },
          stories: processedStories,
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

    // If no userId or storyId provided, return error
    return NextResponse.json(
      { error: 'Either userId or storyId is required' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Story retrieval error:', error);
    return NextResponse.json(
      { 
        error: 'Error retrieving stories',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Method to add view to a story
export async function POST(req: NextRequest) {
  try {
    console.log('👁️ Adding view to story...');
    
    await dbConnect();
    console.log('✅ Database connected');

    const { searchParams } = new URL(req.url);
    const storyId = searchParams.get('storyId');
    const userId = searchParams.get('userId');

    if (!storyId || !userId) {
      return NextResponse.json(
        { error: 'Both storyId and userId are required' },
        { status: 400 }
      );
    }

    // Validate IDs
    if (!/^[0-9a-fA-F]{24}$/.test(storyId) || !/^[0-9a-fA-F]{24}$/.test(userId)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    // Check if story exists
    const story = await Story.findById(storyId);
    if (!story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    // Check if story is expired
    if (story.isExpired()) {
      return NextResponse.json(
        { error: 'Story has expired' },
        { status: 400 }
      );
    }

    // Add view if not already viewed
    if (!story.views.includes(userId)) {
      story.views.push(userId);
      story.viewsCount = story.views.length;
      await story.save();
    }

    return NextResponse.json({
      success: true,
      message: 'View added successfully',
      data: {
        storyId: story._id,
        viewsCount: story.viewsCount,
        hasViewed: true
      }
    });

  } catch (error: any) {
    console.error('Add view error:', error);
    return NextResponse.json(
      { 
        error: 'Error adding view',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
