import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import Post from '../../../lib/models/Post';
import User from '../../../lib/models/User';
import { verifyToken } from '../../../lib/middleware/auth';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await connectDB();
    
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const { content, images, videos, type = 'post', title, description, category, religion } = req.body;

    // Validate content
    if (!content && (!images || images.length === 0) && (!videos || videos.length === 0)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Post must contain content, images, or videos' 
      });
    }

    // Validate content length
    if (content && content.length > 2000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Content must be less than 2000 characters' 
      });
    }

    // Process images if provided
    let processedImages: string[] = [];
    if (images && Array.isArray(images)) {
      for (const image of images) {
        if (typeof image === 'string' && image.startsWith('data:')) {
          // Upload base64 image to Cloudinary
          try {
            const result = await cloudinary.uploader.upload(image, {
              folder: 'rgram/posts/images',
              resource_type: 'image',
              transformation: [
                { width: 1080, height: 1080, crop: 'limit' },
                { quality: 'auto' }
              ]
            });
            processedImages.push(result.secure_url);
          } catch (uploadError: any) {
            console.error('Image upload error:', uploadError);
            return res.status(400).json({ 
              success: false, 
              message: 'Failed to upload image' 
            });
          }
        } else if (typeof image === 'string') {
          // Assume it's already a URL
          processedImages.push(image);
        }
      }
    }

    // Process videos if provided
    let processedVideos: string[] = [];
    if (videos && Array.isArray(videos)) {
      for (const video of videos) {
        if (typeof video === 'string' && video.startsWith('data:')) {
          // Upload base64 video to Cloudinary
          try {
            const result = await cloudinary.uploader.upload(video, {
              folder: 'rgram/posts/videos',
              resource_type: 'video',
              transformation: [
                { width: 1080, height: 1080, crop: 'limit' },
                { quality: 'auto' }
              ]
            });
            processedVideos.push(result.secure_url);
          } catch (uploadError: any) {
            console.error('Video upload error:', uploadError);
            return res.status(400).json({ 
              success: false, 
              message: 'Failed to upload video' 
            });
          }
        } else if (typeof video === 'string') {
          // Assume it's already a URL
          processedVideos.push(video);
        }
      }
    }

    // Create post
    const post = await Post.create({
      author: decoded.userId,
      content: content || '',
      images: processedImages,
      videos: processedVideos,
      type,
      title,
      description,
      category: category || 'general',
      religion: religion || '',
      likes: [],
      likesCount: 0,
      comments: [],
      commentsCount: 0,
      shares: [],
      sharesCount: 0,
      saves: [],
      savesCount: 0,
      isActive: true
    });

    // Update user's post count
    await User.findByIdAndUpdate(decoded.userId, { $inc: { postsCount: 1 } });

    // Populate author details
    await post.populate('author', 'username fullName avatar');

    return res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: { post }
    });

  } catch (error: any) {
    console.error('Create post error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
}
