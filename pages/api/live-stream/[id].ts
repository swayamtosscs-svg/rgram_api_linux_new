import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import LiveStream from '../../../lib/models/LiveStream';
import { verifyToken } from '../../../lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;
  const { id } = query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Valid stream ID is required' });
  }

  try {
    await connectDB();

    switch (method) {
      case 'GET':
        return await getLiveStream(req, res, id);
      case 'PUT':
        return await updateLiveStream(req, res, id);
      case 'DELETE':
        return await deleteLiveStream(req, res, id);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Live stream operation error:', error);
    res.status(500).json({ 
      error: 'Failed to perform live stream operation',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function getLiveStream(req: NextApiRequest, res: NextApiResponse, streamId: string) {
  try {
    // Check if user is authenticated (optional for public streams)
    let userId = null;
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      try {
        const decoded = await verifyToken(token);
        userId = decoded?.userId;
      } catch (error) {
        // Token is invalid, but we can still show public streams
        console.log('Invalid token, showing public stream');
      }
    }

    // Find the live stream
    const liveStream = await LiveStream.findById(streamId);
    
    if (!liveStream) {
      return res.status(404).json({ error: 'Live stream not found' });
    }

    // Check if stream is private and user has access
    if (liveStream.isPrivate && userId && !liveStream.allowedViewers?.includes(userId)) {
      return res.status(403).json({ error: 'Access denied to private stream' });
    }

    // Increment total views if user is authenticated and stream is live
    if (userId && liveStream.status === 'live') {
      // Check if user is already in active viewers
      if (!liveStream.activeViewers?.includes(userId)) {
        liveStream.activeViewers = liveStream.activeViewers || [];
        liveStream.activeViewers.push(userId);
        liveStream.viewerCount = liveStream.activeViewers.length;
        
        if (liveStream.viewerCount > liveStream.peakViewerCount) {
          liveStream.peakViewerCount = liveStream.viewerCount;
        }
        
        liveStream.totalViews += 1;
        await liveStream.save();
      }
    }

    res.status(200).json({
      success: true,
      data: {
        streamId: liveStream._id,
        userId: liveStream.userId,
        username: liveStream.username,
        title: liveStream.title,
        description: liveStream.description,
        status: liveStream.status,
        category: liveStream.category,
        streamUrl: liveStream.streamUrl,
        playbackUrl: liveStream.playbackUrl,
        thumbnailUrl: liveStream.thumbnailUrl,
        startedAt: liveStream.startedAt,
        endedAt: liveStream.endedAt,
        duration: liveStream.duration,
        viewerCount: liveStream.viewerCount,
        peakViewerCount: liveStream.peakViewerCount,
        totalViews: liveStream.totalViews,
        likes: liveStream.likes,
        comments: liveStream.comments,
        isPrivate: liveStream.isPrivate,
        allowedViewers: liveStream.allowedViewers,
        tags: liveStream.tags,
        location: liveStream.location,
        settings: liveStream.settings,
        createdAt: liveStream.createdAt,
        updatedAt: liveStream.updatedAt
      }
    });

  } catch (error) {
    console.error('Get live stream error:', error);
    res.status(500).json({ 
      error: 'Failed to get live stream',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function updateLiveStream(req: NextApiRequest, res: NextApiResponse, streamId: string) {
  try {
    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authentication token required' });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const { title, description, category, isPrivate, allowedViewers, settings } = req.body;

    // Find the live stream
    const liveStream = await LiveStream.findById(streamId);
    
    if (!liveStream) {
      return res.status(404).json({ error: 'Live stream not found' });
    }

    // Check if user owns the stream
    if (liveStream.userId !== decoded.userId) {
      return res.status(403).json({ error: 'You can only update your own streams' });
    }

    // Only allow updates for pending streams
    if (liveStream.status !== 'pending') {
      return res.status(400).json({ 
        error: 'Cannot update stream that is already live or ended' 
      });
    }

    // Update fields
    if (title) liveStream.title = title;
    if (description !== undefined) liveStream.description = description;
    if (category) liveStream.category = category;
    if (isPrivate !== undefined) liveStream.isPrivate = isPrivate;
    if (allowedViewers !== undefined) liveStream.allowedViewers = allowedViewers;
    if (settings) {
      liveStream.settings = { ...liveStream.settings, ...settings };
    }

    await liveStream.save();

    res.status(200).json({
      success: true,
      message: 'Live stream updated successfully',
      data: {
        streamId: liveStream._id,
        title: liveStream.title,
        description: liveStream.description,
        category: liveStream.category,
        isPrivate: liveStream.isPrivate,
        settings: liveStream.settings
      }
    });

  } catch (error) {
    console.error('Update live stream error:', error);
    res.status(500).json({ 
      error: 'Failed to update live stream',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function deleteLiveStream(req: NextApiRequest, res: NextApiResponse, streamId: string) {
  try {
    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authentication token required' });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Find the live stream
    const liveStream = await LiveStream.findById(streamId);
    
    if (!liveStream) {
      return res.status(404).json({ error: 'Live stream not found' });
    }

    // Check if user owns the stream
    if (liveStream.userId !== decoded.userId) {
      return res.status(403).json({ error: 'You can only delete your own streams' });
    }

    // Only allow deletion for pending streams
    if (liveStream.status !== 'pending') {
      return res.status(400).json({ 
        error: 'Cannot delete stream that is already live or ended' 
      });
    }

    await LiveStream.findByIdAndDelete(streamId);

    res.status(200).json({
      success: true,
      message: 'Live stream deleted successfully'
    });

  } catch (error) {
    console.error('Delete live stream error:', error);
    res.status(500).json({ 
      error: 'Failed to delete live stream',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
