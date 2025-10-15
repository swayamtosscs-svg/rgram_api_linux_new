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
  if (req.method !== 'DELETE') {
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

    if (!reelId || typeof reelId !== 'string') {
      return res.status(400).json({ error: 'Reel ID is required' });
    }

    // Check if reel exists
    const metadataPath = path.join(REELS_METADATA_DIR, `${reelId}.json`);
    if (!fs.existsSync(metadataPath)) {
      return res.status(404).json({ error: 'Reel not found' });
    }

    // Load reel metadata
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8')) as ReelMetadata;

    // Check if user owns the reel
    if (metadata.userId !== userId) {
      return res.status(403).json({ error: 'You can only delete your own reels' });
    }

    // Delete video file if it exists
    if (metadata.mediaPath) {
      const mediaFileName = path.basename(metadata.mediaPath);
      const mediaFilePath = path.join(REELS_DIR, mediaFileName);
      
      if (fs.existsSync(mediaFilePath)) {
        fs.unlinkSync(mediaFilePath);
      }
    }

    // Delete thumbnail file if it exists
    if (metadata.thumbnailPath) {
      const thumbnailFileName = path.basename(metadata.thumbnailPath);
      const thumbnailFilePath = path.join(REELS_DIR, thumbnailFileName);
      
      if (fs.existsSync(thumbnailFilePath)) {
        fs.unlinkSync(thumbnailFilePath);
      }
    }

    // Delete metadata file
    fs.unlinkSync(metadataPath);

    // Update reels index
    const indexPath = path.join(REELS_DIR, 'index.json');
    if (fs.existsSync(indexPath)) {
      const reelsIndex = JSON.parse(fs.readFileSync(indexPath, 'utf8')) as string[];
      const updatedIndex = reelsIndex.filter(id => id !== reelId);
      fs.writeFileSync(indexPath, JSON.stringify(updatedIndex, null, 2));
    }

    return res.status(200).json({
      success: true,
      message: 'Reel deleted successfully',
      deletedReelId: reelId,
      deletedBy: username,
      deletedByUserId: userId,
    });

  } catch (error) {
    console.error('Delete reel error:', error);
    return res.status(500).json({ 
      error: 'Failed to delete reel',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
