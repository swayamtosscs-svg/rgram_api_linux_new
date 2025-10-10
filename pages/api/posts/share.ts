import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import Post from '@/lib/models/Post';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/middleware/auth';

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
    
    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const { postId, shareType = 'general' } = req.body;

    // Validation
    if (!postId) {
      return res.status(400).json({ 
        success: false, 
        message: 'postId is required in request body' 
      });
    }

    // Verify user exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify post exists and is a reel or video
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check if post has shareable content (content, images, or videos)
    const hasContent = post.content && post.content.trim().length > 0;
    const hasImages = post.images && post.images.length > 0;
    const hasVideos = post.videos && post.videos.length > 0;
    
    if (!hasContent && !hasImages && !hasVideos) {
      return res.status(400).json({ 
        success: false, 
        message: 'Post must have content, images, or videos to share' 
      });
    }

    // Check if user already shared the post
    const isAlreadyShared = post.shares.some((shareId: any) => shareId.toString() === decoded.userId);

    let updatedPost;
    let action;

    if (isAlreadyShared) {
      // Unshare the post
      updatedPost = await Post.findByIdAndUpdate(
        postId,
        { $pull: { shares: decoded.userId } },
        { new: true }
      ).populate('author', 'username fullName avatar religion isPrivate')
       .populate('shares', 'username fullName avatar')
       .populate('comments.author', 'username fullName avatar');
      
      action = 'unshared';
    } else {
      // Share the post
      updatedPost = await Post.findByIdAndUpdate(
        postId,
        { $addToSet: { shares: decoded.userId } },
        { new: true }
      ).populate('author', 'username fullName avatar religion isPrivate')
       .populate('shares', 'username fullName avatar')
       .populate('comments.author', 'username fullName avatar');
      
      action = 'shared';
    }

    if (!updatedPost) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update post' 
      });
    }

    // Prepare response data
    const responseData = {
      success: true,
      message: `Post ${action} successfully`,
      data: {
        post: {
          _id: updatedPost._id,
          content: updatedPost.content,
          title: updatedPost.title,
          description: updatedPost.description,
          type: updatedPost.type,
          category: updatedPost.category,
          religion: updatedPost.religion,
          author: updatedPost.author,
          videos: updatedPost.videos,
          images: updatedPost.images,
          duration: updatedPost.duration,
          shares: updatedPost.shares,
          shareCount: updatedPost.sharesCount,
          likes: updatedPost.likes,
          likeCount: updatedPost.likesCount,
          comments: updatedPost.comments,
          commentCount: updatedPost.commentsCount,
          createdAt: updatedPost.createdAt,
          updatedAt: updatedPost.updatedAt,
          isActive: updatedPost.isActive
        },
        action: action,
        isShared: !isAlreadyShared,
        shareCount: updatedPost.sharesCount,
        shareType: shareType,
        videoId: updatedPost.videos && updatedPost.videos.length > 0 ? updatedPost.videos[0] : null,
        videoIds: updatedPost.videos || [],
        imageId: updatedPost.images && updatedPost.images.length > 0 ? updatedPost.images[0] : null,
        imageIds: updatedPost.images || [],
        hasContent: hasContent,
        hasImages: hasImages,
        hasVideos: hasVideos
      }
    };

    res.json(responseData);

  } catch (error: any) {
    console.error('Post share error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
