import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import Post from '../../../lib/models/Post';
import Follow from '../../../lib/models/Follow';
import User from '../../../lib/models/User';
import { verifyToken } from '../../../lib/middleware/auth';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

    const currentUserId = decoded.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Get current user info
    const currentUser = await User.findById(currentUserId).lean();
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get users that the current user follows (accepted requests only)
    const followingUsers = await Follow.find({
      follower: currentUserId,
      status: 'accepted'
    }).select('following').lean();

    const followingIds = followingUsers.map((follow: any) => follow.following);

    if (followingIds.length === 0) {
      return res.json({
        success: true,
        message: 'No followed users found. Follow some users to see their posts!',
        data: {
          posts: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalPosts: 0,
            hasNextPage: false,
            hasPrevPage: false
          },
          statistics: {
            totalFollowing: 0,
            postsFromFollowing: 0,
            totalAssets: 0
          },
          userInfo: {
            userId: currentUserId,
            username: currentUser.username,
            religion: currentUser.religion,
            isPrivate: currentUser.isPrivate
          }
        }
      });
    }

    // Get posts from followed users only
    const posts = await Post.find({
      author: { $in: followingIds },
      isActive: true
    })
    .populate('author', 'username fullName avatar isPrivate religion')
    .populate('likes', 'username fullName avatar')
    .populate('comments.author', 'username fullName avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

    // Get total count for pagination
    const totalPosts = await Post.countDocuments({
      author: { $in: followingIds },
      isActive: true
    });

    const totalPages = Math.ceil(totalPosts / limit);

    // Enhance posts with asset information
    const enhancedPosts = await Promise.all(posts.map(async (post) => {
      const postAuthorId = (post.author as any)._id.toString();
      const isFollowing = followingIds.includes(postAuthorId);

      // Process images from assets
      const processedImages = await Promise.all(
        (post.images || []).map(async (imageUrl) => {
          try {
            // Check if it's a local asset path
            if (imageUrl.startsWith('/assets/')) {
              const fullPath = path.join(process.cwd(), 'public', imageUrl);
              const exists = fs.existsSync(fullPath);
              
              return {
                url: imageUrl,
                type: 'image',
                exists: exists,
                size: exists ? fs.statSync(fullPath).size : 0,
                lastModified: exists ? fs.statSync(fullPath).mtime : null
              };
            } else {
              // External URL (Cloudinary, etc.)
              return {
                url: imageUrl,
                type: 'image',
                exists: true,
                size: 0,
                lastModified: null,
                isExternal: true
              };
            }
          } catch (error) {
            return {
              url: imageUrl,
              type: 'image',
              exists: false,
              size: 0,
              lastModified: null,
              error: 'File not found'
            };
          }
        })
      );

      // Process videos from assets
      const processedVideos = await Promise.all(
        (post.videos || []).map(async (videoUrl) => {
          try {
            // Check if it's a local asset path
            if (videoUrl.startsWith('/assets/')) {
              const fullPath = path.join(process.cwd(), 'public', videoUrl);
              const exists = fs.existsSync(fullPath);
              
              return {
                url: videoUrl,
                type: 'video',
                exists: exists,
                size: exists ? fs.statSync(fullPath).size : 0,
                lastModified: exists ? fs.statSync(fullPath).mtime : null
              };
            } else {
              // External URL (Cloudinary, etc.)
              return {
                url: videoUrl,
                type: 'video',
                exists: true,
                size: 0,
                lastModified: null,
                isExternal: true
              };
            }
          } catch (error) {
            return {
              url: videoUrl,
              type: 'video',
              exists: false,
              size: 0,
              lastModified: null,
              error: 'File not found'
            };
          }
        })
      );

      // Calculate total assets size
      const totalAssetSize = processedImages.reduce((sum, img) => sum + img.size, 0) + 
                           processedVideos.reduce((sum, vid) => sum + vid.size, 0);

      return {
        ...post,
        processedImages,
        processedVideos,
        totalAssets: processedImages.length + processedVideos.length,
        totalAssetSize,
        hasAssets: processedImages.length > 0 || processedVideos.length > 0,
        visibilityReason: 'following_user',
        canInteract: isFollowing
      };
    }));

    // Calculate statistics
    const totalAssets = enhancedPosts.reduce((sum, post) => sum + post.totalAssets, 0);
    const totalAssetSize = enhancedPosts.reduce((sum, post) => sum + post.totalAssetSize, 0);
    const postsWithAssets = enhancedPosts.filter(post => post.hasAssets).length;

    // Get following user details
    const followingUserDetails = await User.find({
      _id: { $in: followingIds }
    }).select('username fullName avatar isPrivate religion').lean();

    res.json({
      success: true,
      message: 'Followed users feed with assets retrieved successfully',
      data: {
        posts: enhancedPosts,
        pagination: {
          currentPage: page,
          totalPages,
          totalPosts,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        statistics: {
          totalFollowing: followingIds.length,
          postsFromFollowing: enhancedPosts.length,
          totalAssets,
          totalAssetSize,
          postsWithAssets,
          averageAssetsPerPost: enhancedPosts.length > 0 ? (totalAssets / enhancedPosts.length).toFixed(2) : 0
        },
        followingUsers: followingUserDetails,
        userInfo: {
          userId: currentUserId,
          username: currentUser.username,
          religion: currentUser.religion,
          isPrivate: currentUser.isPrivate
        }
      }
    });

  } catch (error: any) {
    console.error('Followed assets feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
