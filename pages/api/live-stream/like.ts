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

    const { streamId, action } = req.body;

    if (!streamId || !action) {
      return res.status(400).json({ error: 'Stream ID and action are required' });
    }

    if (!['like', 'unlike'].includes(action)) {
      return res.status(400).json({ error: 'Action must be either "like" or "unlike"' });
    }

    // Find the live stream
    const liveStream = await LiveStream.findById(streamId);
    if (!liveStream) {
      return res.status(404).json({ error: 'Live stream not found' });
    }

    // Check if stream allows likes
    if (!liveStream.settings.enableLikes) {
      return res.status(400).json({ error: 'Likes are disabled for this stream' });
    }

    // Check if stream is active
    if (liveStream.status === 'pending' || liveStream.status === 'cancelled') {
      return res.status(400).json({ error: 'Cannot like inactive stream' });
    }

    const userId = decoded.userId;

    // Initialize likes array if it doesn't exist
    if (!liveStream.likes) {
      liveStream.likes = 0;
    }

    if (action === 'like') {
      // Increment likes
      liveStream.likes += 1;
    } else if (action === 'unlike') {
      // Decrement likes (ensure it doesn't go below 0)
      liveStream.likes = Math.max(0, liveStream.likes - 1);
    }

    await liveStream.save();

    res.status(200).json({
      success: true,
      message: `Stream ${action}d successfully`,
      data: {
        streamId: liveStream._id,
        likes: liveStream.likes,
        action,
        userId
      }
    });

  } catch (error) {
    console.error('Live stream like error:', error);
    res.status(500).json({ 
      error: 'Failed to process like action',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
