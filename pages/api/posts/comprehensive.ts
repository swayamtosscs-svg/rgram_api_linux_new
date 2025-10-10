import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import Post from '@/lib/models/Post';
import Comment from '@/lib/models/Comment';
import User from '@/lib/models/User';
import Follow from '@/lib/models/Follow';
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
        return await createPost(req, res, userId);
      case 'GET':
        return await getPosts(req, res, userId);
      case 'PUT':
        return await updatePost(req, res, userId);
      case 'DELETE':
        return await deletePost(req, res, userId);
      default:
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Posts API error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
}

// Create Post/Reel
async function createPost(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const {
      content,
      type = 'post',
      title,
      description,
      category = 'general',
      religion = 'none',
      location,
      hashtags = [],
      mentions = [],
      collaborators = [],
      allowComments = true,
      allowLikes = true,
      allowShares = true,
      allowSaves = true,
      isPublic = true,
      song,
      reelDuration
    } = req.body;

    // Validate required fields
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }

    // Validate post type
    const validTypes = ['post', 'reel', 'story'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post type. Must be one of: post, reel, story'
      });
    }

    // Validate mentions and collaborators exist
    const allUserIds = [...mentions, ...collaborators];
    if (allUserIds.length > 0) {
      const existingUsers = await User.find({ _id: { $in: allUserIds } });
      if (existingUsers.length !== allUserIds.length) {
        return res.status(400).json({
          success: false,
          message: 'Some mentioned users or collaborators do not exist'
        });
      }
    }

    // Process media files if any
    let mediaFiles: any[] = [];
    if (req.body.media && Array.isArray(req.body.media)) {
      for (const mediaItem of req.body.media) {
        if (mediaItem.file) {
          // Handle file upload
          const uploadResult = await uploadFileToLocal(
            mediaItem.file, 
            userId, 
            type === 'reel' ? 'videos' : 'images'
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

    // Process song for reels
    let songData: any = null;
    if (type === 'reel' && song) {
      if (song.file) {
        // Handle song file upload
        const songUploadResult = await uploadFileToLocal(
          song.file, 
          userId, 
          'audio'
        );
        
        if (songUploadResult.success && songUploadResult.data) {
          songData = {
            title: song.title || 'Unknown Song',
            artist: song.artist || 'Unknown Artist',
            url: songUploadResult.data.publicUrl,
            fileName: songUploadResult.data.fileName,
            filePath: songUploadResult.data.filePath,
            duration: songUploadResult.data.duration || 0,
            storageType: 'local'
          };
        }
      } else if (song.url) {
        // Handle existing song URL
        songData = {
          title: song.title || 'Unknown Song',
          artist: song.artist || 'Unknown Artist',
          url: song.url,
          fileName: song.fileName || 'existing_song',
          filePath: song.filePath || '',
          duration: song.duration || 0,
          storageType: song.storageType || 'local'
        };
      }
    }

    // Create post data
    const postData: any = {
      author: userId,
      content: content.trim(),
      type,
      title: title?.trim(),
      description: description?.trim(),
      category,
      religion,
      location: location?.trim(),
      media: mediaFiles,
      mentions,
      hashtags: hashtags.map((tag: string) => tag.replace('#', '')),
      collaborators,
      allowComments,
      allowLikes,
      allowShares,
      allowSaves,
      isPublic,
      isActive: true,
      publishedAt: new Date()
    };

    // Add type-specific fields
    if (type === 'reel') {
      postData.isReel = true;
      postData.reelDuration = reelDuration || 60;
      if (songData) {
        postData.song = songData;
      }
    } else if (type === 'story') {
      postData.isStory = true;
      postData.storyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    }

    // Create the post
    const post = await Post.create(postData);

    // Populate author and related data
    await post.populate('author', 'username fullName avatar');
    await post.populate('mentions', 'username fullName avatar');
    await post.populate('collaborators', 'username fullName avatar');

    // Send notifications for mentions
    if (mentions.length > 0) {
      for (const mentionId of mentions) {
        if (mentionId !== userId) { // Don't notify self
          await Notification.create({
            recipient: mentionId,
            sender: userId,
            type: 'mention',
            content: `You were mentioned in a ${type}`,
            relatedPost: post._id
          });
        }
      }
    }

    // Send notifications for collaborators
    if (collaborators.length > 0) {
      for (const collaboratorId of collaborators) {
        if (collaboratorId !== userId) { // Don't notify self
          await Notification.create({
            recipient: collaboratorId,
            sender: userId,
            type: 'collaboration_request',
            content: `You were invited to collaborate on a ${type}`,
            relatedPost: post._id
          });
        }
      }
    }

    // Update user's post count
    await User.findByIdAndUpdate(userId, { $inc: { postsCount: 1 } });

    return res.status(201).json({
      success: true,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} created successfully`,
      data: { post }
    });

  } catch (error: any) {
    console.error('Create post error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create post',
      error: error.message
    });
  }
}

// Get Posts/Reels
async function getPosts(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      category,
      religion,
      hashtag,
      user_id,
      my_posts = false,
      saved_posts = false,
      following_posts = false
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    let query: any = { isActive: true };

    // Apply filters
    if (type) query.type = type;
    if (category) query.category = category;
    if (religion) query.religion = religion;
    if (hashtag) query.hashtags = { $in: [hashtag] };

    // Handle different post types
    if (my_posts === 'true') {
      query.author = userId;
    } else if (saved_posts === 'true') {
      query.saves = userId;
    } else if (following_posts === 'true') {
      // Get following users
      const following = await Follow.find({ 
        follower: userId, 
        status: 'accepted' 
      }).select('following');
      
      if (following && following.length > 0) {
        const followingIds = following.map(f => f.following);
        query.author = { $in: followingIds };
      } else {
        // If not following anyone, return empty results
        return res.status(200).json({
          success: true,
          message: 'No posts found',
          data: {
            posts: [],
            pagination: {
              currentPage: pageNum,
              totalPages: 0,
              totalItems: 0,
              itemsPerPage: limitNum,
              hasNextPage: false,
              hasPrevPage: false
            }
          }
        });
      }
    } else if (user_id) {
      query.author = user_id;
    } else {
      // Public posts only
      query.isPublic = true;
    }

    // Get posts with pagination
    const [posts, totalPosts] = await Promise.all([
      Post.find(query)
        .populate('author', 'username fullName avatar isPrivate')
        .populate('mentions', 'username fullName avatar')
        .populate('collaborators', 'username fullName avatar')
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Post.countDocuments(query)
    ]);

    // Add view count for each post (if not already viewed by user)
    for (const post of posts) {
      if (!post.views.some(view => view.toString() === userId)) {
        await Post.findByIdAndUpdate(post._id, {
          $addToSet: { views: userId },
          $inc: { viewsCount: 1 }
        });
      }
    }

    const totalPages = Math.ceil(totalPosts / limitNum);

    return res.status(200).json({
      success: true,
      message: 'Posts retrieved successfully',
      data: {
        posts,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: totalPosts,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });

  } catch (error: any) {
    console.error('Get posts error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve posts',
      error: error.message
    });
  }
}

// Update Post/Reel
async function updatePost(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { postId } = req.query;
    const {
      content,
      title,
      description,
      category,
      religion,
      location,
      hashtags,
      mentions,
      collaborators,
      allowComments,
      allowLikes,
      allowShares,
      allowSaves,
      isPublic
    } = req.body;

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: 'Post ID is required'
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

    // Check if user is the author or collaborator
    if (post.author.toString() !== userId && !post.collaborators.some(collab => collab.toString() === userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this post'
      });
    }

    // Update fields
    const updateData: any = {};
    if (content !== undefined) updateData.content = content.trim();
    if (title !== undefined) updateData.title = title?.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (category !== undefined) updateData.category = category;
    if (religion !== undefined) updateData.religion = religion;
    if (location !== undefined) updateData.location = location?.trim();
    if (hashtags !== undefined) updateData.hashtags = hashtags.map((tag: string) => tag.replace('#', ''));
    if (mentions !== undefined) updateData.mentions = mentions;
    if (collaborators !== undefined) updateData.collaborators = collaborators;
    if (allowComments !== undefined) updateData.allowComments = allowComments;
    if (allowLikes !== undefined) updateData.allowLikes = allowLikes;
    if (allowShares !== undefined) updateData.allowShares = allowShares;
    if (allowSaves !== undefined) updateData.allowSaves = allowSaves;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    updateData.updatedAt = new Date();

    // Update the post
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      updateData,
      { new: true }
    ).populate('author', 'username fullName avatar')
     .populate('mentions', 'username fullName avatar')
     .populate('collaborators', 'username fullName avatar');

    return res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: { post: updatedPost }
    });

  } catch (error: any) {
    console.error('Update post error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update post',
      error: error.message
    });
  }
}

// Delete Post/Reel
async function deletePost(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { postId } = req.query;

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: 'Post ID is required'
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

    // Check if user is the author
    if (post.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this post'
      });
    }

    // Delete associated media files
    for (const image of post.images) {
      if (image.startsWith('/uploads/')) {
        await deleteFileFromLocal(image);
      }
    }
    
    for (const video of post.videos) {
      if (video.startsWith('/uploads/')) {
        await deleteFileFromLocal(video);
      }
    }

    // Note: Song field not available in current Post model

    // Delete the post
    await Post.findByIdAndDelete(postId);

    // Delete associated comments
    await Comment.deleteMany({ post: postId });

    // Update user's post count
    await User.findByIdAndUpdate(userId, { $inc: { postsCount: -1 } });

    return res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete post error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete post',
      error: error.message
    });
  }
}

