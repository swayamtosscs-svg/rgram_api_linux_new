import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import Post, { IPost } from '../../../lib/models/Post';
import User from '../../../lib/models/User';
import { verifyToken } from '../../../lib/middleware/auth';
import { Document } from 'mongoose';

// Interface for populated post with author data
interface IPopulatedPost extends Omit<IPost, 'author' | 'likes' | 'comments' | 'saves'> {
  author: {
    _id: string;
    username: string;
    fullName: string;
    avatar?: string;
    religion?: string;
    isPrivate?: boolean;
  };
  likes: Array<{
    _id: string;
    username: string;
    fullName: string;
    avatar?: string;
  }>;
  comments: Array<{
    _id: string;
    author: {
      _id: string;
      username: string;
      fullName: string;
      avatar?: string;
    };
    content: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  saves: Array<{
    _id: string;
    username: string;
    fullName: string;
    avatar?: string;
  }>;
}

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

    await connectDB();

    // Get user info
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Get query parameters
    const { 
      page = '1', 
      limit = '10',
      type = 'all',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 50); // Max 50 posts per page
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: any = {
      author: user._id,
      isActive: true
    };

    // Filter by post type if specified
    if (type !== 'all' && ['post', 'reel', 'video'].includes(type as string)) {
      query.type = type;
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    // Get posts
    const posts = await Post.find(query)
      .populate('author', 'username fullName avatar religion isPrivate')
      .populate('likes', 'username fullName avatar')
      .populate('comments.author', 'username fullName avatar')
      .populate('saves', 'username fullName avatar')
      .sort(sort)
      .skip(skip)
      .limit(limitNum) as unknown as IPopulatedPost[];

    // Get total count for pagination
    const totalPosts = await Post.countDocuments(query);

    // Calculate pagination info
    const totalPages = Math.ceil(totalPosts / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    // Format posts data
    const formattedPosts = posts.map(post => ({
      _id: post._id,
      content: post.content,
      images: post.images,
      videos: post.videos,
      externalUrls: post.externalUrls,
      type: post.type,
      provider: post.provider,
      title: post.title,
      description: post.description,
      duration: post.duration,
      category: post.category,
      religion: post.religion,
      author: {
        _id: post.author._id,
        username: post.author.username,
        fullName: post.author.fullName,
        avatar: post.author.avatar,
        religion: post.author.religion,
        isPrivate: post.author.isPrivate
      },
      likes: post.likes,
      likesCount: post.likesCount,
      comments: post.comments,
      commentsCount: post.commentsCount,
      shares: post.shares,
      sharesCount: post.sharesCount,
      saves: post.saves,
      savesCount: post.savesCount,
      isActive: post.isActive,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    }));

    res.status(200).json({
      success: true,
      message: 'User posts retrieved successfully',
      data: {
        posts: formattedPosts,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalPosts,
          itemsPerPage: limitNum,
          hasNextPage,
          hasPrevPage
        },
        filters: {
          type: type as string,
          sortBy: sortBy as string,
          sortOrder: sortOrder as string
        },
        user: {
          _id: user._id,
          username: user.username,
          fullName: user.fullName,
          avatar: user.avatar,
          religion: user.religion,
          isPrivate: user.isPrivate
        }
      }
    });

  } catch (error: any) {
    console.error('My posts error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

