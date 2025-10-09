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
      type = 'all',
      category = 'all',
      religion = 'all',
      contentType = 'all' // 'text', 'image', 'video', 'all'
    } = req.query;

    const limitNum = Math.min(parseInt(limit as string), 100); // Max 100 items

    // Build query filters
    const query: any = {
      isActive: true
    };

    // Filter by post type
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

    // Filter by content type
    if (contentType !== 'all') {
      if (contentType === 'text') {
        query.content = { $exists: true, $ne: '', $not: { $regex: /^\s*$/ } };
        query.images = { $size: 0 };
        query.videos = { $size: 0 };
      } else if (contentType === 'image') {
        query.images = { $exists: true, $not: { $size: 0 } };
      } else if (contentType === 'video') {
        query.videos = { $exists: true, $not: { $size: 0 } };
      }
    } else {
      // Must have at least one type of content
      query.$or = [
        { content: { $exists: true, $ne: '', $not: { $regex: /^\s*$/ } } },
        { images: { $exists: true, $not: { $size: 0 } } },
        { videos: { $exists: true, $not: { $size: 0 } } }
      ];
    }

    // Get posts with minimal data for sharing
    const posts = await Post.find(query)
      .select('_id content title description type category religion images videos sharesCount likesCount createdAt')
      .populate('author', 'username fullName avatar')
      .sort({ createdAt: -1 })
      .limit(limitNum);

    // Extract content IDs and create response
    const shareableContent = posts.map(post => {
      const hasContent = post.content && post.content.trim().length > 0;
      const hasImages = post.images && post.images.length > 0;
      const hasVideos = post.videos && post.videos.length > 0;

      return {
        postId: post._id,
        content: post.content,
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
        // Content IDs
        imageIds: post.images || [],
        primaryImageId: post.images && post.images.length > 0 ? post.images[0] : null,
        videoIds: post.videos || [],
        primaryVideoId: post.videos && post.videos.length > 0 ? post.videos[0] : null,
        // Content flags
        hasContent: hasContent,
        hasImages: hasImages,
        hasVideos: hasVideos,
        contentType: hasVideos ? 'video' : hasImages ? 'image' : 'text',
        // Stats
        shareCount: post.sharesCount,
        likeCount: post.likesCount,
        createdAt: post.createdAt,
        shareable: true
      };
    });

    // Get total count
    const totalCount = await Post.countDocuments(query);

    res.json({
      success: true,
      message: 'Shareable content retrieved successfully',
      data: {
        shareableContent: shareableContent,
        totalCount: totalCount,
        returnedCount: shareableContent.length,
        filters: {
          type: type,
          category: category,
          religion: religion,
          contentType: contentType,
          limit: limitNum
        }
      }
    });

  } catch (error: any) {
    console.error('Get shareable content error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
