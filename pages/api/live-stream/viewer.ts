import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import LiveStream from '../../../lib/models/LiveStream';
import { verifyToken } from '../../../lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    await connectDB();

    switch (method) {
      case 'POST':
        return await trackViewer(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Viewer tracking error:', error);
    res.status(500).json({ 
      error: 'Failed to track viewer',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function trackViewer(req: NextApiRequest, res: NextApiResponse) {
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

    const { streamId, action, cameraData } = req.body;

    if (!streamId || !action) {
      return res.status(400).json({ error: 'Stream ID and action are required' });
    }

    if (!['join', 'leave'].includes(action)) {
      return res.status(400).json({ error: 'Action must be either "join" or "leave"' });
    }

    // Find the live stream
    const liveStream = await LiveStream.findById(streamId);
    if (!liveStream) {
      return res.status(404).json({ error: 'Live stream not found' });
    }

    // Check if stream is live
    if (liveStream.status !== 'live') {
      return res.status(400).json({ error: 'Cannot track viewers on inactive stream' });
    }

    const userId = decoded.userId;

    if (action === 'join') {
      // Add viewer to active viewers if not already present
      if (!liveStream.activeViewers?.includes(userId)) {
        liveStream.activeViewers = liveStream.activeViewers || [];
        liveStream.activeViewers.push(userId);
        
        // Add to viewer history with camera data
        liveStream.viewerHistory = liveStream.viewerHistory || [];
        liveStream.viewerHistory.push({
          viewerId: userId,
          joinedAt: new Date(),
          cameraAccess: cameraData?.hasCamera || false,
          deviceInfo: cameraData?.deviceInfo || null
        });
        
        // Increment total views
        liveStream.totalViews = (liveStream.totalViews || 0) + 1;
      }
    } else if (action === 'leave') {
      // Remove viewer from active viewers
      if (liveStream.activeViewers?.includes(userId)) {
        liveStream.activeViewers = liveStream.activeViewers.filter((id: string) => id !== userId);
        
        // Update viewer history with leave time and duration
        const viewerRecord = liveStream.viewerHistory?.find(
          (record: any) => record.viewerId === userId && !record.leftAt
        );
        
        if (viewerRecord) {
          viewerRecord.leftAt = new Date();
          if (viewerRecord.joinedAt) {
            viewerRecord.watchDuration = Math.floor(
              (viewerRecord.leftAt.getTime() - viewerRecord.joinedAt.getTime()) / 1000
            );
          }
        }
      }
    }

    // Update viewer count
    liveStream.viewerCount = liveStream.activeViewers?.length || 0;
    
    // Update peak viewer count
    if (liveStream.viewerCount > liveStream.peakViewerCount) {
      liveStream.peakViewerCount = liveStream.viewerCount;
    }

    await liveStream.save();

    res.status(200).json({
      success: true,
      message: `Viewer ${action}ed successfully`,
      data: {
        streamId: liveStream._id,
        viewerCount: liveStream.viewerCount,
        peakViewerCount: liveStream.peakViewerCount,
        totalViews: liveStream.totalViews,
        action,
        userId,
        cameraAccess: cameraData?.hasCamera || false
      }
    });

  } catch (error) {
    console.error('Track viewer error:', error);
    res.status(500).json({ 
      error: 'Failed to track viewer',
      details: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
}
