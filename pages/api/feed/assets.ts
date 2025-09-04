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

    // Build author filter - prioritize followed users, then show public users
    let authorFilter: any = {};
    
    if (followingIds.length > 0) {
      // If user follows people, show their posts first
      authorFilter = { author: { $in: followingIds } };
    } else {
      // If not following anyone, show posts from public users
      const publicUsers = await User.find({ 
        isPrivate: false,
        _id: { $ne: currentUserId }
      }).select('_id').lean();
      
      const publicUserIds = publicUsers.map(user => user._id);
      authorFilter = { author: { $in: publicUserIds } };
    }

    // Get posts with assets (images or videos)
    const posts = await Post.find({
      ...authorFilter,
      isActive: true,
      $or: [
        { images: { $exists: true, $not: { $size: 0 } } },
        { videos: { $exists: true, $not: { $size: 0 } } }
      ]
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
      ...authorFilter,
      isActive: true,
      $or: [
        { images: { $exists: true, $not: { $size: 0 } } },
        { videos: { $exists: true, $not: { $size: 0 } } }
      ]
    });

    const totalPages = Math.ceil(totalPosts / limit);

    // Enhance posts with asset information
    const enhancedPosts = await Promise.all(posts.map(async (post) => {
      const postAuthorId = (post.author as any)._id.toString();
      const isFollowing = followingIds.includes(postAuthorId);
      const isOwnPost = postAuthorId === currentUserId;

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
                lastModified: exists ? fs.statSync(fullPath).mtime : null,
                isLocal: true
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
                lastModified: exists ? fs.statSync(fullPath).mtime : null,
                isLocal: true
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

      // Determine visibility reason
      let visibilityReason = '';
      if (isOwnPost) {
        visibilityReason = 'own_post';
      } else if (isFollowing) {
        visibilityReason = 'following_user';
      } else {
        visibilityReason = 'public_user';
      }

      return {
        ...post,
        processedImages,
        processedVideos,
        totalAssets: processedImages.length + processedVideos.length,
        totalAssetSize,
        hasAssets: processedImages.length > 0 || processedVideos.length > 0,
        visibilityReason,
        canInteract: isFollowing || !(post.author as any).isPrivate || isOwnPost
      };
    }));

    // Calculate statistics
    const totalAssets = enhancedPosts.reduce((sum, post) => sum + post.totalAssets, 0);
    const totalAssetSize = enhancedPosts.reduce((sum, post) => sum + post.totalAssetSize, 0);
    const postsWithAssets = enhancedPosts.filter(post => post.hasAssets).length;
    const localAssets = enhancedPosts.reduce((sum, post) => 
      sum + post.processedImages.filter(img => img.isLocal).length + 
           post.processedVideos.filter(vid => vid.isLocal).length, 0);
    const externalAssets = enhancedPosts.reduce((sum, post) => 
      sum + post.processedImages.filter(img => img.isExternal).length + 
           post.processedVideos.filter(vid => vid.isExternal).length, 0);

    res.json({
      success: true,
      message: 'Assets feed retrieved successfully',
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
          postsWithAssets,
          totalAssets,
          totalAssetSize,
          localAssets,
          externalAssets,
          averageAssetsPerPost: enhancedPosts.length > 0 ? (totalAssets / enhancedPosts.length).toFixed(2) : 0,
          postsFromFollowing: enhancedPosts.filter(p => followingIds.includes(p.author._id.toString())).length,
          postsFromPublic: enhancedPosts.filter(p => !followingIds.includes(p.author._id.toString()) && p.author._id.toString() !== currentUserId).length
        },
        userInfo: {
          userId: currentUserId,
          username: currentUser.username,
          religion: currentUser.religion,
          isPrivate: currentUser.isPrivate
        }
      }
    });

  } catch (error: any) {
    console.error('Assets feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
