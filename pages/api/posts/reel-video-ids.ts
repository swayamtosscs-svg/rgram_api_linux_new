import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import Post from '@/lib/models/Post';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/middleware/auth';

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
      limit = 50,
      type = 'reel',
      category = 'all',
      religion = 'all'
    } = req.query;

    const limitNum = Math.min(parseInt(limit as string), 100); // Max 100 items

    // Build query filters
    const query: any = {
      isActive: true,
      type: type,
      videos: { $exists: true, $not: { $size: 0 } } // Must have videos
    };

    // Filter by category
    if (category !== 'all') {
      query.category = category;
    }

    // Filter by religion
    if (religion !== 'all') {
      query.religion = religion;
    }

    // Get posts with minimal data for video IDs
    const posts = await Post.find(query)
      .select('_id videos title description type category religion sharesCount likesCount createdAt')
      .populate('author', 'username fullName avatar')
      .sort({ createdAt: -1 })
      .limit(limitNum);

    // Extract video IDs and create response
    const videoData = posts.map(post => ({
      postId: post._id,
      videoIds: post.videos,
      primaryVideoId: post.videos[0], // Primary video ID for sharing
      title: post.title,
      description: post.description,
      type: post.type,
      category: post.category,
      religion: post.religion,
      author: {
        username: (post.author as any).username,
        fullName: (post.author as any).fullName,
        avatar: (post.author as any).avatar
      },
      shareCount: post.sharesCount,
      likeCount: post.likesCount,
      createdAt: post.createdAt,
      shareable: true
    }));

    // Get total count
    const totalCount = await Post.countDocuments(query);

    res.json({
      success: true,
      message: 'Reel video IDs retrieved successfully',
      data: {
        videoData: videoData,
        totalCount: totalCount,
        returnedCount: videoData.length,
        filters: {
          type: type,
          category: category,
          religion: religion,
          limit: limitNum
        }
      }
    });

  } catch (error: any) {
    console.error('Get reel video IDs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
