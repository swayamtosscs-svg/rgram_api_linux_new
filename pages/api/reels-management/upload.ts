import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import connectDB from '@/lib/database';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/middleware/auth';

// Ensure the reels directory exists
const REELS_DIR = path.join(process.cwd(), 'public', 'assets', 'reels');
const REELS_METADATA_DIR = path.join(REELS_DIR, 'metadata');

// Create directories if they don't exist
if (!fs.existsSync(REELS_DIR)) {
  fs.mkdirSync(REELS_DIR, { recursive: true });
}
if (!fs.existsSync(REELS_METADATA_DIR)) {
  fs.mkdirSync(REELS_METADATA_DIR, { recursive: true });
}

export const config = {
  api: {
    bodyParser: false,
  },
};

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

    // Parse form data
    const form = formidable({
      uploadDir: REELS_DIR,
      keepExtensions: true,
      maxFileSize: 100 * 1024 * 1024, // 100MB limit for videos
    });

    const [fields, files] = await form.parse(req);

    const caption = Array.isArray(fields.caption) ? fields.caption[0] : fields.caption || '';
    const isPublic = Array.isArray(fields.isPublic) ? fields.isPublic[0] === 'true' : fields.isPublic === 'true';

    // Generate unique reel ID
    const reelId = uuidv4();
    const timestamp = Date.now();

    let mediaPath: string | undefined;
    let thumbnailPath: string | undefined;

    // Handle video file upload
    if (files.video && Array.isArray(files.video) && files.video.length > 0) {
      const file = files.video[0];
      const fileExtension = path.extname(file.originalFilename || '');
      const fileName = `${reelId}_${timestamp}${fileExtension}`;
      const newPath = path.join(REELS_DIR, fileName);

      // Move file to final location
      fs.renameSync(file.filepath, newPath);
      mediaPath = `/assets/reels/${fileName}`;

      // Generate thumbnail filename
      const thumbnailFileName = `${reelId}_${timestamp}_thumb.jpg`;
      thumbnailPath = `/assets/reels/${thumbnailFileName}`;
    } else {
      return res.status(400).json({ error: 'Video file is required for reels' });
    }

    // Create reel metadata
    const reelMetadata: ReelMetadata = {
      id: reelId,
      userId,
      username,
      caption,
      mediaType: 'video',
      mediaPath,
      thumbnailPath,
      duration: 0, // This would be calculated from video metadata
      createdAt: new Date().toISOString(),
      likes: [],
      comments: [],
      isPublic,
      views: 0,
    };

    // Save metadata to file
    const metadataPath = path.join(REELS_METADATA_DIR, `${reelId}.json`);
    fs.writeFileSync(metadataPath, JSON.stringify(reelMetadata, null, 2));

    // Update reels index
    const indexPath = path.join(REELS_DIR, 'index.json');
    let reelsIndex: string[] = [];
    
    if (fs.existsSync(indexPath)) {
      const indexData = fs.readFileSync(indexPath, 'utf8');
      reelsIndex = JSON.parse(indexData);
    }
    
    reelsIndex.push(reelId);
    fs.writeFileSync(indexPath, JSON.stringify(reelsIndex, null, 2));

    return res.status(201).json({
      success: true,
      message: 'Reel uploaded successfully',
      reel: {
        id: reelId,
        userId,
        username,
        caption,
        mediaType: 'video',
        mediaPath,
        thumbnailPath,
        duration: reelMetadata.duration,
        createdAt: reelMetadata.createdAt,
        likesCount: 0,
        commentsCount: 0,
        viewsCount: 0,
        isPublic,
      },
    });

  } catch (error) {
    console.error('Reel upload error:', error);
    return res.status(500).json({ 
      error: 'Failed to upload reel',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
