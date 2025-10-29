import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import connectDB from '@/lib/database';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/middleware/auth';

const REELS_DIR = path.join(process.cwd(), 'public', 'assets', 'reels');
const REELS_METADATA_DIR = path.join(REELS_DIR, 'metadata');

interface ReelMetadata {
  id: string;
  userId: string;
  username: string;
  caption: string;
  mediaType: 'video';
  mediaPath: string;
  thumbnailPath?: string;
  duration?: number;
  createdAt: string;
  likes: string[];
  comments: any[];
  isPublic: boolean;
  views: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Verify JWT token
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Fetch user details from database
    const user = await User.findById(decoded.userId).select('username fullName');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = decoded.userId;
    const username = user.username || user.fullName || 'Unknown User';
    const { reelId } = req.query;
    const { comment } = req.body;

    if (!reelId || typeof reelId !== 'string') {
      return res.status(400).json({ error: 'Reel ID is required' });
    }

    if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    // Check if reel exists
    const metadataPath = path.join(REELS_METADATA_DIR, `${reelId}.json`);
    if (!fs.existsSync(metadataPath)) {
      return res.status(404).json({ error: 'Reel not found' });
    }

    // Load reel metadata
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8')) as ReelMetadata;

    // Create new comment
    const newComment = {
      id: Date.now().toString(),
      userId,
      username,
      text: comment.trim(),
      createdAt: new Date().toISOString(),
    };

    // Add comment to reel
    metadata.comments.push(newComment);

    // Save updated metadata
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    return res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: newComment,
      commentedBy: username,
      commentedByUserId: userId,
      commentsCount: metadata.comments.length,
    });

  } catch (error) {
    console.error('Comment reel error:', error);
    return res.status(500).json({ 
      error: 'Failed to add comment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}







