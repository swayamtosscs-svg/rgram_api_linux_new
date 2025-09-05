import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import Image from '@/models/Image';
import User from '@/lib/models/User';

// Main images API endpoint - provides overview and statistics
export async function GET(req: NextRequest) {
  try {
    console.log('📊 Getting images overview...');
    
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');
    const stats = searchParams.get('stats') === 'true';

    // If stats is requested, return statistics
    if (stats) {
      const totalImages = await Image.countDocuments();
      const totalUsers = await User.countDocuments();
      
      // Get images by type
      const imagesByType = await Image.aggregate([
        {
          $group: {
            _id: '$mimeType',
            count: { $sum: 1 }
          }
        }
      ]);

      // Get recent uploads (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentUploads = await Image.countDocuments({
        createdAt: { $gte: sevenDaysAgo }
      });

      // Get top users by image count
      const topUsers = await Image.aggregate([
        {
          $group: {
            _id: '$username',
            imageCount: { $sum: 1 }
          }
        },
        {
          $sort: { imageCount: -1 }
        },
        {
          $limit: 10
        }
      ]);

      return NextResponse.json({
        success: true,
        data: {
          totalImages,
          totalUsers,
          recentUploads,
          imagesByType,
          topUsers
        }
      });
    }

    // If username is provided, get user's image summary
    if (username) {
      // Check if user exists - try both exact match and case-insensitive
      let user = await User.findOne({ username: username });
      if (!user) {
        user = await User.findOne({ username: username.toLowerCase() });
      }
      if (!user) {
        user = await User.findOne({ username: username.toUpperCase() });
      }
      
      if (!user) {
        return NextResponse.json(
          { 
            error: 'User not found',
            searchedUsername: username
          },
          { status: 404 }
        );
      }

      const userImageCount = await Image.countDocuments({ username: username.toLowerCase() });
      const recentImages = await Image.find({ username: username.toLowerCase() })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('fileName filePath fullUrl createdAt');

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
          imageCount: userImageCount,
          recentImages
        }
      });
    }

    // Default: return basic info
    return NextResponse.json({
      success: true,
      message: 'Images API is running',
      endpoints: {
        upload: '/api/images/upload',
        retrieve: '/api/images/retrieve',
        delete: '/api/images/delete',
        stats: '/api/images?stats=true'
      },
      usage: {
        upload: 'POST /api/images/upload with multipart/form-data',
        retrieve: 'GET /api/images/retrieve?username=USERNAME',
        delete: 'DELETE /api/images/delete?id=IMAGE_ID',
        stats: 'GET /api/images?stats=true'
      }
    });

  } catch (error: any) {
    console.error('❌ Images API error:', error);
    return NextResponse.json(
      { 
        error: 'Error in images API',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
