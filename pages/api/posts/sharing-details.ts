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

    const { postId } = req.query;

    if (!postId) {
      return res.status(400).json({ 
        success: false, 
        message: 'postId is required as query parameter' 
      });
    }

    // Get the post with all users who shared it
    const post = await Post.findById(postId)
      .populate('author', 'username fullName avatar religion isPrivate')
      .populate('shares', 'username fullName avatar religion isPrivate')
      .populate('likes', 'username fullName avatar')
      .populate('comments.author', 'username fullName avatar');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check if current user has shared this post
    const currentUserShared = post.shares.some((shareId: any) => shareId.toString() === decoded.userId);

    // Transform shared users data
    const sharedUsers = post.shares.map((user: any) => ({
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      avatar: user.avatar,
      religion: user.religion,
      isPrivate: user.isPrivate,
      isCurrentUser: user._id.toString() === decoded.userId
    }));

    // Get sharing statistics
    const sharingStats = {
      totalShares: post.sharesCount,
      totalLikes: post.likesCount,
      totalComments: post.commentsCount,
      shareToLikeRatio: post.likesCount > 0 ? (post.sharesCount / post.likesCount).toFixed(2) : 0,
      shareToCommentRatio: post.commentsCount > 0 ? (post.sharesCount / post.commentsCount).toFixed(2) : 0
    };

    res.json({
      success: true,
      message: 'Post sharing details retrieved successfully',
      data: {
        post: {
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
          createdAt: post.createdAt,
          updatedAt: post.updatedAt
        },
        sharedUsers: sharedUsers,
        sharingStats: sharingStats,
        currentUserShared: currentUserShared,
        shareCount: post.sharesCount,
        likeCount: post.likesCount,
        commentCount: post.commentsCount
      }
    });

  } catch (error: any) {
    console.error('Get post sharing details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
