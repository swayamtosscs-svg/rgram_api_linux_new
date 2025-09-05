import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import Post from '../../../lib/models/Post';
import User from '../../../lib/models/User';
import { verifyToken } from '../../../lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    await connectDB();

    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    const authorId = decoded.userId;

    // Verify user exists
    const user = await User.findById(authorId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const {
      content,
      type = 'post',
      title,
      description,
      category = 'general',
      images = [],
      videos = [],
      audio = [],
      documents = [],
      isPrivate = false,
      allowComments = true,
      allowLikes = true,
      tags = [],
      location,
      mood,
      religion
    } = req.body;

    // Validate required fields
    if (!content && images.length === 0 && videos.length === 0 && audio.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Content, images, videos, or audio is required'
      });
    }

    // Validate post type
    const validTypes = ['post', 'video', 'message', 'story', 'reel'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post type. Must be one of: post, video, message, story, reel'
      });
    }

    // Validate media arrays
    if (!Array.isArray(images) || !Array.isArray(videos) || !Array.isArray(audio) || !Array.isArray(documents)) {
      return res.status(400).json({
        success: false,
        message: 'Media fields must be arrays'
      });
    }

    // Create the post
    const postData: any = {
      author: authorId,
      content: content || '',
      type,
      category,
      images,
      videos,
      audio,
      documents,
      isPrivate,
      allowComments,
      allowLikes,
      tags,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add optional fields if provided
    if (title) postData.title = title;
    if (description) postData.description = description;
    if (location) postData.location = location;
    if (mood) postData.mood = mood;
    if (religion) postData.religion = religion;

    // Set default values based on type
    if (type === 'video' && videos.length > 0) {
      postData.isVideo = true;
      postData.videoCount = videos.length;
    }

    if (type === 'message') {
      postData.isMessage = true;
      postData.messageType = 'text';
      if (audio.length > 0) postData.messageType = 'voice';
      if (images.length > 0) postData.messageType = 'media';
    }

    if (type === 'story') {
      postData.isStory = true;
      postData.storyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    }

    if (type === 'reel') {
      postData.isReel = true;
      postData.reelDuration = req.body.reelDuration || 60; // Default 60 seconds
    }

    const post = await Post.create(postData);

    // Populate author information
    await post.populate('author', 'username fullName avatar isPrivate religion');

    // Update user's post count
    await User.findByIdAndUpdate(authorId, {
      $inc: { postCount: 1 }
    });

    res.status(201).json({
      success: true,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} created successfully`,
      data: {
        post,
        author: {
          userId: user._id,
          username: user.username,
          fullName: user.fullName,
          avatar: user.avatar,
          isPrivate: user.isPrivate,
          religion: user.religion
        },
        privacy: {
          isPrivate,
          visibility: isPrivate ? 'followers_only' : 'public',
          allowComments,
          allowLikes
        },
        media: {
          images: images.length,
          videos: videos.length,
          audio: audio.length,
          documents: documents.length
        }
      }
    });

  } catch (error: any) {
    console.error('Create enhanced post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}


