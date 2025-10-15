import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import connectDB from '@/lib/database';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/middleware/auth';

const POSTS_DIR = path.join(process.cwd(), 'public', 'assets', 'posts');
const POSTS_METADATA_DIR = path.join(POSTS_DIR, 'metadata');

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
    const { postId } = req.query;
    const { comment } = req.body;

    if (!postId || typeof postId !== 'string') {
      return res.status(400).json({ error: 'Post ID is required' });
    }

    if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    // Check if post exists
    const metadataPath = path.join(POSTS_METADATA_DIR, `${postId}.json`);
    if (!fs.existsSync(metadataPath)) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Load post metadata
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8')) as PostMetadata;

    // Create new comment
    const newComment = {
      id: Date.now().toString(),
      userId,
      username,
      text: comment.trim(),
      createdAt: new Date().toISOString(),
    };

    // Add comment to post
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
    console.error('Comment error:', error);
    return res.status(500).json({ 
      error: 'Failed to add comment',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
