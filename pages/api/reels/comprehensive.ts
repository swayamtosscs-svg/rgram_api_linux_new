import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import Post from '@/lib/models/Post';
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
        return await createReel(req, res, userId);
      case 'GET':
        return await getReels(req, res, userId);
      case 'PUT':
        return await updateReel(req, res, userId);
      case 'DELETE':
        return await deleteReel(req, res, userId);
      default:
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Reels API error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
}

// Create Reel
async function createReel(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const {
      content,
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
      reelDuration = 60
    } = req.body;

    // Validate required fields
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }

    // Validate reel duration
    if (reelDuration < 1 || reelDuration > 300) {
      return res.status(400).json({
        success: false,
        message: 'Reel duration must be between 1 and 300 seconds'
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

    // Process video files
    let videoFiles: any[] = [];
    if (req.body.videos && Array.isArray(req.body.videos)) {
      for (const videoItem of req.body.videos) {
        if (videoItem.file) {
          // Handle video file upload
          const uploadResult = await uploadFileToLocal(
            videoItem.file, 
            userId, 
            'videos'
          );
          
          if (uploadResult.success && uploadResult.data) {
            videoFiles.push({
              type: 'video',
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
        } else if (videoItem.url) {
          // Handle existing video URL
          videoFiles.push({
            type: 'video',
            url: videoItem.url,
            fileName: videoItem.fileName || 'existing_video',
            filePath: videoItem.filePath || '',
            fileSize: videoItem.fileSize || 0,
            mimeType: videoItem.mimeType || 'video/mp4',
            dimensions: videoItem.dimensions,
            duration: videoItem.duration,
            storageType: videoItem.storageType || 'local'
          });
        }
      }
    }

    // Process song for reel
    let songData: any = null;
    if (song) {
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

    // Create reel data
    const reelData: any = {
      author: userId,
      content: content.trim(),
      type: 'reel',
      title: title?.trim(),
      description: description?.trim(),
      category,
      religion,
      location: location?.trim(),
      media: videoFiles,
      mentions,
      hashtags: hashtags.map((tag: string) => tag.replace('#', '')),
      collaborators,
      allowComments,
      allowLikes,
      allowShares,
      allowSaves,
      isPublic,
      isActive: true,
      isReel: true,
      reelDuration,
      publishedAt: new Date()
    };

    // Add song if provided
    if (songData) {
      reelData.song = songData;
    }

    // Create the reel
    const reel = await Post.create(reelData);

    // Populate author and related data
    await reel.populate('author', 'username fullName avatar');
    await reel.populate('mentions', 'username fullName avatar');
    await reel.populate('collaborators', 'username fullName avatar');

    // Send notifications for mentions
    if (mentions.length > 0) {
      for (const mentionId of mentions) {
        if (mentionId !== userId) { // Don't notify self
          await Notification.create({
            recipient: mentionId,
            sender: userId,
            type: 'mention',
            content: 'You were mentioned in a reel',
            relatedPost: reel._id
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
            content: 'You were invited to collaborate on a reel',
            relatedPost: reel._id
          });
        }
      }
    }

    // Update user's post count
    await User.findByIdAndUpdate(userId, { $inc: { postsCount: 1 } });

    return res.status(201).json({
      success: true,
      message: 'Reel created successfully',
      data: { reel }
    });

  } catch (error: any) {
    console.error('Create reel error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create reel',
      error: error.message
    });
  }
}

// Get Reels
async function getReels(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      religion,
      hashtag,
      user_id,
      my_reels = false,
      saved_reels = false,
      following_reels = false
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    let query: any = { 
      isActive: true, 
      isReel: true 
    };

    // Apply filters
    if (category) query.category = category;
    if (religion) query.religion = religion;
    if (hashtag) query.hashtags = { $in: [hashtag] };

    // Handle different reel types
    if (my_reels === 'true') {
      query.author = userId;
    } else if (saved_reels === 'true') {
      query.saves = userId;
    } else if (following_reels === 'true') {
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
          message: 'No reels found',
          data: {
            reels: [],
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
      // Public reels only
      query.isPublic = true;
    }

    // Get reels with pagination
    const [reels, totalReels] = await Promise.all([
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

    // Add view count for each reel (if not already viewed by user)
    for (const reel of reels) {
      if (!reel.views.some(view => view.toString() === userId)) {
        await Post.findByIdAndUpdate(reel._id, {
          $addToSet: { views: userId },
          $inc: { viewsCount: 1 }
        });
      }
    }

    const totalPages = Math.ceil(totalReels / limitNum);

    return res.status(200).json({
      success: true,
      message: 'Reels retrieved successfully',
      data: {
        reels,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: totalReels,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });

  } catch (error: any) {
    console.error('Get reels error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve reels',
      error: error.message
    });
  }
}

// Update Reel
async function updateReel(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { reelId } = req.query;
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
      isPublic,
      song,
      reelDuration
    } = req.body;

    if (!reelId) {
      return res.status(400).json({
        success: false,
        message: 'Reel ID is required'
      });
    }

    // Find the reel
    const reel = await Post.findById(reelId);
    if (!reel) {
      return res.status(404).json({
        success: false,
        message: 'Reel not found'
      });
    }

    if (reel.type !== 'reel') {
      return res.status(400).json({
        success: false,
        message: 'This is not a reel'
      });
    }

    // Check if user is the author or collaborator
    if (reel.author.toString() !== userId && !reel.collaborators.some(collab => collab.toString() === userId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this reel'
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
    if (reelDuration !== undefined) updateData.reelDuration = reelDuration;

    updateData.updatedAt = new Date();

    // Update the reel
    const updatedReel = await Post.findByIdAndUpdate(
      reelId,
      updateData,
      { new: true }
    ).populate('author', 'username fullName avatar')
     .populate('mentions', 'username fullName avatar')
     .populate('collaborators', 'username fullName avatar');

    return res.status(200).json({
      success: true,
      message: 'Reel updated successfully',
      data: { reel: updatedReel }
    });

  } catch (error: any) {
    console.error('Update reel error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update reel',
      error: error.message
    });
  }
}

// Delete Reel
async function deleteReel(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { reelId } = req.query;

    if (!reelId) {
      return res.status(400).json({
        success: false,
        message: 'Reel ID is required'
      });
    }

    // Find the reel
    const reel = await Post.findById(reelId);
    if (!reel) {
      return res.status(404).json({
        success: false,
        message: 'Reel not found'
      });
    }

    if (reel.type !== 'reel') {
      return res.status(400).json({
        success: false,
        message: 'This is not a reel'
      });
    }

    // Check if user is the author
    if (reel.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this reel'
      });
    }

    // Delete associated media files
    for (const image of reel.images) {
      if (image.startsWith('/uploads/')) {
        await deleteFileFromLocal(image);
      }
    }
    
    for (const video of reel.videos) {
      if (video.startsWith('/uploads/')) {
        await deleteFileFromLocal(video);
      }
    }

    // Note: Song field not available in current Post model

    // Delete the reel
    await Post.findByIdAndDelete(reelId);

    // Update user's post count
    await User.findByIdAndUpdate(userId, { $inc: { postsCount: -1 } });

    return res.status(200).json({
      success: true,
      message: 'Reel deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete reel error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete reel',
      error: error.message
    });
  }
}
