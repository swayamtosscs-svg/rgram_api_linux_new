import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import Post from '../../../lib/models/Post';
import User from '../../../lib/models/User';
import { verifyToken } from '../../../lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectDB();
    
    // Handle the case when this endpoint is accessed directly via the URL
    // or via the [id] route with id=religious-reels
    if (req.query.id === 'religious-reels') {
      delete req.query.id;
    }

    if (req.method === 'GET') {
      // Get religious reels with automatic video and thumbnail fetching
      const { religion, page = 1, limit = 10, category } = req.query;
      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 10;
      const skip = (pageNum - 1) * limitNum;

      // Build query for religious videos/reels
      const query: any = {
        $or: [
          { type: 'video' },
          { type: 'reel' }
        ],
        isActive: true
      };

      // Filter by religion if provided
      if (religion && religion !== 'all') {
        query.religion = religion;
      }

      // Filter by category if provided
      if (category) {
        query.category = category;
      }

      // Get religious videos/reels with pagination
      const religiousContent = await (Post as any)
        .find(query)
        .populate('author', 'username fullName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();

      // Get total count for pagination
      const total = await (Post as any).countDocuments(query);

      // Get religion statistics
      const religionStats = await (Post as any).aggregate([
        {
          $match: {
            $or: [
              { type: 'video' },
              { type: 'reel' }
            ],
            isActive: true,
            religion: { $exists: true, $ne: '' }
          }
        },
        {
          $group: {
            _id: '$religion',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      // Get category statistics
      const categoryStats = await (Post as any).aggregate([
        {
          $match: {
            $or: [
              { type: 'video' },
              { type: 'reel' }
            ],
            isActive: true,
            category: { $exists: true, $ne: '' }
          }
        },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      // Calculate pagination info
      const totalPages = Math.ceil(total / limitNum);
      const hasNextPage = pageNum < totalPages;
      const hasPrevPage = pageNum > 1;

      return res.json({
        success: true,
        message: 'Religious reels fetched successfully',
        data: {
          religiousContent,
          religion: religion || 'all',
          category: category || 'all',
          religionStats,
          categoryStats,
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalContent: total,
            hasNextPage,
            hasPrevPage,
            limit: limitNum
          }
        }
      });

    } else if (req.method === 'POST') {
      // Create religious reel with automatic video/thumbnail fetching
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
      }

      const { 
        content, 
        religion, 
        category, 
        videoUrl, 
        thumbnailUrl, 
        autoFetch = false,
        fetchReligion = 'all',
        fetchCategory = 'all'
      } = req.body;

      // Validation
      if (!content && !videoUrl) {
        return res.status(400).json({
          success: false,
          message: 'Content or video URL is required'
        });
      }

      if (!religion) {
        return res.status(400).json({
          success: false,
          message: 'Religion is required for religious reels'
        });
      }

      let finalVideoUrl = videoUrl;
      let finalThumbnailUrl = thumbnailUrl;

      // Auto-fetch video and thumbnail if requested
      if (autoFetch && !videoUrl) {
        // Fetch a random religious video from the database
        const randomVideo = await (Post as any).findOne({
          $or: [
            { type: 'video' },
            { type: 'reel' }
          ],
          isActive: true,
          religion: fetchReligion === 'all' ? { $exists: true, $ne: '' } : fetchReligion,
          category: fetchCategory === 'all' ? { $exists: true, $ne: '' } : fetchCategory,
          videoUrl: { $exists: true, $ne: '' }
        }).sort({ createdAt: -1 });

        if (randomVideo) {
          finalVideoUrl = randomVideo.videoUrl;
          finalThumbnailUrl = randomVideo.thumbnailUrl || randomVideo.images?.[0] || '';
        }
      }

      // Create the religious reel
      const reel = await (Post as any).create({
        author: decoded.userId,
        content: content?.trim(),
        videoUrl: finalVideoUrl,
        thumbnailUrl: finalThumbnailUrl,
        religion,
        category,
        type: 'reel',
        isActive: true,
        createdAt: new Date()
      });

      // Update user's reel count
      await (User as any).findByIdAndUpdate(decoded.userId, {
        $inc: { reelsCount: 1 }
      });

      // Populate author info
      await reel.populate('author', 'username fullName avatar');

      return res.status(201).json({
        success: true,
        message: 'Religious reel created successfully',
        data: {
          reel,
          autoFetched: autoFetch && !videoUrl,
          fetchedVideo: finalVideoUrl,
          fetchedThumbnail: finalThumbnailUrl
        }
      });

    } else {
      return res.status(405).json({
        success: false,
        message: 'Method not allowed'
      });
    }

  } catch (error: any) {
    console.error('Religious reels error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
