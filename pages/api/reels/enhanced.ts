import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import Post from '@/lib/models/Post';
import Notification from '@/lib/models/Notification';
import { verifyToken } from '@/lib/middleware/auth';
import { deleteFileByUrl } from '../../../utils/localStorage';
import { extractMentions, extractHashtags } from '../../../utils/textUtils';
import { mediaUploadMiddleware, getFileInfo } from '../../../lib/middleware/upload';

// Configure the API route with upload middleware
const config = {
  api: {
    bodyParser: false, // Disable default body parser to handle multipart/form-data
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const decoded = await verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  // Add user info to request for middleware
  (req as any).user = decoded;

  switch (req.method) {
    case 'POST':
      return mediaUploadMiddleware([{ name: 'mediaFiles', maxCount: 10 }])(req, res, () => createReel(req, res, decoded.userId));
    case 'GET':
      return getReels(req, res, decoded.userId);
    case 'PUT':
      return mediaUploadMiddleware([{ name: 'mediaFiles', maxCount: 10 }])(req, res, () => updateReel(req, res, decoded.userId));
    case 'DELETE':
      return deleteReel(req, res, decoded.userId);
    default:
      return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}

export { config };

// Create Reel
async function createReel(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { 
      content, 
      title, 
      description, 
      category = 'entertainment', 
      religion, 
      location, 
      songTitle,
      songArtist,
      songDuration,
      collaborators 
    } = req.body;

    // Validate that reel has media files
    const files = req.files as any;
    if (!files || !files.mediaFiles) {
      return res.status(400).json({
        success: false,
        message: 'Reel must contain media files'
      });
    }

    // Process uploaded media files
    const mediaFiles = [];
    const fileArray = Array.isArray(files.mediaFiles) ? files.mediaFiles : [files.mediaFiles];
    
    for (const file of fileArray) {
      const fileInfo = getFileInfo(file);
      mediaFiles.push({
        fileName: fileInfo.fileName,
        filePath: fileInfo.filePath,
        publicUrl: fileInfo.publicUrl,
        fileSize: fileInfo.fileSize,
        mimeType: fileInfo.mimeType,
        storageType: fileInfo.storageType,
        isPublic: fileInfo.isPublic,
        type: fileInfo.type
      });
    }

    // Extract mentions and hashtags from content
    const mentions = extractMentions(content || '');
    const hashtags = extractHashtags(content || '');

    // Process song if provided
    let songData = null;
    if (songTitle && songArtist) {
      songData = {
        title: songTitle,
        artist: songArtist,
        duration: songDuration || 0,
        audioUrl: '', // Will be set if audio file is uploaded
        thumbnailUrl: '' // Will be set if thumbnail is uploaded
      };

      // Check for audio file upload
      if (files && files.audioFile) {
        const audioFile = Array.isArray(files.audioFile) ? files.audioFile[0] : files.audioFile;
        const audioInfo = getFileInfo(audioFile);
        songData.audioUrl = audioInfo.publicUrl;
      }

      // Check for thumbnail upload
      if (files && files.thumbnailFile) {
        const thumbnailFile = Array.isArray(files.thumbnailFile) ? files.thumbnailFile[0] : files.thumbnailFile;
        const thumbnailInfo = getFileInfo(thumbnailFile);
        songData.thumbnailUrl = thumbnailInfo.publicUrl;
      }
    }

    // Also check if song files are uploaded without title/artist (for standalone song reels)
    if (!songData && files && (files.audioFile || files.thumbnailFile)) {
      songData = {
        title: songTitle || 'Untitled Song',
        artist: songArtist || 'Unknown Artist',
        duration: songDuration || 0,
        audioUrl: '',
        thumbnailUrl: ''
      };

      // Check for audio file upload
      if (files.audioFile) {
        const audioFile = Array.isArray(files.audioFile) ? files.audioFile[0] : files.audioFile;
        const audioInfo = getFileInfo(audioFile);
        songData.audioUrl = audioInfo.publicUrl;
      }

      // Check for thumbnail upload
      if (files.thumbnailFile) {
        const thumbnailFile = Array.isArray(files.thumbnailFile) ? files.thumbnailFile[0] : files.thumbnailFile;
        const thumbnailInfo = getFileInfo(thumbnailFile);
        songData.thumbnailUrl = thumbnailInfo.publicUrl;
      }
    }

    // Create reel
    const reel = await Post.create({
      author: userId,
      content: content || '',
      media: mediaFiles,
      type: 'reel',
      title,
      description,
      category,
      religion,
      location,
      song: songData,
      mentions,
      hashtags,
      // collaborators: collaborators || [], // Commented out - Post model doesn't have collaborators field
      likes: [],
      likesCount: 0,
      comments: [],
      commentsCount: 0,
      shares: [],
      sharesCount: 0,
      saves: [],
      savesCount: 0,
      views: [],
      viewsCount: 0,
      collaborationRequests: [],
      isPublic: true,
      isActive: true,
      reported: false
    });

    // Send notifications for mentions
    if (mentions.length > 0) {
      for (const mentionId of mentions) {
        await Notification.create({
          recipient: mentionId,
          sender: userId,
          type: 'mention',
          content: 'You were mentioned in a reel',
          relatedPost: reel._id
        });
      }
    }

    // Send notifications for collaborators - commented out
    // if (collaborators && collaborators.length > 0) {
    //   for (const collaboratorId of collaborators) {
    //     await Notification.create({
    //       recipient: collaboratorId,
    //       sender: userId,
    //       type: 'collaboration_request',
    //       content: 'You were invited to collaborate on a reel',
    //       relatedPost: reel._id
    //     });
    //   }
    // }

    // Populate author details
    await reel.populate('author', 'username fullName avatar');
    // await reel.populate('mentions', 'username fullName avatar'); // Commented out
    // await reel.populate('collaborators', 'username fullName avatar'); // Commented out

    return res.status(201).json({
      success: true,
      message: 'Reel created successfully',
      data: { reel }
    });

  } catch (error: any) {
    console.error('Create reel error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
      author, 
      search,
      trending = false 
    } = req.query;

    const query: any = { 
      type: 'reel',
      isActive: true 
    };
    
    if (category) {
      query.category = category;
    }
    
    if (religion) {
      query.religion = religion;
    }
    
    if (author) {
      query.author = author;
    }
    
    if (search) {
      query.$or = [
        { content: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { hashtags: { $in: [new RegExp(search as string, 'i')] } }
      ];
    }

    let sortCriteria: any = { createdAt: -1 };
    
    // If trending, sort by engagement metrics
    if (trending === 'true') {
      sortCriteria = { 
        likesCount: -1, 
        viewsCount: -1, 
        commentsCount: -1,
        createdAt: -1 
      };
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const reels = await Post.find(query)
      .populate('author', 'username fullName avatar')
      // .populate('mentions', 'username fullName avatar') // Commented out
      // .populate('collaborators', 'username fullName avatar') // Commented out
      .populate('comments.author', 'username fullName avatar')
      // .populate('comments.mentions', 'username fullName avatar') // Commented out
      .populate('comments.replies.author', 'username fullName avatar')
      // .populate('comments.replies.mentions', 'username fullName avatar') // Commented out
      .sort(sortCriteria)
      .skip(skip)
      .limit(Number(limit));

    const total = await Post.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: {
        reels,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalItems: total,
          itemsPerPage: Number(limit),
          hasNextPage: Number(page) < Math.ceil(total / Number(limit)),
          hasPrevPage: Number(page) > 1
        }
      }
    });

  } catch (error: any) {
    console.error('Get reels error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Update Reel
async function updateReel(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { reelId } = req.query;
    const { content, title, description, category, religion, location, songTitle, songArtist, songDuration, collaborators } = req.body;

    if (!reelId) {
      return res.status(400).json({
        success: false,
        message: 'Reel ID is required'
      });
    }

    const reel = await Post.findById(reelId);
    if (!reel || !reel.isActive || reel.type !== 'reel') {
      return res.status(404).json({
        success: false,
        message: 'Reel not found'
      });
    }

    // Check if user is author
    if (reel.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own reels'
      });
    }

    // Update fields
    if (content !== undefined) {
      reel.content = content;
      // Re-extract mentions and hashtags
      // reel.mentions = extractMentions(content); // Commented out - Post model doesn't have mentions field
      // reel.hashtags = extractHashtags(content); // Commented out - Post model doesn't have hashtags field
    }
    
    if (title !== undefined) reel.title = title;
    if (description !== undefined) reel.description = description;
    if (category !== undefined) reel.category = category;
    if (religion !== undefined) reel.religion = religion;
    // if (location !== undefined) reel.location = location; // Commented out - Post model doesn't have location field
    // if (collaborators !== undefined) reel.collaborators = collaborators; // Commented out

    // Handle song updates - commented out as Post model doesn't have song field
    // if (songTitle !== undefined || songArtist !== undefined || songDuration !== undefined || files) {
    //   if (!reel.song) {
    //     reel.song = {
    //       title: songTitle || 'Untitled Song',
    //       artist: songArtist || 'Unknown Artist',
    //       duration: songDuration || 0,
    //       audioUrl: '',
    //       thumbnailUrl: ''
    //     };
    //   } else {
    //     if (songTitle !== undefined) reel.song.title = songTitle;
    //     if (songArtist !== undefined) reel.song.artist = songArtist;
    //     if (songDuration !== undefined) reel.song.duration = songDuration;
    //   }

    //   // Update audio file if uploaded
    //   if (files && files.audioFile) {
    //     // Delete old audio file if exists
    //     if (reel.song.audioUrl) {
    //       await deleteFileByUrl(reel.song.audioUrl);
    //     }
        
    //     const audioFile = Array.isArray(files.audioFile) ? files.audioFile[0] : files.audioFile;
    //     const audioInfo = getFileInfo(audioFile);
    //     reel.song.audioUrl = audioInfo.publicUrl;
    //   }

    //   // Update thumbnail if uploaded
    //   if (files && files.thumbnailFile) {
    //     // Delete old thumbnail if exists
    //     if (reel.song.thumbnailUrl) {
    //       await deleteFileByUrl(reel.song.thumbnailUrl);
    //     }
        
    //     const thumbnailFile = Array.isArray(files.thumbnailFile) ? files.thumbnailFile[0] : files.thumbnailFile;
    //     const thumbnailInfo = getFileInfo(thumbnailFile);
    //     reel.song.thumbnailUrl = thumbnailInfo.publicUrl;
    //   }
    // }

    // Handle media files update - commented out as Post model doesn't have media field
    // if (files && files.mediaFiles) {
    //   // Delete old media files
    //   for (const media of reel.media) {
    //     if (media.storageType === 'local') {
    //       await deleteFileByUrl(media.publicUrl);
    //     }
    //   }

    //   // Process new media files
    //   const files = Array.isArray(files.mediaFiles) ? files.mediaFiles : [files.mediaFiles];
    //   const newMediaFiles = [];
      
    //   for (const file of files) {
    //     const fileInfo = getFileInfo(file);
    //     newMediaFiles.push({
    //       fileName: fileInfo.fileName,
    //       filePath: fileInfo.filePath,
    //       publicUrl: fileInfo.publicUrl,
    //       fileSize: fileInfo.fileSize,
    //       mimeType: fileInfo.mimeType,
    //       storageType: fileInfo.storageType,
    //       isPublic: fileInfo.isPublic,
    //       type: fileInfo.type
    //     });
    //   }
      
    //   reel.media = newMediaFiles;
    // }

    await reel.save();

    // Populate author details
    await reel.populate('author', 'username fullName avatar');
    // await reel.populate('mentions', 'username fullName avatar'); // Commented out
    // await reel.populate('collaborators', 'username fullName avatar'); // Commented out

    return res.status(200).json({
      success: true,
      message: 'Reel updated successfully',
      data: { reel }
    });

  } catch (error: any) {
    console.error('Update reel error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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

    const reel = await Post.findById(reelId);
    if (!reel || !reel.isActive || reel.type !== 'reel') {
      return res.status(404).json({
        success: false,
        message: 'Reel not found'
      });
    }

    // Check if user is author or collaborator
    // Check if user is author - collaborators check commented out
    if (reel.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reels or reels you collaborate on'
      });
    }

    // Delete media files - commented out as Post model doesn't have media field
    // for (const media of reel.media) {
    //   if (media.storageType === 'local') {
    //     await deleteFileByUrl(media.publicUrl);
    //   }
    // }

    // Delete song files if they exist - commented out as Post model doesn't have song field
    // if (reel.song) {
    //   if (reel.song.audioUrl) {
    //     await deleteFileByUrl(reel.song.audioUrl);
    //   }
    //   if (reel.song.thumbnailUrl) {
    //     await deleteFileByUrl(reel.song.thumbnailUrl);
    //   }
    // }

    // Soft delete the reel
    reel.isActive = false;
    reel.deletedAt = new Date();
    await reel.save();

    return res.status(200).json({
      success: true,
      message: 'Reel deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete reel error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
