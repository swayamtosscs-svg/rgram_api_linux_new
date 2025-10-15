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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Verify JWT token for authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { reelId, userId, limit = '10', offset = '0' } = req.query;

    // If specific reel ID is requested
    if (reelId) {
      const metadataPath = path.join(REELS_METADATA_DIR, `${reelId}.json`);
      
      if (!fs.existsSync(metadataPath)) {
        return res.status(404).json({ error: 'Reel not found' });
      }

      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8')) as ReelMetadata;
      
      // Increment view count
      metadata.views += 1;
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
      
      return res.status(200).json({
        success: true,
        reel: {
          id: metadata.id,
          userId: metadata.userId,
          username: metadata.username,
          caption: metadata.caption,
          mediaType: metadata.mediaType,
          mediaPath: metadata.mediaPath,
          thumbnailPath: metadata.thumbnailPath,
          duration: metadata.duration,
          createdAt: metadata.createdAt,
          likesCount: metadata.likes.length,
          commentsCount: metadata.comments.length,
          viewsCount: metadata.views,
          isPublic: metadata.isPublic,
          isLikedByUser: metadata.likes.includes(decoded.userId),
        },
      });
    }

    // Get reels index
    const indexPath = path.join(REELS_DIR, 'index.json');
    if (!fs.existsSync(indexPath)) {
      return res.status(200).json({
        success: true,
        reels: [],
        total: 0,
      });
    }

    const reelsIndex = JSON.parse(fs.readFileSync(indexPath, 'utf8')) as string[];
    
    // Filter reels by user if userId is provided
    let filteredReels = reelsIndex;
    if (userId) {
      const userReels: string[] = [];
      for (const reelId of reelsIndex) {
        const metadataPath = path.join(REELS_METADATA_DIR, `${reelId}.json`);
        if (fs.existsSync(metadataPath)) {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8')) as ReelMetadata;
          if (metadata.userId === userId) {
            userReels.push(reelId);
          }
        }
      }
      filteredReels = userReels;
    }

    // Apply pagination
    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);
    const paginatedReels = filteredReels.slice(offsetNum, offsetNum + limitNum);

    // Load reel metadata
    const reels = [];
    for (const reelId of paginatedReels) {
      const metadataPath = path.join(REELS_METADATA_DIR, `${reelId}.json`);
      if (fs.existsSync(metadataPath)) {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8')) as ReelMetadata;
        
        // Only include public reels or user's own reels
        if (metadata.isPublic || (userId && metadata.userId === userId)) {
          reels.push({
            id: metadata.id,
            userId: metadata.userId,
            username: metadata.username,
            caption: metadata.caption,
            mediaType: metadata.mediaType,
            mediaPath: metadata.mediaPath,
            thumbnailPath: metadata.thumbnailPath,
            duration: metadata.duration,
            createdAt: metadata.createdAt,
            likesCount: metadata.likes.length,
            commentsCount: metadata.comments.length,
            viewsCount: metadata.views,
            isPublic: metadata.isPublic,
            isLikedByUser: metadata.likes.includes(decoded.userId),
          });
        }
      }
    }

    // Sort by creation date (newest first)
    reels.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.status(200).json({
      success: true,
      reels,
      total: filteredReels.length,
      limit: limitNum,
      offset: offsetNum,
    });

  } catch (error) {
    console.error('Retrieve reels error:', error);
    return res.status(500).json({ 
      error: 'Failed to retrieve reels',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
