import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import LiveStream from '../../../lib/models/LiveStream';
import { verifyToken } from '../../../lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

    await connectDB();

    const { streamId } = req.body;

    if (!streamId) {
      return res.status(400).json({ error: 'Stream ID is required' });
    }

    // Find the live stream
    const liveStream = await LiveStream.findById(streamId);
    
    if (!liveStream) {
      return res.status(404).json({ error: 'Live stream not found' });
    }

    // Check if user owns the stream
    if (liveStream.userId !== decoded.userId) {
      return res.status(403).json({ error: 'You can only end your own streams' });
    }

    // Check if stream is live
    if (liveStream.status !== 'live') {
      return res.status(400).json({ 
        error: `Cannot end stream with status: ${liveStream.status}` 
      });
    }

    // Calculate duration
    const duration = liveStream.startedAt 
      ? Math.floor((Date.now() - liveStream.startedAt.getTime()) / 1000)
      : 0;

    // Update stream status to ended
    liveStream.status = 'ended';
    liveStream.endedAt = new Date();
    liveStream.duration = duration;
    liveStream.activeViewers = [];

    await liveStream.save();

    res.status(200).json({
      success: true,
      message: 'Live stream ended successfully',
      data: {
        streamId: liveStream._id,
        status: liveStream.status,
        endedAt: liveStream.endedAt,
        duration: liveStream.duration,
        finalViewerCount: liveStream.viewerCount,
        peakViewerCount: liveStream.peakViewerCount,
        totalViews: liveStream.totalViews
      }
    });

  } catch (error) {
    console.error('End live stream error:', error);
    res.status(500).json({ 
      error: 'Failed to end live stream',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
