import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import Post from '@/lib/models/Post';
import Follow from '@/lib/models/Follow';
import { verifyToken } from '@/lib/middleware/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false,
      message: 'Method not allowed' 
    });
  }

  try {
    await connectDB();

    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    const userId = decoded.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Get users that the current user follows (only accepted follows)
    const following = await (Follow as any).find({ 
      follower: userId,
      status: 'accepted' // Only get accepted follows
    })
      .select('following')
      .lean();

    interface FollowDoc {
      following: string;
    }
    const followingIds = following.map((f: FollowDoc) => f.following);

    // If user is not following anyone, return empty result
    if (followingIds.length === 0) {
      return res.json({
        success: true,
        message: 'No followed users found',
        data: {
          posts: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalPosts: 0,
            hasNextPage: false,
            hasPrevPage: false
          }
        }
      });
    }

    // Get posts from followed users only (excluding current user's posts)
    const posts = await (Post as any).find({
      author: { $in: followingIds }, // Only posts from followed users
      isActive: true
    })
    .populate('author', 'username fullName avatar isPrivate followersCount followingCount postsCount')
    .populate('likes', 'username fullName avatar')
    .populate('comments.author', 'username fullName avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

    // Get total count for pagination
    const totalPosts = await (Post as any).countDocuments({
      author: { $in: followingIds },
      isActive: true
    });

    const totalPages = Math.ceil(totalPosts / limit);

    // Process posts to ensure Cloudinary URLs are properly formatted
    const processedPosts = posts.map((post: any) => ({
      ...post,
      // Ensure images array contains proper Cloudinary URLs
      images: post.images?.map((imageUrl: string) => {
        // If it's already a Cloudinary URL, return as is
        if (imageUrl.includes('cloudinary.com')) {
          return imageUrl;
        }
        // If it's a relative path or local URL, you might want to transform it
        // For now, return as is since the existing system should handle this
        return imageUrl;
      }) || [],
      // Ensure videos array contains proper Cloudinary URLs
      videos: post.videos?.map((videoUrl: string) => {
        if (videoUrl.includes('cloudinary.com')) {
          return videoUrl;
        }
        return videoUrl;
      }) || [],
      // Add additional metadata for better frontend handling
      _metadata: {
        hasImages: post.images && post.images.length > 0,
        hasVideos: post.videos && post.videos.length > 0,
        hasContent: !!post.content,
        totalMediaCount: (post.images?.length || 0) + (post.videos?.length || 0)
      }
    }));

    res.json({
      success: true,
      message: 'Posts from followed users retrieved successfully',
      data: {
        posts: processedPosts,
        pagination: {
          currentPage: page,
          totalPages,
          totalPosts,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit: limit
        },
        _info: {
          followingCount: followingIds.length,
          requestedBy: userId,
          timestamp: new Date().toISOString()
        }
      }
    });
  } catch (error: any) {
    console.error('Followed users posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}


