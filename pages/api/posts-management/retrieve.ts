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

    const { postId, userId, limit = '10', offset = '0' } = req.query;

    // If specific post ID is requested
    if (postId) {
      const metadataPath = path.join(POSTS_METADATA_DIR, `${postId}.json`);
      
      if (!fs.existsSync(metadataPath)) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8')) as PostMetadata;
      
      return res.status(200).json({
        success: true,
        post: {
          id: metadata.id,
          userId: metadata.userId,
          username: metadata.username,
          caption: metadata.caption,
          mediaType: metadata.mediaType,
          mediaPath: metadata.mediaPath,
          createdAt: metadata.createdAt,
          likesCount: metadata.likes.length,
          commentsCount: metadata.comments.length,
          isPublic: metadata.isPublic,
          isLikedByUser: false, // This would need user context to determine
        },
      });
    }

    // Get posts index
    const indexPath = path.join(POSTS_DIR, 'index.json');
    if (!fs.existsSync(indexPath)) {
      return res.status(200).json({
        success: true,
        posts: [],
        total: 0,
      });
    }

    const postsIndex = JSON.parse(fs.readFileSync(indexPath, 'utf8')) as string[];
    
    // Filter posts by user if userId is provided
    let filteredPosts = postsIndex;
    if (userId) {
      const userPosts: string[] = [];
      for (const postId of postsIndex) {
        const metadataPath = path.join(POSTS_METADATA_DIR, `${postId}.json`);
        if (fs.existsSync(metadataPath)) {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8')) as PostMetadata;
          if (metadata.userId === userId) {
            userPosts.push(postId);
          }
        }
      }
      filteredPosts = userPosts;
    }

    // Apply pagination
    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);
    const paginatedPosts = filteredPosts.slice(offsetNum, offsetNum + limitNum);

    // Load post metadata
    const posts = [];
    for (const postId of paginatedPosts) {
      const metadataPath = path.join(POSTS_METADATA_DIR, `${postId}.json`);
      if (fs.existsSync(metadataPath)) {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8')) as PostMetadata;
        
        // Only include public posts or user's own posts
        if (metadata.isPublic || (userId && metadata.userId === userId)) {
          posts.push({
            id: metadata.id,
            userId: metadata.userId,
            username: metadata.username,
            caption: metadata.caption,
            mediaType: metadata.mediaType,
            mediaPath: metadata.mediaPath,
            createdAt: metadata.createdAt,
            likesCount: metadata.likes.length,
            commentsCount: metadata.comments.length,
            isPublic: metadata.isPublic,
            isLikedByUser: false, // This would need user context to determine
          });
        }
      }
    }

    // Sort by creation date (newest first)
    posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.status(200).json({
      success: true,
      posts,
      total: filteredPosts.length,
      limit: limitNum,
      offset: offsetNum,
    });

  } catch (error) {
    console.error('Retrieve error:', error);
    return res.status(500).json({ 
      error: 'Failed to retrieve posts',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
