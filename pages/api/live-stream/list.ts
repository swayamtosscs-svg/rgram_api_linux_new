import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import LiveStream from '../../../lib/models/LiveStream';
import { verifyToken } from '../../../lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Check if user is authenticated (optional for public streams)
    let userId = null;
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      try {
        const decoded = await verifyToken(token);
        userId = decoded?.userId;
      } catch (error) {
        // Token is invalid, but we can still show public streams
        console.log('Invalid token, showing public streams');
      }
    }

    const {
      page = '1',
      limit = '20',
      status = 'live',
      category,
      search,
      userId: streamerId,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const filter: any = {};

    // Status filter
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Category filter
    if (category && category !== 'all') {
      filter.category = category;
    }

    // Search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }

    // Streamer filter
    if (streamerId) {
      filter.userId = streamerId;
    }

    // Privacy filter - show public streams or private streams user has access to
    if (userId) {
      filter.$or = [
        { isPrivate: false },
        { 
          isPrivate: true, 
          allowedViewers: userId 
        }
      ];
    } else {
      // For unauthenticated users, only show public streams
      filter.isPrivate = false;
    }

    // Build sort query
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const [liveStreams, total] = await Promise.all([
      LiveStream.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .select('-streamKey -streamUrl') // Don't expose sensitive URLs
        .lean(),
      LiveStream.countDocuments(filter)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      success: true,
      data: {
        streams: liveStreams.map(stream => ({
          streamId: stream._id,
          userId: stream.userId,
          username: stream.username,
          title: stream.title,
          description: stream.description,
          status: stream.status,
          category: stream.category,
          playbackUrl: stream.playbackUrl,
          thumbnailUrl: stream.thumbnailUrl,
          startedAt: stream.startedAt,
          endedAt: stream.endedAt,
          duration: stream.duration,
          viewerCount: stream.viewerCount,
          peakViewerCount: stream.peakViewerCount,
          totalViews: stream.totalViews,
          likes: stream.likes,
          comments: stream.comments,
          isPrivate: stream.isPrivate,
          tags: stream.tags,
          location: stream.location,
          settings: stream.settings,
          createdAt: stream.createdAt,
          updatedAt: stream.updatedAt
        })),
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: total,
          itemsPerPage: limitNum,
          hasNextPage,
          hasPrevPage
        }
      }
    });

  } catch (error) {
    console.error('List live streams error:', error);
    res.status(500).json({ 
      error: 'Failed to list live streams',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
