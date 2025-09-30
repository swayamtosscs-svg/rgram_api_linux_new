import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import Post from '../../../lib/models/Post';
import User from '../../../lib/models/User';
import { verifyToken } from '../../../lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    // Query parameters
    const { 
      page = 1, 
      limit = 20,
      type = 'all',
      category = 'all',
      religion = 'all'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build query filters
    const query: any = {
      shares: decoded.userId, // Posts shared by the current user
      isActive: true
    };

    // Filter by type
    if (type !== 'all') {
      query.type = type;
    }

    // Filter by category
    if (category !== 'all') {
      query.category = category;
    }

    // Filter by religion
    if (religion !== 'all') {
      query.religion = religion;
    }

    // Get posts shared by the user
    const sharedPosts = await Post.find(query)
      .populate('author', 'username fullName avatar religion isPrivate')
      .populate('shares', 'username fullName avatar')
      .populate('likes', 'username fullName avatar')
      .populate('comments.author', 'username fullName avatar')
      .sort({ updatedAt: -1 }) // Sort by when they were shared (updatedAt)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const totalCount = await Post.countDocuments(query);

    // Transform posts to include sharing information
    const transformedPosts = sharedPosts.map(post => {
      const shareIndex = post.shares.findIndex((shareId: any) => shareId.toString() === decoded.userId);
      const sharedAt = shareIndex >= 0 ? post.updatedAt : null;

      return {
        _id: post._id,
        content: post.content,
        title: post.title,
        description: post.description,
        type: post.type,
        category: post.category,
        religion: post.religion,
        author: post.author,
        videos: post.videos,
        images: post.images,
        duration: post.duration,
        // Sharing information
        shareCount: post.sharesCount,
        likeCount: post.likesCount,
        commentCount: post.commentsCount,
        isSharedByUser: true, // All posts in this list are shared by user
        isLikedByUser: post.likes.some((likeId: any) => likeId.toString() === decoded.userId),
        sharedAt: sharedAt,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        // Content IDs for sharing
        videoIds: post.videos || [],
        primaryVideoId: post.videos && post.videos.length > 0 ? post.videos[0] : null,
        imageIds: post.images || [],
        primaryImageId: post.images && post.images.length > 0 ? post.images[0] : null,
        hasContent: post.content && post.content.trim().length > 0,
        hasImages: post.images && post.images.length > 0,
        hasVideos: post.videos && post.videos.length > 0
      };
    });

    // Get user's sharing statistics
    const userSharingStats = await Post.aggregate([
      { $match: { shares: decoded.userId, isActive: true } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const sharingStats = {
      totalShared: totalCount,
      byType: userSharingStats.reduce((acc: any, stat: any) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      categories: await Post.aggregate([
        { $match: { shares: decoded.userId, isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),
      religions: await Post.aggregate([
        { $match: { shares: decoded.userId, isActive: true, religion: { $ne: '' } } },
        { $group: { _id: '$religion', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    };

    res.json({
      success: true,
      message: 'User shared posts retrieved successfully',
      data: {
        sharedPosts: transformedPosts,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          totalCount: totalCount,
          hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
          hasPrevPage: pageNum > 1
        },
        sharingStats: sharingStats,
        filters: {
          type: type,
          category: category,
          religion: religion,
          page: pageNum,
          limit: limitNum
        }
      }
    });

  } catch (error: any) {
    console.error('Get user shared posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
