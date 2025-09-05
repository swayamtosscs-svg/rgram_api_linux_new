import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import Baba from '../../../models/Baba';
import User from '@/lib/models/User';

export async function POST(req: NextRequest) {
  try {
    console.log('🏛️ Creating new Baba page...');
    
    await dbConnect();
    console.log('✅ Database connected');

    const body = await req.json();
    const {
      babaId,
      babaName,
      spiritualName,
      description,
      location,
      ashram,
      socialLinks,
      contactInfo,
      spiritualTeachings,
      languages,
      createdBy
    } = body;

    // Validate required fields
    if (!babaId || !babaName || !spiritualName || !createdBy) {
      return NextResponse.json(
        { error: 'Missing required fields: babaId, babaName, spiritualName, createdBy' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await User.findById(createdBy);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if babaId already exists (only active ones)
    const existingBaba = await Baba.findOne({ babaId, isActive: true });
    if (existingBaba) {
      return NextResponse.json(
        { error: 'Baba with this ID already exists' },
        { status: 409 }
      );
    }

    // If inactive baba exists, delete it completely first
    const inactiveBaba = await Baba.findOne({ babaId, isActive: false });
    if (inactiveBaba) {
      console.log('🗑️ Found inactive baba, deleting completely...');
      
      // Delete all associated content
      const { default: BabaPost } = await import('../../../models/BabaPost');
      const { default: BabaVideo } = await import('../../../models/BabaVideo');
      const { default: BabaStory } = await import('../../../models/BabaStory');

      await BabaPost.deleteMany({ babaId });
      await BabaVideo.deleteMany({ babaId });
      await BabaStory.deleteMany({ babaId });
      await Baba.findOneAndDelete({ babaId });

      // Clean up file system
      try {
        const { rm } = await import('fs/promises');
        const { join } = await import('path');
        const babaDir = join(process.cwd(), 'public', 'babaji-pages', babaId);
        
        const { existsSync } = await import('fs');
        if (existsSync(babaDir)) {
          await rm(babaDir, { recursive: true, force: true });
          console.log('✅ Inactive baba directory deleted from file system');
        }
      } catch (fileError) {
        console.warn('⚠️ Could not delete inactive baba directory:', fileError);
      }
      
      console.log('✅ Inactive baba and content deleted');
    }

    // Create baba page
    const baba = await Baba.create({
      babaId,
      babaName,
      spiritualName,
      description,
      location,
      ashram,
      socialLinks,
      contactInfo,
      spiritualTeachings,
      languages,
      createdBy
    });

    console.log('✅ Baba page created successfully');

    return NextResponse.json({
      success: true,
      message: 'Baba page created successfully',
      data: {
        babaId: baba.babaId,
        babaName: baba.babaName,
        spiritualName: baba.spiritualName,
        description: baba.description,
        location: baba.location,
        ashram: baba.ashram,
        followersCount: baba.followersCount,
        postsCount: baba.postsCount,
        videosCount: baba.videosCount,
        storiesCount: baba.storiesCount,
        isActive: baba.isActive,
        isVerified: baba.isVerified,
        createdAt: baba.createdAt
      }
    });

  } catch (error: any) {
    console.error('❌ Create baba error:', error);
    return NextResponse.json(
      { 
        error: 'Error creating baba page',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Retrieving baba pages...');
    
    await dbConnect();
    console.log('✅ Database connected');

    const { searchParams } = new URL(req.url);
    const babaId = searchParams.get('babaId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';

    // If specific babaId is provided
    if (babaId) {
      const baba = await Baba.findOne({ babaId }).populate('createdBy', 'username fullName');
      
      if (!baba) {
        return NextResponse.json(
          { error: 'Baba not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          baba: {
            babaId: baba.babaId,
            babaName: baba.babaName,
            spiritualName: baba.spiritualName,
            description: baba.description,
            avatar: baba.avatar,
            coverImage: baba.coverImage,
            location: baba.location,
            ashram: baba.ashram,
            followersCount: baba.followersCount,
            postsCount: baba.postsCount,
            videosCount: baba.videosCount,
            storiesCount: baba.storiesCount,
            isActive: baba.isActive,
            isVerified: baba.isVerified,
            socialLinks: baba.socialLinks,
            contactInfo: baba.contactInfo,
            spiritualTeachings: baba.spiritualTeachings,
            languages: baba.languages,
            createdBy: baba.createdBy,
            lastActive: baba.lastActive,
            createdAt: baba.createdAt
          }
        }
      });
    }

    // Build filter for search
    const filter: any = { isActive: true };
    
    if (search) {
      filter.$or = [
        { babaName: { $regex: search, $options: 'i' } },
        { spiritualName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { ashram: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get babas with pagination
    const babas = await Baba.find(filter)
      .sort({ followersCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'username fullName');

    // Get total count
    const total = await Baba.countDocuments(filter);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    console.log('✅ Baba pages retrieved successfully');

    return NextResponse.json({
      success: true,
      data: {
        babas: babas.map(baba => ({
          babaId: baba.babaId,
          babaName: baba.babaName,
          spiritualName: baba.spiritualName,
          description: baba.description,
          avatar: baba.avatar,
          coverImage: baba.coverImage,
          location: baba.location,
          ashram: baba.ashram,
          followersCount: baba.followersCount,
          postsCount: baba.postsCount,
          videosCount: baba.videosCount,
          storiesCount: baba.storiesCount,
          isActive: baba.isActive,
          isVerified: baba.isVerified,
          createdBy: baba.createdBy,
          lastActive: baba.lastActive,
          createdAt: baba.createdAt
        })),
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
    console.error('❌ Retrieve babas error:', error);
    return NextResponse.json(
      { 
        error: 'Error retrieving baba pages',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    console.log('✏️ Updating baba page...');
    
    await dbConnect();
    console.log('✅ Database connected');

    const body = await req.json();
    const { babaId, ...updateData } = body;

    if (!babaId) {
      return NextResponse.json(
        { error: 'Baba ID is required' },
        { status: 400 }
      );
    }

    // Find and update baba
    const baba = await Baba.findOneAndUpdate(
      { babaId },
      { ...updateData, lastActive: new Date() },
      { new: true, runValidators: true }
    ).populate('createdBy', 'username fullName');

    if (!baba) {
      return NextResponse.json(
        { error: 'Baba not found' },
        { status: 404 }
      );
    }

    console.log('✅ Baba page updated successfully');

    return NextResponse.json({
      success: true,
      message: 'Baba page updated successfully',
      data: {
        babaId: baba.babaId,
        babaName: baba.babaName,
        spiritualName: baba.spiritualName,
        description: baba.description,
        avatar: baba.avatar,
        coverImage: baba.coverImage,
        location: baba.location,
        ashram: baba.ashram,
        socialLinks: baba.socialLinks,
        contactInfo: baba.contactInfo,
        spiritualTeachings: baba.spiritualTeachings,
        languages: baba.languages,
        lastActive: baba.lastActive,
        updatedAt: baba.updatedAt
      }
    });

  } catch (error: any) {
    console.error('❌ Update baba error:', error);
    return NextResponse.json(
      { 
        error: 'Error updating baba page',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    console.log('🗑️ Deleting baba page...');
    
    await dbConnect();
    console.log('✅ Database connected');

    const { searchParams } = new URL(req.url);
    const babaId = searchParams.get('babaId');

    if (!babaId) {
      return NextResponse.json(
        { error: 'Baba ID is required' },
        { status: 400 }
      );
    }

    // Find baba
    const baba = await Baba.findOne({ babaId });
    if (!baba) {
      return NextResponse.json(
        { error: 'Baba not found' },
        { status: 404 }
      );
    }

    // Hard delete - completely remove from database
    await Baba.findOneAndDelete({ babaId });

    // Also delete all associated content
    const { default: BabaPost } = await import('../../../models/BabaPost');
    const { default: BabaVideo } = await import('../../../models/BabaVideo');
    const { default: BabaStory } = await import('../../../models/BabaStory');

    // Delete all posts
    await BabaPost.deleteMany({ babaId });
    
    // Delete all videos
    await BabaVideo.deleteMany({ babaId });
    
    // Delete all stories
    await BabaStory.deleteMany({ babaId });

    // Clean up file system
    try {
      const { rm } = await import('fs/promises');
      const { join } = await import('path');
      const babaDir = join(process.cwd(), 'public', 'babaji-pages', babaId);
      
      // Check if directory exists and delete it
      const { existsSync } = await import('fs');
      if (existsSync(babaDir)) {
        await rm(babaDir, { recursive: true, force: true });
        console.log('✅ Baba directory deleted from file system');
      }
    } catch (fileError) {
      console.warn('⚠️ Could not delete baba directory:', fileError);
    }

    console.log('✅ Baba page and all associated content deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Baba page and all associated content deleted successfully',
      data: {
        babaId: baba.babaId,
        babaName: baba.babaName,
        deletedAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ Delete baba error:', error);
    return NextResponse.json(
      { 
        error: 'Error deleting baba page',
        details: error.message
      },
      { status: 500 }
    );
  }
}
