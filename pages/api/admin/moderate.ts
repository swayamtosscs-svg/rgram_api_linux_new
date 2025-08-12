import type { NextApiRequest, NextApiResponse } from 'next';
import { adminMiddleware } from '../../../lib/middleware/adminAuth';
import Post from '../../../lib/models/Post';
import ReligiousReel from '../../../lib/models/ReligiousReel';
import dbConnect from '../../../lib/database';

const withAdminAuth = (handler: Function) => async (req: NextApiRequest, res: NextApiResponse) => {
  await adminMiddleware(req, res, async () => {
    await handler(req, res);
  });
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  switch (req.method) {
    case 'GET':
      await getPendingContent(req, res);
      break;
    case 'POST':
      await moderateContent(req, res);
      break;
    default:
      res.status(405).json({ message: 'Method not allowed' });
  }
}

// Get pending content for moderation
async function getPendingContent(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      page = '1',
      limit = '10',
      type = 'all'
    } = req.query;

    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const skip = (pageNumber - 1) * limitNumber;

    let content = [];
    let total = 0;

    if (type === 'all' || type === 'posts') {
      const posts = await Post.find({ isApproved: false })
        .populate('userId', 'username email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber);
      
      const postsCount = await Post.countDocuments({ isApproved: false });
      content = [...content, ...posts.map(post => ({ ...post.toObject(), contentType: 'post' }))];
      total += postsCount;
    }

    if (type === 'all' || type === 'reels') {
      const reels = await ReligiousReel.find({ isApproved: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber);
      
      const reelsCount = await ReligiousReel.countDocuments({ isApproved: false });
      content = [...content, ...reels.map(reel => ({ ...reel.toObject(), contentType: 'reel' }))];
      total += reelsCount;
    }

    // Sort combined content by creation date
    content.sort((a, b) => b.createdAt - a.createdAt);

    res.status(200).json({
      success: true,
      data: content,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / limitNumber)
      }
    });
  } catch (error) {
    console.error('Error in getPendingContent:', error);
    res.status(500).json({ message: 'Error fetching pending content' });
  }
}

// Moderate content (approve/reject)
async function moderateContent(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { contentId, contentType, action, reason } = req.body;

    if (!contentId || !contentType || !action) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    let content;
    if (contentType === 'post') {
      content = await Post.findOne({ _id: contentId });
    } else {
      content = await ReligiousReel.findOne({ _id: contentId });
    }
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    const updateData = {
      isApproved: action === 'approve',
      moderationReason: reason,
      moderatedAt: new Date()
    };

    let updatedContent;
    if (contentType === 'post') {
      updatedContent = await Post.findOneAndUpdate(
        { _id: contentId },
        updateData,
        { new: true }
      );
    } else {
      updatedContent = await ReligiousReel.findOneAndUpdate(
        { _id: contentId },
        updateData,
        { new: true }
      );
    }

    res.status(200).json({
      success: true,
      message: `Content ${action}ed successfully`,
      data: updatedContent
    });
  } catch (error) {
    console.error('Error in moderateContent:', error);
    res.status(500).json({ message: 'Error moderating content' });
  }
}

export default withAdminAuth(handler);
