import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import Post from '@/lib/models/Post';
import User from '@/lib/models/User';
import Follow from '@/lib/models/Follow';
import { verifyToken } from '@/lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

    switch (req.method) {
      case 'GET':
        return await getPosts(req, res, currentUserId);
      case 'PUT':
        return await updatePost(req, res, currentUserId);
      case 'DELETE':
        return await deletePost(req, res, currentUserId);
      default:
        return res.status(405).json({
          success: false,
          message: 'Method not allowed'
        });
    }
  } catch (error: any) {
    console.error('Posts management error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Get posts (user's own posts or posts they can see)
async function getPosts(req: NextApiRequest, res: NextApiResponse, currentUserId: string) {
  const { postId, userId, type, page = '1', limit = '10' } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  try {
    if (postId) {
      // Get specific post
      const post = await Post.findById(postId)
        .populate('author', 'username fullName avatar isPrivate religion')
        .populate('likes', 'username fullName avatar')
        .populate('comments.author', 'username fullName avatar')
        .lean();

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }

      // Check if user can view this post
      const canView = await checkPostVisibility(post, currentUserId);
      if (!canView) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to view this post'
        });
      }

      return res.json({
        success: true,
        message: 'Post retrieved successfully',
        data: { post }
      });
    }

    if (userId) {
      // Get posts by specific user
      const targetUserId = userId as string;
      
      // Check if current user can view target user's posts
      const canViewUserPosts = await checkUserPostsVisibility(targetUserId, currentUserId);
      if (!canViewUserPosts) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to view this user\'s posts'
        });
      }

      const filter: any = { author: targetUserId, isActive: true };
      if (type) filter.type = type;

      const posts = await Post.find(filter)
        .populate('author', 'username fullName avatar isPrivate religion')
        .populate('likes', 'username fullName avatar')
        .populate('comments.author', 'username fullName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();

      const totalPosts = await Post.countDocuments(filter);

      return res.json({
        success: true,
        message: 'User posts retrieved successfully',
        data: {
          posts,
          pagination: {
            currentPage: pageNum,
            totalPages: Math.ceil(totalPosts / limitNum),
            totalPosts,
            hasNextPage: pageNum < Math.ceil(totalPosts / limitNum),
            hasPrevPage: pageNum > 1
          }
        }
      });
    }

    // Get current user's own posts
    const filter: any = { author: currentUserId, isActive: true };
    if (type) filter.type = type;

    const posts = await Post.find(filter)
      .populate('author', 'username fullName avatar isPrivate religion')
      .populate('likes', 'username fullName avatar')
      .populate('comments.author', 'username fullName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const totalPosts = await Post.countDocuments(filter);

    res.json({
      success: true,
      message: 'Your posts retrieved successfully',
      data: {
        posts,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalPosts / limitNum),
          totalPosts,
          hasNextPage: pageNum < Math.ceil(totalPosts / limitNum),
          hasPrevPage: pageNum > 1
        }
      }
    });

  } catch (error: any) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve posts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Update post
async function updatePost(req: NextApiRequest, res: NextApiResponse, currentUserId: string) {
  const { postId } = req.query;
  const updateData = req.body;

  try {
    if (!postId) {
      return res.status(400).json({
        success: false,
        message: 'Post ID is required'
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user owns the post
    if (post.author.toString() !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own posts'
      });
    }

    // Update allowed fields
    const allowedFields = [
      'content', 'title', 'description', 'category', 'tags', 
      'isPrivate', 'allowComments', 'allowLikes', 'location', 'mood'
    ];

    const updateFields: any = {};
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        updateFields[field] = updateData[field];
      }
    });

    updateFields.updatedAt = new Date();

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      updateFields,
      { new: true }
    ).populate('author', 'username fullName avatar isPrivate religion');

    res.json({
      success: true,
      message: 'Post updated successfully',
      data: { post: updatedPost }
    });

  } catch (error: any) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update post',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Delete post
async function deletePost(req: NextApiRequest, res: NextApiResponse, currentUserId: string) {
  const { postId } = req.query;

  try {
    if (!postId) {
      return res.status(400).json({
        success: false,
        message: 'Post ID is required'
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user owns the post
    if (post.author.toString() !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own posts'
      });
    }

    // Soft delete (mark as inactive)
    await Post.findByIdAndUpdate(postId, {
      isActive: false,
      deletedAt: new Date()
    });

    // Update user's post count
    await User.findByIdAndUpdate(currentUserId, {
      $inc: { postCount: -1 }
    });

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Helper function to check if user can view a specific post
async function checkPostVisibility(post: any, currentUserId: string): Promise<boolean> {
  const postAuthorId = post.author._id.toString();
  
  // User can always view their own posts
  if (postAuthorId === currentUserId) {
    return true;
  }

  // Public posts can be viewed by anyone
  if (!post.isPrivate) {
    return true;
  }

  // Private posts can only be viewed by followers
  const followRelationship = await Follow.findOne({
    follower: currentUserId,
    following: postAuthorId,
    status: 'accepted'
  });

  return !!followRelationship;
}

// Helper function to check if user can view another user's posts
async function checkUserPostsVisibility(targetUserId: string, currentUserId: string): Promise<boolean> {
  // User can always view their own posts
  if (targetUserId === currentUserId) {
    return true;
  }

  // Check if target user is private
  const targetUser = await User.findById(targetUserId).select('isPrivate');
  if (!targetUser) {
    return false;
  }

  // Public users' posts can be viewed by anyone
  if (!targetUser.isPrivate) {
    return true;
  }

  // Private users' posts can only be viewed by followers
  const followRelationship = await Follow.findOne({
    follower: currentUserId,
    following: targetUserId,
    status: 'accepted'
  });

  return !!followRelationship;
}


