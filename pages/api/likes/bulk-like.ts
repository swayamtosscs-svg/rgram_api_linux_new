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
import { Model, Document } from 'mongoose';

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

    const { contentType, contentIds } = req.body;

    // Validation
    if (!contentType || !contentIds || !Array.isArray(contentIds)) {
      return res.status(400).json({
        success: false,
        message: 'Content type and content IDs array are required'
      });
    }

    if (!['post', 'video', 'reel', 'story', 'userAsset'].includes(contentType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid content type. Must be: post, video, reel, story, or userAsset'
      });
    }

    if (contentIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Content IDs array cannot be empty'
      });
    }

    if (contentIds.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 50 content IDs allowed per request'
      });
    }

    // Get the appropriate model
    let ContentModel: Model<any>;
    switch (contentType) {
      case 'post':
        ContentModel = Post;
        break;
      case 'video':
      case 'reel':
        ContentModel = BabaVideo;
        break;
      case 'story':
        ContentModel = BabaStory;
        break;
      case 'userAsset':
        ContentModel = UserAssets;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid content type'
        });
    }

    // Check which content exists
    const existingContent = await ContentModel.find({
      _id: { $in: contentIds }
    }).select('_id likesCount');

    const existingContentIds = existingContent.map(content => content._id.toString());
    const nonExistentIds = contentIds.filter(id => !existingContentIds.includes(id));

    if (nonExistentIds.length > 0) {
      return res.status(404).json({
        success: false,
        message: 'Some content not found',
        data: {
          nonExistentIds,
          existingContentIds
        }
      });
    }

    // Check existing likes for these content items
    const existingLikes = await Like.find({
      userId: user._id,
      contentType,
      contentId: { $in: contentIds }
    });

    const alreadyLikedIds = existingLikes.map(like => like.contentId.toString());
    const newLikeIds = contentIds.filter(id => !alreadyLikedIds.includes(id));

    if (newLikeIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'You have already liked all the specified content'
      });
    }

    // Create new likes
    const newLikes = newLikeIds.map(contentId => ({
      userId: user._id,
      contentType,
      contentId
    }));

    await Like.insertMany(newLikes);

    // Update likes count for all content
    await ContentModel.updateMany(
      { _id: { $in: newLikeIds } },
      { $inc: { likesCount: 1 } }
    );

    // Add user to likes array for posts and videos
    if (contentType === 'post' || contentType === 'video' || contentType === 'reel') {
      await ContentModel.updateMany(
        { _id: { $in: newLikeIds } },
        { $addToSet: { likes: user._id } }
      );
    }

    res.status(201).json({
      success: true,
      message: `Successfully liked ${newLikeIds.length} content items`,
      data: {
        contentType,
        totalRequested: contentIds.length,
        newlyLiked: newLikeIds.length,
        alreadyLiked: alreadyLikedIds.length,
        newlyLikedIds: newLikeIds,
        alreadyLikedIds: alreadyLikedIds
      }
    });

  } catch (error: any) {
    console.error('Bulk like error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
