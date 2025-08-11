import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import Post from '../../../lib/models/Post';
import User from '../../../lib/models/User';
import { verifyToken } from '../../../lib/middleware/auth';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: { sizeLimit: '100mb' }, // Increased limit for video files
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await connectDB();
    
    // Authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const { content, video, externalUrl, thumbnail, title, description, duration, category = 'general', religion = '' } = req.body;
    
    // Validate required fields: either base64 video or an external URL
    if (!video && !externalUrl) {
      return res.status(400).json({ success: false, message: 'Provide either base64 video data or externalUrl' });
    }

    let videoUrl: string | null = null;
    let provider: 'local' | 'youtube' | 'vimeo' | 'external' = 'local';
    let videoExtension: string | undefined;

    if (externalUrl) {
      // Basic provider detection
      const urlLower = externalUrl.toLowerCase();
      if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
        provider = 'youtube';
      } else if (urlLower.includes('vimeo.com')) {
        provider = 'vimeo';
      } else {
        provider = 'external';
      }
      videoUrl = externalUrl;
    }

    // If base64 video provided, store locally
    const uploadDir = path.join(process.cwd(), 'apirgram', 'public', 'uploads', 'videos');
    const thumbnailDir = path.join(process.cwd(), 'apirgram', 'public', 'uploads', 'thumbnails');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    if (!fs.existsSync(thumbnailDir)) fs.mkdirSync(thumbnailDir, { recursive: true });

    // Generate unique filenames
    const timestamp = Date.now();
    const videoFileName = video && !externalUrl
      ? `video_${timestamp}_${Math.random().toString(36).substring(7)}.${videoExtension}`
      : undefined;
    const thumbnailFileName = thumbnail ? `thumb_${timestamp}_${Math.random().toString(36).substring(7)}.jpg` : null;

    // Save video file if local
    if (video && !externalUrl) {
      // Validate video format
      const videoFormats = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
      videoExtension = (video.split(';')[0].split('/')[1] || '').toLowerCase();
      if (!videoFormats.includes(videoExtension)) {
        return res.status(400).json({
          success: false,
          message: `Invalid video format. Supported formats: ${videoFormats.join(', ')}`
        });
      }
      const videoPath = path.join(uploadDir, videoFileName!);
      const videoBuffer = Buffer.from(video.split(',')[1], 'base64');
      fs.writeFileSync(videoPath, videoBuffer);
      videoUrl = `/uploads/videos/${videoFileName}`;
      provider = 'local';
    }

    // Save thumbnail if provided
    let thumbnailUrl: string | null = null;
    if (thumbnail) {
      const thumbnailPath = path.join(thumbnailDir, thumbnailFileName!);
      const thumbnailBuffer = Buffer.from(thumbnail.split(',')[1], 'base64');
      fs.writeFileSync(thumbnailPath, thumbnailBuffer);
      thumbnailUrl = `/uploads/thumbnails/${thumbnailFileName}`;
    }

    // Create video post
    const videoPost = await (Post as any).create({
      author: decoded.userId,
      content: content?.trim() || '',
      images: thumbnailUrl ? [thumbnailUrl] : [],
      videos: videoUrl ? [videoUrl] : [],
      externalUrls: externalUrl ? [externalUrl] : [],
      type: 'video',
      provider,
      title: title?.trim(),
      description: description?.trim(),
      duration: duration || 0,
      category: category,
      religion: religion?.trim(),
      isActive: true,
      createdAt: new Date()
    });

    // Update user's video count
    await (User as any).findByIdAndUpdate(decoded.userId, { $inc: { videosCount: 1 } });
    
    // Populate author information
    await videoPost.populate('author', 'username fullName avatar');

    res.status(201).json({
      success: true,
      message: 'Video uploaded successfully',
      data: {
        post: videoPost,
        videoUrl,
        thumbnailUrl
      }
    });

  } catch (error: any) {
    console.error('Upload video error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
