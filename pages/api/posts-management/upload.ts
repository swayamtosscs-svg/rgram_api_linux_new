import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import connectDB from '@/lib/database';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/middleware/auth';

// Ensure the posts directory exists
const POSTS_DIR = path.join(process.cwd(), 'public', 'assets', 'posts');
const POSTS_METADATA_DIR = path.join(POSTS_DIR, 'metadata');

// Create directories if they don't exist
if (!fs.existsSync(POSTS_DIR)) {
  fs.mkdirSync(POSTS_DIR, { recursive: true });
}
if (!fs.existsSync(POSTS_METADATA_DIR)) {
  fs.mkdirSync(POSTS_METADATA_DIR, { recursive: true });
}

export const config = {
  api: {
    bodyParser: false,
  },
};

interface PostMetadata {
  id: string;
  userId: string;
  username: string;
  caption: string;
  mediaType: 'image' | 'video' | 'text';
  mediaPath?: string;
  createdAt: string;
  likes: string[];
  comments: any[];
  isPublic: boolean;
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
      uploadDir: POSTS_DIR,
      keepExtensions: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB limit
    });

    const [fields, files] = await form.parse(req);

    const caption = Array.isArray(fields.caption) ? fields.caption[0] : fields.caption || '';
    const isPublic = Array.isArray(fields.isPublic) ? fields.isPublic[0] === 'true' : fields.isPublic === 'true';

    // Generate unique post ID
    const postId = uuidv4();
    const timestamp = Date.now();

    let mediaType: 'image' | 'video' | 'text' = 'text';
    let mediaPath: string | undefined;

    // Handle file upload if present
    if (files.media && Array.isArray(files.media) && files.media.length > 0) {
      const file = files.media[0];
      const fileExtension = path.extname(file.originalFilename || '');
      const fileName = `${postId}_${timestamp}${fileExtension}`;
      const newPath = path.join(POSTS_DIR, fileName);

      // Move file to final location
      fs.renameSync(file.filepath, newPath);
      mediaPath = `/assets/posts/${fileName}`;

      // Determine media type
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'];

      if (imageExtensions.includes(fileExtension.toLowerCase())) {
        mediaType = 'image';
      } else if (videoExtensions.includes(fileExtension.toLowerCase())) {
        mediaType = 'video';
      }
    }

    // Create post metadata
    const postMetadata: PostMetadata = {
      id: postId,
      userId,
      username,
      caption,
      mediaType,
      mediaPath,
      createdAt: new Date().toISOString(),
      likes: [],
      comments: [],
      isPublic,
    };

    // Save metadata to file
    const metadataPath = path.join(POSTS_METADATA_DIR, `${postId}.json`);
    fs.writeFileSync(metadataPath, JSON.stringify(postMetadata, null, 2));

    // Update posts index
    const indexPath = path.join(POSTS_DIR, 'index.json');
    let postsIndex: string[] = [];
    
    if (fs.existsSync(indexPath)) {
      const indexData = fs.readFileSync(indexPath, 'utf8');
      postsIndex = JSON.parse(indexData);
    }
    
    postsIndex.push(postId);
    fs.writeFileSync(indexPath, JSON.stringify(postsIndex, null, 2));

    return res.status(201).json({
      success: true,
      message: 'Post uploaded successfully',
      post: {
        id: postId,
        userId,
        username,
        caption,
        mediaType,
        mediaPath,
        createdAt: postMetadata.createdAt,
        likesCount: 0,
        commentsCount: 0,
        isPublic,
      },
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      error: 'Failed to upload post',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
