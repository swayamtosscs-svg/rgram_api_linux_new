import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import Post from '../../../lib/models/Post';
import Notification from '../../../lib/models/Notification';
import { verifyToken } from '../../../lib/middleware/auth';
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
      return mediaUploadMiddleware([{ name: 'mediaFiles', maxCount: 10 }])(req, res, () => createStory(req, res, decoded.userId));
    case 'GET':
      return getStories(req, res, decoded.userId);
    case 'DELETE':
      return deleteStory(req, res, decoded.userId);
    default:
      return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}

export { config };

// Create Story
async function createStory(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { content, mentions, hashtags, location, songTitle, songArtist, songDuration } = req.body;

    // Validate that story has media files
    const files = req.files as any;
    if (!files || !files.mediaFiles) {
      return res.status(400).json({
        success: false,
        message: 'Story must contain media files'
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
    const extractedMentions = extractMentions(content || '');
    const extractedHashtags = extractHashtags(content || '');

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

    // Also check if song files are uploaded without title/artist (for standalone song stories)
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

    // Create story with 24-hour expiration
    const story = await Post.create({
      author: userId,
      content: content || '',
      media: mediaFiles,
      type: 'story',
      song: songData,
      mentions: [...extractedMentions, ...(mentions || [])],
      hashtags: [...extractedHashtags, ...(hashtags || [])],
      location,
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
      reported: false,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
    });

    // Send notifications for mentions
    const allMentions = [...extractedMentions, ...(mentions || [])];
    for (const mentionId of allMentions) {
      await Notification.create({
        recipient: mentionId,
        sender: userId,
        type: 'mention',
        content: 'You were mentioned in a story',
        relatedStory: story._id
      });
    }

    // Populate author details
    await story.populate('author', 'username fullName avatar');
    await story.populate('mentions', 'username fullName avatar');

    return res.status(201).json({
      success: true,
      message: 'Story created successfully',
      data: { story }
    });

  } catch (error: any) {
    console.error('Create story error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Get Stories
async function getStories(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { author, page = 1, limit = 10 } = req.query;

    const query: any = { 
      type: 'story',
      isActive: true,
      expiresAt: { $gt: new Date() } // Only get non-expired stories
    };
    
    if (author) {
      query.author = author;
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const stories = await Post.find(query)
      .populate('author', 'username fullName avatar')
      .populate('mentions', 'username fullName avatar')
      .populate('comments.author', 'username fullName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Post.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: {
        stories,
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
    console.error('Get stories error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Delete Story
async function deleteStory(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { storyId } = req.query;

    if (!storyId) {
      return res.status(400).json({
        success: false,
        message: 'Story ID is required'
      });
    }

    const story = await Post.findById(storyId);
    if (!story || !story.isActive || story.type !== 'post') {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    // Check if user is author
    if (story.author.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own stories'
      });
    }

    // Delete media files
    const allMedia = [...(story.images || []), ...(story.videos || [])];
    for (const mediaUrl of allMedia) {
      if (mediaUrl && mediaUrl.includes('/assets/')) {
        await deleteFileByUrl(mediaUrl);
      }
    }

    // Delete song files if they exist - commented out as Post model doesn't have song field
    // if (story.song) {
    //   if (story.song.audioUrl) {
    //     await deleteFileByUrl(story.song.audioUrl);
    //   }
    //   if (story.song.thumbnailUrl) {
    //     await deleteFileByUrl(story.song.thumbnailUrl);
    //   }
    // }

    // Soft delete the story
    story.isActive = false;
    story.deletedAt = new Date();
    await story.save();

    return res.status(200).json({
      success: true,
      message: 'Story deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete story error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
