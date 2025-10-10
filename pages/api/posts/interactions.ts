import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import Post from '@/lib/models/Post';
import Comment from '@/lib/models/Comment';
import User from '@/lib/models/User';
import Notification from '@/lib/models/Notification';
import { verifyToken } from '@/lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const userId = decoded.userId;

    switch (req.method) {
      case 'POST':
        return await handleInteraction(req, res, userId);
      case 'GET':
        return await getInteractions(req, res, userId);
      default:
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Post interactions error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
}

// Handle Post Interactions (like, comment, share, save)
async function handleInteraction(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { postId } = req.query;
    const { action, content, mentions = [], parentCommentId } = req.body;

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: 'Post ID is required'
      });
    }

    if (!action) {
      return res.status(400).json({
        success: false,
        message: 'Action is required'
      });
    }

    // Find the post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if post is active
    if (!post.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Post is not accessible'
      });
    }

    let result: any = {};

    switch (action) {
      case 'like':
        result = await handleLike(post, userId);
        break;
      case 'unlike':
        result = await handleUnlike(post, userId);
        break;
      case 'comment':
        result = await handleComment(post, userId, content, mentions, parentCommentId);
        break;
      case 'share':
        result = await handleShare(post, userId);
        break;
      case 'save':
        result = await handleSave(post, userId);
        break;
      case 'unsave':
        result = await handleUnsave(post, userId);
        break;
      case 'view':
        result = await handleView(post, userId);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action. Must be one of: like, unlike, comment, share, save, unsave, view'
        });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data
    });

  } catch (error: any) {
    console.error('Handle interaction error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to handle interaction',
      error: error.message
    });
  }
}

// Handle Like
async function handleLike(post: any, userId: string) {
  try {
    if (!post.allowLikes) {
      return {
        message: 'Likes are not allowed on this post',
        data: null
      };
    }

    const isAlreadyLiked = post.likes.includes(userId);
    if (isAlreadyLiked) {
      return {
        message: 'Post already liked',
        data: { liked: true, likesCount: post.likesCount }
      };
    }

    // Add like
    await post.addLike(userId);

    // Send notification to post author (if not self)
    if (post.author.toString() !== userId) {
      const liker = await User.findById(userId).select('username fullName');
      await Notification.create({
        recipient: post.author,
        sender: userId,
        type: 'like',
        content: `${liker?.username || 'Someone'} liked your ${post.type}`,
        relatedPost: post._id
      });
    }

    return {
      message: 'Post liked successfully',
      data: { liked: true, likesCount: post.likesCount + 1 }
    };

  } catch (error: any) {
    throw new Error(`Like error: ${error.message}`);
  }
}

// Handle Unlike
async function handleUnlike(post: any, userId: string) {
  try {
    const isLiked = post.likes.includes(userId);
    if (!isLiked) {
      return {
        message: 'Post not liked',
        data: { liked: false, likesCount: post.likesCount }
      };
    }

    // Remove like
    await post.removeLike(userId);

    return {
      message: 'Post unliked successfully',
      data: { liked: false, likesCount: post.likesCount - 1 }
    };

  } catch (error: any) {
    throw new Error(`Unlike error: ${error.message}`);
  }
}

// Handle Comment
async function handleComment(post: any, userId: string, content: string, mentions: string[], parentCommentId?: string) {
  try {
    if (!post.allowComments) {
      return {
        message: 'Comments are not allowed on this post',
        data: null
      };
    }

    if (!content || content.trim().length === 0) {
      return {
        message: 'Comment content is required',
        data: null
      };
    }

    // Validate mentions exist
    if (mentions.length > 0) {
      const existingUsers = await User.find({ _id: { $in: mentions } });
      if (existingUsers.length !== mentions.length) {
        return {
          message: 'Some mentioned users do not exist',
          data: null
        };
      }
    }

    // Create comment
    const commentData: any = {
      post: post._id,
      author: userId,
      content: content.trim(),
      mentions,
      hashtags: extractHashtags(content)
    };

    // Handle reply to comment
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return {
          message: 'Parent comment not found',
          data: null
        };
      }
      commentData.parentComment = parentCommentId;
    }

    const comment = await Comment.create(commentData);

    // Add comment to post
    await post.addComment(comment._id);

    // If it's a reply, add to parent comment
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (parentComment) {
        await parentComment.addReply(comment._id);
      }
    }

    // Populate comment data
    await comment.populate('author', 'username fullName avatar');
    await comment.populate('mentions', 'username fullName avatar');

    // Send notifications
    // Notify post author (if not self)
    if (post.author.toString() !== userId) {
      const commenter = await User.findById(userId).select('username fullName');
      await Notification.create({
        recipient: post.author,
        sender: userId,
        type: 'comment',
        content: `${commenter?.username || 'Someone'} commented on your ${post.type}`,
        relatedPost: post._id,
        relatedComment: comment._id
      });
    }

    // Notify mentioned users
    for (const mentionId of mentions) {
      if (mentionId !== userId && mentionId !== post.author.toString()) {
        await Notification.create({
          recipient: mentionId,
          sender: userId,
          type: 'mention',
          content: `You were mentioned in a comment`,
          relatedPost: post._id,
          relatedComment: comment._id
        });
      }
    }

    // If it's a reply, notify parent comment author
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (parentComment && parentComment.author.toString() !== userId) {
        const replier = await User.findById(userId).select('username fullName');
        await Notification.create({
          recipient: parentComment.author,
          sender: userId,
          type: 'reply',
          content: `${replier?.username || 'Someone'} replied to your comment`,
          relatedPost: post._id,
          relatedComment: comment._id
        });
      }
    }

    return {
      message: 'Comment added successfully',
      data: { comment, commentsCount: post.commentsCount + 1 }
    };

  } catch (error: any) {
    throw new Error(`Comment error: ${error.message}`);
  }
}

