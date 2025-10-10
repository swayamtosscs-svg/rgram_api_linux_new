import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import Post from '@/lib/models/Post';
import Follow from '@/lib/models/Follow';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/middleware/auth';

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

    // Get all users to check their privacy settings
    const allUsers = await User.find({}).select('_id isPrivate').lean();
    const privateUsers = allUsers.filter(user => user.isPrivate).map(user => user._id.toString());
    const publicUsers = allUsers.filter(user => !user.isPrivate).map(user => user._id.toString());

    // Build the author filter for posts
    let authorFilter: any = {};

    // Include posts from users the current user follows (regardless of privacy)
    if (followingIds.length > 0) {
      authorFilter = { author: { $in: followingIds } };
    }

    // Include posts from public users (even if not following)
    if (publicUsers.length > 0) {
      if (followingIds.length > 0) {
        // Combine followed users and public users
        const combinedIds = Array.from(new Set([...followingIds, ...publicUsers]));
        authorFilter = { author: { $in: combinedIds } };
      } else {
        // Only public users if not following anyone
        authorFilter = { author: { $in: publicUsers } };
      }
    }

    // If no posts found with current filter, show posts from same religion
    if (currentUser.religion) {
      const sameReligionUsers = await User.find({ 
        religion: currentUser.religion,
        _id: { $ne: currentUserId } // Exclude current user
      }).select('_id isPrivate').lean();

      const sameReligionPublicUsers = sameReligionUsers
        .filter(user => !user.isPrivate)
        .map(user => user._id.toString());

      if (sameReligionPublicUsers.length > 0) {
        if (Object.keys(authorFilter).length > 0) {
          // Add to existing filter
          const existingIds = authorFilter.author.$in || [];
          const combinedIds = Array.from(new Set([...existingIds, ...sameReligionPublicUsers]));
          authorFilter.author.$in = combinedIds;
        } else {
          // Use only same religion public users
          authorFilter = { author: { $in: sameReligionPublicUsers } };
        }
      }
    }

    // Get posts with the filter
    const posts = await Post.find({
      ...authorFilter,
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
      ...authorFilter,
      isActive: true
    });

    const totalPages = Math.ceil(totalPosts / limit);

    // Add metadata about why each post is shown
    const enhancedPosts = posts.map(post => {
      const postAuthorId = post.author._id.toString();
      const isFollowing = followingIds.includes(postAuthorId);
      const isPublic = publicUsers.includes(postAuthorId);
      const isOwnPost = postAuthorId === currentUserId;

      let visibilityReason = '';
      if (isOwnPost) {
        visibilityReason = 'own_post';
      } else if (isFollowing) {
        visibilityReason = 'following_user';
      } else if (isPublic) {
        visibilityReason = 'public_user';
      }

      return {
        ...post,
        visibilityReason,
        canInteract: isFollowing || isPublic || isOwnPost
      };
    });

    // Get statistics
    const stats = {
      totalFollowing: followingIds.length,
      totalPublicUsers: publicUsers.length,
      totalPrivateUsers: privateUsers.length,
      postsFromFollowing: posts.filter(p => followingIds.includes(p.author._id.toString())).length,
      postsFromPublic: posts.filter(p => publicUsers.includes(p.author._id.toString()) && !followingIds.includes(p.author._id.toString())).length
    };

    res.json({
      success: true,
      message: 'Social feed retrieved successfully',
      data: {
        posts: enhancedPosts,
        pagination: {
          currentPage: page,
          totalPages,
          totalPosts,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        statistics: stats,
        userInfo: {
          userId: currentUserId,
          username: currentUser.username,
          religion: currentUser.religion,
          isPrivate: currentUser.isPrivate
        }
      }
    });

  } catch (error: any) {
    console.error('Social feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
