import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import Comment from '@/lib/models/Comment';
import Post from '@/lib/models/Post';
import User from '@/lib/models/User';
import Notification from '@/lib/models/Notification';
import { verifyToken } from '@/lib/middleware/auth';
import { uploadFileToLocal, deleteFileFromLocal } from '../../../utils/localStorage';

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
        return await createComment(req, res, userId);
      case 'GET':
        return await getComments(req, res, userId);
      case 'PUT':
        return await updateComment(req, res, userId);
      case 'DELETE':
        return await deleteComment(req, res, userId);
      default:
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Comments API error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
}

// Create Comment
async function createComment(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const {
      postId,
      content,
      parentCommentId,
      mentions = [],
      media = []
    } = req.body;

    // Validate required fields
    if (!postId) {
      return res.status(400).json({
        success: false,
        message: 'Post ID is required'
      });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    // Check if post exists and allows comments
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (!post.allowComments) {
      return res.status(403).json({
        success: false,
        message: 'Comments are not allowed on this post'
      });
    }

    // Validate mentions exist
    if (mentions.length > 0) {
      const existingUsers = await User.find({ _id: { $in: mentions } });
      if (existingUsers.length !== mentions.length) {
        return res.status(400).json({
          success: false,
          message: 'Some mentioned users do not exist'
        });
      }
    }

    // Handle parent comment validation
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: 'Parent comment not found'
        });
      }
      if (parentComment.post.toString() !== postId) {
        return res.status(400).json({
          success: false,
          message: 'Parent comment does not belong to this post'
        });
      }
    }

    // Process media files if any
    let mediaFiles: any[] = [];
    if (media && Array.isArray(media)) {
      for (const mediaItem of media) {
        if (mediaItem.file) {
          // Handle file upload
          const uploadResult = await uploadFileToLocal(
            mediaItem.file, 
            userId, 
            mediaItem.file.type.startsWith('video/') ? 'videos' : 'images'
          );
          
          if (uploadResult.success && uploadResult.data) {
            mediaFiles.push({
              type: mediaItem.file.type.startsWith('video/') ? 'video' : 'image',
              url: uploadResult.data.publicUrl,
              fileName: uploadResult.data.fileName,
              filePath: uploadResult.data.filePath,
              fileSize: uploadResult.data.fileSize,
              mimeType: uploadResult.data.mimeType,
              dimensions: uploadResult.data.dimensions,
              duration: uploadResult.data.duration,
              storageType: 'local'
            });
          }
        } else if (mediaItem.url) {
          // Handle existing media URL
          mediaFiles.push({
            type: mediaItem.type || 'image',
            url: mediaItem.url,
            fileName: mediaItem.fileName || 'existing_file',
            filePath: mediaItem.filePath || '',
            fileSize: mediaItem.fileSize || 0,
            mimeType: mediaItem.mimeType || 'image/jpeg',
            dimensions: mediaItem.dimensions,
            duration: mediaItem.duration,
            storageType: mediaItem.storageType || 'local'
          });
        }
      }
    }

    // Create comment data
    const commentData: any = {
      post: postId,
      author: userId,
      content: content.trim(),
      mentions,
      hashtags: extractHashtags(content),
      media: mediaFiles
    };

    // Add parent comment if it's a reply
    if (parentCommentId) {
      commentData.parentComment = parentCommentId;
    }

    // Create the comment
    const comment = await Comment.create(commentData);

    // Add comment to post
    await Post.findByIdAndUpdate(postId, {
      $push: { comments: comment._id },
      $inc: { commentsCount: 1 }
    });

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

    return res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: { comment }
    });

  } catch (error: any) {
    console.error('Create comment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create comment',
      error: error.message
    });
  }
}

// Get Comments
async function getComments(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const {
      postId,
      commentId,
      page = 1,
      limit = 20,
      replies = false
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    let comments: any[] = [];
    let totalComments = 0;

    if (replies === 'true' && commentId) {
      // Get replies for a specific comment
      comments = await Comment.find({ 
        parentComment: commentId, 
        isActive: true 
      })
      .populate('author', 'username fullName avatar')
      .populate('parentComment')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();
      totalComments = await Comment.countDocuments({ 
        parentComment: commentId, 
        isActive: true 
      });
    } else if (postId) {
      // Get comments for a post
      comments = await Comment.find({ 
        post: postId, 
        parentComment: null, 
        isActive: true 
      })
      .populate('author', 'username fullName avatar')
      .populate('parentComment')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();
      totalComments = await Comment.countDocuments({ 
        post: postId, 
        parentComment: null, 
        isActive: true 
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Post ID or Comment ID is required'
      });
    }

    const totalPages = Math.ceil(totalComments / limitNum);

    return res.status(200).json({
      success: true,
      message: 'Comments retrieved successfully',
      data: {
        comments,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: totalComments,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });

  } catch (error: any) {
    console.error('Get comments error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve comments',
      error: error.message
    });
  }
}

// Update Comment
async function updateComment(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { commentId } = req.query;
    const { content, mentions } = req.body;

    if (!commentId) {
      return res.status(400).json({
        success: false,
        message: 'Comment ID is required'
      });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    // Find the comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user is the author
    if (comment.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this comment'
      });
    }

    // Validate mentions exist
    if (mentions && mentions.length > 0) {
      const existingUsers = await User.find({ _id: { $in: mentions } });
      if (existingUsers.length !== mentions.length) {
        return res.status(400).json({
          success: false,
          message: 'Some mentioned users do not exist'
        });
      }
    }

    // Update comment
    const updateData: any = {
      content: content.trim(),
      hashtags: extractHashtags(content)
    };

    if (mentions) {
      updateData.mentions = mentions;
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      updateData,
      { new: true }
    ).populate('author', 'username fullName avatar')
     .populate('mentions', 'username fullName avatar');

    return res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      data: { comment: updatedComment }
    });

  } catch (error: any) {
    console.error('Update comment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update comment',
      error: error.message
    });
  }
}

// Delete Comment
async function deleteComment(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { commentId } = req.query;

    if (!commentId) {
      return res.status(400).json({
        success: false,
        message: 'Comment ID is required'
      });
    }

    // Find the comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user is the author
    if (comment.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this comment'
      });
    }

    // Delete associated media files
    for (const media of comment.media) {
      if (media.storageType === 'local') {
        await deleteFileFromLocal(media.filePath);
      }
    }

    // Delete the comment
    await Comment.findByIdAndDelete(commentId);

    // Remove comment from post
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: commentId },
      $inc: { commentsCount: -1 }
    });

    // If it's a reply, remove from parent comment
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $pull: { replies: commentId },
        $inc: { repliesCount: -1 }
      });
    }

    // Delete all replies to this comment
    await Comment.deleteMany({ parentComment: commentId });

    return res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete comment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete comment',
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