// Handle Share
async function handleShare(post: any, userId: string) {
  try {
    if (!post.allowShares) {
      return {
        message: 'Shares are not allowed on this post',
        data: null
      };
    }

    const isAlreadyShared = post.shares.includes(userId);
    if (isAlreadyShared) {
      return {
        message: 'Post already shared',
        data: { shared: true, sharesCount: post.sharesCount }
      };
    }

    // Add share
    await post.addShare(userId);

    // Send notification to post author (if not self)
    if (post.author.toString() !== userId) {
      const sharer = await User.findById(userId).select('username fullName');
      await Notification.create({
        recipient: post.author,
        sender: userId,
        type: 'share',
        content: `${sharer?.username || 'Someone'} shared your ${post.type}`,
        relatedPost: post._id
      });
    }

    return {
      message: 'Post shared successfully',
      data: { shared: true, sharesCount: post.sharesCount + 1 }
    };

  } catch (error: any) {
    throw new Error(`Share error: ${error.message}`);
  }
}

// Handle Save
async function handleSave(post: any, userId: string) {
  try {
    if (!post.allowSaves) {
      return {
        message: 'Saves are not allowed on this post',
        data: null
      };
    }

    const isAlreadySaved = post.saves.includes(userId);
    if (isAlreadySaved) {
      return {
        message: 'Post already saved',
        data: { saved: true, savesCount: post.savesCount }
      };
    }

    // Add save
    await post.addSave(userId);

    return {
      message: 'Post saved successfully',
      data: { saved: true, savesCount: post.savesCount + 1 }
    };

  } catch (error: any) {
    throw new Error(`Save error: ${error.message}`);
  }
}

// Handle Unsave
async function handleUnsave(post: any, userId: string) {
  try {
    const isSaved = post.saves.includes(userId);
    if (!isSaved) {
      return {
        message: 'Post not saved',
        data: { saved: false, savesCount: post.savesCount }
      };
    }

    // Remove save
    await post.removeSave(userId);

    return {
      message: 'Post unsaved successfully',
      data: { saved: false, savesCount: post.savesCount - 1 }
    };

  } catch (error: any) {
    throw new Error(`Unsave error: ${error.message}`);
  }
}

// Handle View
async function handleView(post: any, userId: string) {
  try {
    const isAlreadyViewed = post.views.includes(userId);
    if (isAlreadyViewed) {
      return {
        message: 'Post already viewed',
        data: { viewed: true, viewsCount: post.viewsCount }
      };
    }

    // Add view
    await post.addView(userId);

    return {
      message: 'Post viewed successfully',
      data: { viewed: true, viewsCount: post.viewsCount + 1 }
    };

  } catch (error: any) {
    throw new Error(`View error: ${error.message}`);
  }
}

// Get Interactions
async function getInteractions(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { postId, type } = req.query;

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: 'Post ID is required'
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    let data: any = {};

    switch (type) {
      case 'likes':
        const likes = await User.find({ _id: { $in: post.likes } })
          .select('username fullName avatar')
          .limit(50);
        data = { likes, count: post.likesCount };
        break;
      case 'comments':
        const comments = await Comment.find({ 
          post: postId, 
          isActive: true 
        })
        .populate('author', 'username fullName avatar')
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();
        data = { comments, count: post.commentsCount };
        break;
      case 'shares':
        const shares = await User.find({ _id: { $in: post.shares } })
          .select('username fullName avatar')
          .limit(50);
        data = { shares, count: post.sharesCount };
        break;
      case 'saves':
        const saves = await User.find({ _id: { $in: post.saves } })
          .select('username fullName avatar')
          .limit(50);
        data = { saves, count: post.savesCount };
        break;
      case 'views':
        const views = await User.find({ _id: { $in: post.views } })
          .select('username fullName avatar')
          .limit(50);
        data = { views, count: post.viewsCount };
        break;
      default:
        // Return all interaction counts
        data = {
          likesCount: post.likesCount,
          commentsCount: post.commentsCount,
          sharesCount: post.sharesCount,
          savesCount: post.savesCount,
          viewsCount: post.viewsCount,
          userLiked: post.likes.some(like => like.toString() === userId),
          userShared: post.shares.some(share => share.toString() === userId),
          userSaved: post.saves.some(save => save.toString() === userId),
          userViewed: post.views.some(view => view.toString() === userId)
        };
    }

    return res.status(200).json({
      success: true,
      message: 'Interactions retrieved successfully',
      data
    });

  } catch (error: any) {
    console.error('Get interactions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve interactions',
      error: error.message
    });
  }
}

// Helper function to extract hashtags from text
function extractHashtags(text: string): string[] {
  const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
  const matches = text.match(hashtagRegex);
  return matches ? matches.map(tag => tag.replace('#', '')) : [];
}

