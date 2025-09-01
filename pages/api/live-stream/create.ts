import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import LiveStream from '../../../lib/models/LiveStream';
import User from '../../../lib/models/User';
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

    const { title, description, category, isPrivate, allowedViewers, settings } = req.body;

    // Validate required fields
    if (!title || !category) {
      return res.status(400).json({ error: 'Title and category are required' });
    }

    // Check if user already has an active stream
    const existingStream = await LiveStream.findOne({
      userId: decoded.userId,
      status: { $in: ['pending', 'live'] }
    });

    if (existingStream) {
      return res.status(400).json({ 
        error: 'You already have an active stream',
        existingStreamId: existingStream._id
      });
    }

    // Generate unique stream key
    const streamKey = `stream_${decoded.userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Generate stream URLs (these would typically come from your streaming service)
    const streamUrl = `rtmp://your-streaming-server/live/${streamKey}`;
    const playbackUrl = `https://your-streaming-server/live/${streamKey}/index.m3u8`;

    // Get user information from database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create new live stream
    const liveStream = new LiveStream({
      userId: decoded.userId,
      username: user.username || user.email || 'Anonymous',
      title,
      description,
      category,
      streamKey,
      streamUrl,
      playbackUrl,
      isPrivate: isPrivate || false,
      allowedViewers: isPrivate ? allowedViewers || [] : [],
      settings: {
        quality: settings?.quality || '720p',
        enableChat: settings?.enableChat !== false,
        enableLikes: settings?.enableLikes !== false,
        enableComments: settings?.enableComments !== false,
        enableScreenShare: settings?.enableScreenShare || false,
        maxViewers: settings?.maxViewers,
        isArchived: settings?.isArchived !== false,
        moderationEnabled: settings?.moderationEnabled !== false,
        language: settings?.language || 'hindi',
        deityName: settings?.deityName,
        templeInfo: settings?.templeInfo
      }
    });

    await liveStream.save();

    res.status(201).json({
      success: true,
      message: 'Live stream created successfully',
      data: {
        streamId: liveStream._id,
        streamKey,
        streamUrl,
        playbackUrl,
        status: liveStream.status
      }
    });

  } catch (error) {
    console.error('Create live stream error:', error);
    res.status(500).json({ 
      error: 'Failed to create live stream',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
