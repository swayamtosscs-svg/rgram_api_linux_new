import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import User from '../../../lib/models/User';
import Like from '../../../lib/models/Like';
import Post from '../../../lib/models/Post';
import BabaPost from '../../../lib/models/BabaPost';
import BabaVideo from '../../../lib/models/BabaVideo';
import BabaStory from '../../../lib/models/BabaStory';
import UserAssets from '../../../lib/models/UserAssets';
import { verifyToken } from '../../../lib/middleware/auth';
import { Model } from 'mongoose';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      message: 'Method not allowed' 
    });
  }

  try {
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

    await connectDB();

    // Get user info
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const { contentType, contentId } = req.body;

    // Validation
    if (!contentType || !contentId) {
      return res.status(400).json({
        success: false,
        message: 'Content type and content ID are required'
      });
    }

    if (!['post', 'video', 'reel', 'story', 'userAsset'].includes(contentType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid content type. Must be: post, video, reel, story, or userAsset'
      });
    }

    // Check if content exists and get the appropriate model
    let ContentModel: Model<any>;
    let content;

    switch (contentType) {
      case 'post':
        ContentModel = Post;
        content = await ContentModel.findById(contentId);
        break;
      case 'video':
      case 'reel':
        ContentModel = BabaVideo;
        content = await ContentModel.findById(contentId);
        break;
      case 'story':
        ContentModel = BabaStory;
        content = await ContentModel.findById(contentId);
        break;
      case 'userAsset':
        ContentModel = UserAssets;
        content = await ContentModel.findById(contentId);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid content type'
        });
    }

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Check if user already liked this content
    const existingLike = await Like.findOne({
      userId: user._id,
      contentType,
      contentId
    });

    if (existingLike) {
      return res.status(400).json({
        success: false,
        message: 'You have already liked this content'
      });
    }

    // Create new like
    const newLike = new Like({
      userId: user._id,
      contentType,
      contentId
    });

    await newLike.save();

    // Update likes count in the content document
    await ContentModel.findByIdAndUpdate(
      contentId,
      { $inc: { likesCount: 1 } }
    );

    // Add user to likes array if the model has it
    if (contentType === 'post' || contentType === 'video' || contentType === 'reel') {
      await ContentModel.findByIdAndUpdate(
        contentId,
        { $addToSet: { likes: user._id } }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Content liked successfully',
      data: {
        likeId: newLike._id,
        contentType,
        contentId,
        userId: user._id,
        likesCount: (content.likesCount || 0) + 1
      }
    });

  } catch (error: any) {
    console.error('Like error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
