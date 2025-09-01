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
      return res.status(403).json({ error: 'You can only start your own streams' });
    }

    // Check if stream is in correct status
    if (liveStream.status !== 'pending') {
      return res.status(400).json({ 
        error: `Cannot start stream with status: ${liveStream.status}` 
      });
    }

    // Update stream status to live
    liveStream.status = 'live';
    liveStream.startedAt = new Date();
    liveStream.viewerCount = 0;
    liveStream.peakViewerCount = 0;
    liveStream.activeViewers = [];

    await liveStream.save();

    res.status(200).json({
      success: true,
      message: 'Live stream started successfully',
      data: {
        streamId: liveStream._id,
        status: liveStream.status,
        startedAt: liveStream.startedAt,
        streamUrl: liveStream.streamUrl,
        playbackUrl: liveStream.playbackUrl
      }
    });

  } catch (error) {
    console.error('Start live stream error:', error);
    res.status(500).json({ 
      error: 'Failed to start live stream',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
