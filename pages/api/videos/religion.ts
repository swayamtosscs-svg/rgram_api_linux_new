import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import Post from '../../../lib/models/Post';
import User from '../../../lib/models/User'; // Import User model to register it with Mongoose

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await connectDB();
    
    // Check if this endpoint is being accessed via the [id] route
    const { id } = req.query;
    if (id === 'religion') {
      // Remove the id parameter to avoid ObjectId casting issues
      delete req.query.id;
    }

    const { religion, page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: any = {
      type: 'video',
      isActive: true
    };

    // Filter by religion if provided
    if (religion) {
      query.religion = religion;
    }

    // Get videos with pagination
    const videos = await (Post as any)
      .find(query)
      .populate('author', 'username fullName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count for pagination
    const total = await (Post as any).countDocuments(query);

    // Get religion statistics
    const religionStats = await (Post as any).aggregate([
      {
        $match: {
          type: 'video',
          isActive: true,
          religion: { $exists: true, $ne: '' }
        }
      },
      {
        $group: {
          _id: '$religion',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      success: true,
      message: 'Religion videos fetched successfully',
      data: {
        videos,
        religion: religion || 'all',
        religionStats,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalVideos: total,
          hasNextPage,
          hasPrevPage,
          limit: limitNum
        }
      }
    });

  } catch (error: any) {
    console.error('Fetch religion videos error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
