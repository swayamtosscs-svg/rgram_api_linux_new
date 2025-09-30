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
      religion = 'all',
      userId = 'all',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build query filters
    const query: any = {
      isActive: true,
      $or: [
        { content: { $exists: true, $ne: '', $not: { $regex: /^\s*$/ } } }, // Has text content
        { images: { $exists: true, $not: { $size: 0 } } }, // Has images
        { videos: { $exists: true, $not: { $size: 0 } } } // Has videos
      ]
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

    // Filter by user
    if (userId !== 'all') {
      query.author = userId;
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // Get posts with pagination
    const posts = await Post.find(query)
      .populate('author', 'username fullName avatar religion isPrivate')
      .populate('shares', 'username fullName avatar')
      .populate('likes', 'username fullName avatar')
      .populate('comments.author', 'username fullName avatar')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const totalCount = await Post.countDocuments(query);

    // Transform posts to include all content types and share information
    const transformedPosts = posts.map(post => ({
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
      videoIds: post.videos || [], // All video IDs
      primaryVideoId: post.videos && post.videos.length > 0 ? post.videos[0] : null, // Primary video ID for sharing
      imageIds: post.images || [], // All image IDs
      primaryImageId: post.images && post.images.length > 0 ? post.images[0] : null, // Primary image ID for sharing
      hasContent: post.content && post.content.trim().length > 0,
      hasImages: post.images && post.images.length > 0,
      hasVideos: post.videos && post.videos.length > 0,
      shareCount: post.sharesCount,
      likeCount: post.likesCount,
      commentCount: post.commentsCount,
      isSharedByUser: post.shares.some((shareId: any) => shareId.toString() === decoded.userId),
      isLikedByUser: post.likes.some((likeId: any) => likeId.toString() === decoded.userId),
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      shareable: true // All posts returned are shareable
    }));

    // Get user's shared posts for additional context
    const userSharedPosts = await Post.find({
      shares: decoded.userId,
      isActive: true,
      $or: [
        { content: { $exists: true, $ne: '', $not: { $regex: /^\s*$/ } } },
        { images: { $exists: true, $not: { $size: 0 } } },
        { videos: { $exists: true, $not: { $size: 0 } } }
      ]
    }).select('_id').lean();

    const userSharedPostIds = userSharedPosts.map(post => post._id.toString());

    res.json({
      success: true,
      message: 'Shareable reel video posts retrieved successfully',
      data: {
        posts: transformedPosts,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          totalCount: totalCount,
          hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
          hasPrevPage: pageNum > 1
        },
        filters: {
          type: type,
          category: category,
          religion: religion,
          userId: userId,
          sortBy: sortBy,
          sortOrder: sortOrder
        },
        userSharedPostIds: userSharedPostIds,
        totalShareablePosts: totalCount
      }
    });

  } catch (error: any) {
    console.error('Get shareable posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
