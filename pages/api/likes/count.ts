import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import Like from '@/lib/models/Like';
import Post from '@/lib/models/Post';
import BabaPost from '@/lib/models/BabaPost';
import BabaVideo from '@/lib/models/BabaVideo';
import BabaStory from '@/lib/models/BabaStory';
import UserAssets from '@/lib/models/UserAssets';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false,
      message: 'Method not allowed' 
    });
  }

  try {
    await connectDB();

    const { contentType, contentId } = req.query;

    // Validation
    if (!contentType || !contentId) {
      return res.status(400).json({
        success: false,
        message: 'Content type and content ID are required'
      });
    }

    if (!['post', 'video', 'reel', 'story', 'userAsset'].includes(contentType as string)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid content type. Must be: post, video, reel, story, or userAsset'
      });
    }

    // Check if content exists and get the appropriate model
    let ContentModel;
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

    // Get actual like count from Like collection
    const actualLikesCount = await Like.countDocuments({
      contentType,
      contentId
    });

    // Get recent likes (last 10)
    const recentLikes = await Like.find({
      contentType,
      contentId
    })
    .populate('userId', 'username fullName avatar')
    .sort({ createdAt: -1 })
    .limit(10)
    .select('userId createdAt');

    res.status(200).json({
      success: true,
      data: {
        contentType,
        contentId,
        likesCount: actualLikesCount,
        recentLikes: recentLikes.map(like => ({
          userId: like.userId,
          createdAt: like.createdAt
        })),
        contentLikesCount: content.likesCount || 0 // From the content document
      }
    });

  } catch (error: any) {
    console.error('Get likes count error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
