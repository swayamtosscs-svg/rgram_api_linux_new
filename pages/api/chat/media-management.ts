import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import { Message } from '../../../lib/models/Chat';
import { verifyToken } from '@/lib/middleware/auth';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectDB();
    
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
      case 'GET':
        return await getMediaFiles(req, res, userId);
      case 'DELETE':
        return await deleteMediaFile(req, res, userId);
      case 'POST':
        return await cleanupOrphanedMedia(req, res, userId);
      default:
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Media management API error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Get Media Files for User
async function getMediaFiles(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { messageId, folder } = req.query;

  try {
    let query: any = {
      sender: userId,
      isDeleted: false,
      mediaInfo: { $exists: true }
    };

    if (messageId) {
      query._id = messageId;
    }

    const messages = await Message.find(query)
      .select('mediaInfo messageType createdAt content')
      .sort({ createdAt: -1 })
      .lean();

    // Filter by folder if specified
    let filteredMessages = messages;
    if (folder) {
      filteredMessages = messages.filter(msg => 
        msg.mediaInfo && msg.mediaInfo.folder === folder
      );
    }

    // Group by folder
    const mediaByFolder: {
      images: any[];
      videos: any[];
      audio: any[];
      documents: any[];
      general: any[];
    } = {
      images: [],
      videos: [],
      audio: [],
      documents: [],
      general: []
    };

    filteredMessages.forEach(msg => {
      if (msg.mediaInfo) {
        const mediaData = {
          messageId: msg._id,
          fileName: msg.mediaInfo.fileName,
          originalName: msg.mediaInfo.originalName,
          publicUrl: msg.mediaInfo.publicUrl,
          size: msg.mediaInfo.size,
          mimetype: msg.mediaInfo.mimetype,
          folder: msg.mediaInfo.folder,
          uploadedAt: msg.mediaInfo.uploadedAt,
          messageType: msg.messageType,
          messageContent: msg.content,
          createdAt: msg.createdAt
        };

        const folder = msg.mediaInfo.folder as keyof typeof mediaByFolder;
        if (folder && mediaByFolder[folder]) {
          mediaByFolder[folder].push(mediaData);
        }
      }
    });

    // Calculate total size
    const totalSize = filteredMessages.reduce((sum, msg) => 
      sum + (msg.mediaInfo?.size || 0), 0
    );

    res.json({
      success: true,
      data: {
        mediaByFolder,
        summary: {
          totalFiles: filteredMessages.length,
          totalSize: totalSize,
          totalSizeFormatted: formatBytes(totalSize),
          folders: Object.keys(mediaByFolder).map(folder => ({
            name: folder,
            count: mediaByFolder[folder as keyof typeof mediaByFolder].length,
            size: mediaByFolder[folder as keyof typeof mediaByFolder].reduce((sum, file) => sum + file.size, 0)
          }))
        }
      }
    });

  } catch (error: any) {
    console.error('Get media files error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get media files',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Delete Media File
async function deleteMediaFile(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { messageId, fileName, deleteFromDB = false } = req.body;

  if (!messageId && !fileName) {
    return res.status(400).json({
      success: false,
      message: 'Either messageId or fileName is required'
    });
  }

  try {
    let message = null;
    
    if (messageId) {
      message = await Message.findOne({
        _id: messageId,
        sender: userId,
        isDeleted: false,
        mediaInfo: { $exists: true }
      });
    } else if (fileName) {
      message = await Message.findOne({
        sender: userId,
        isDeleted: false,
        'mediaInfo.fileName': fileName
      });
    }

    if (!message || !message.mediaInfo) {
      return res.status(404).json({
        success: false,
        message: 'Media file not found or access denied'
      });
    }

    const mediaInfo = message.mediaInfo;
    let fileDeleted = false;
    let dbUpdated = false;

    // Delete physical file
    try {
      if (fs.existsSync(mediaInfo.localPath)) {
        fs.unlinkSync(mediaInfo.localPath);
        fileDeleted = true;
        console.log(`✅ Deleted media file: ${mediaInfo.localPath}`);
      } else {
        console.log(`⚠️ File not found on disk: ${mediaInfo.localPath}`);
      }
    } catch (fileError) {
      console.error('Error deleting media file:', fileError);
    }

    // Update database if requested
    if (deleteFromDB) {
      if (message.messageType === 'text') {
        // If it's a text message with media, just remove media info
        message.mediaInfo = undefined;
        message.mediaUrl = undefined;
      } else {
        // If it's a media message, mark as deleted
        message.isDeleted = true;
        message.deletedAt = new Date();
        message.content = '[Media deleted]';
        message.mediaInfo = undefined;
        message.mediaUrl = undefined;
      }
      
      await message.save();
      dbUpdated = true;
    }

    res.json({
      success: true,
      message: 'Media file processed successfully',
      data: {
        messageId: message._id,
        fileName: mediaInfo.fileName,
        originalName: mediaInfo.originalName,
        fileDeleted,
        dbUpdated,
        actions: {
          fileDeleted: fileDeleted,
          databaseUpdated: dbUpdated,
          messageDeleted: deleteFromDB && message.messageType !== 'text'
        }
      }
    });

  } catch (error: any) {
    console.error('Delete media file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete media file',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Cleanup Orphaned Media Files
async function cleanupOrphanedMedia(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { dryRun = true } = req.body;

  try {
    // Get all media files referenced in database
    const messagesWithMedia = await Message.find({
      sender: userId,
      mediaInfo: { $exists: true }
    }).select('mediaInfo').lean();

    const referencedFiles = new Set();
    messagesWithMedia.forEach(msg => {
      if (msg.mediaInfo && msg.mediaInfo.localPath) {
        referencedFiles.add(msg.mediaInfo.localPath);
      }
    });

    // Get all files in user's upload directory
    const userDir = path.join(process.cwd(), 'public', 'uploads', userId);
    const allFiles: Array<{
      path: string;
      name: string;
      folder: string;
      size: number;
      modified: Date;
    }> = [];
    
    if (fs.existsSync(userDir)) {
      const folders = ['images', 'videos', 'audio', 'documents', 'general'];
      
      folders.forEach(folder => {
        const folderPath = path.join(userDir, folder);
        if (fs.existsSync(folderPath)) {
          const files = fs.readdirSync(folderPath);
          files.forEach(file => {
            const filePath = path.join(folderPath, file);
            const stats = fs.statSync(filePath);
            if (stats.isFile()) {
              allFiles.push({
                path: filePath,
                name: file,
                folder: folder,
                size: stats.size,
                modified: stats.mtime
              });
            }
          });
        }
      });
    }

    // Find orphaned files
    const orphanedFiles = allFiles.filter(file => 
      !referencedFiles.has(file.path)
    );

    let deletedFiles: Array<{
      name: string;
      folder: string;
      size: number;
      sizeFormatted: string;
    }> = [];
    let totalSizeFreed = 0;

    if (!dryRun && orphanedFiles.length > 0) {
      // Actually delete orphaned files
      orphanedFiles.forEach(file => {
        try {
          fs.unlinkSync(file.path);
          deletedFiles.push({
            name: file.name,
            folder: file.folder,
            size: file.size,
            sizeFormatted: formatBytes(file.size)
          });
          totalSizeFreed += file.size;
          console.log(`✅ Deleted orphaned file: ${file.path}`);
        } catch (deleteError) {
          console.error(`❌ Error deleting ${file.path}:`, deleteError);
        }
      });
    }

    res.json({
      success: true,
      message: dryRun ? 'Orphaned files scan completed' : 'Orphaned files cleanup completed',
      data: {
        dryRun,
        summary: {
          totalFilesInDB: referencedFiles.size,
          totalFilesOnDisk: allFiles.length,
          orphanedFiles: orphanedFiles.length,
          deletedFiles: deletedFiles.length,
          totalSizeFreed: totalSizeFreed,
          totalSizeFreedFormatted: formatBytes(totalSizeFreed)
        },
        orphanedFiles: orphanedFiles.map(file => ({
          name: file.name,
          folder: file.folder,
          size: file.size,
          sizeFormatted: formatBytes(file.size),
          modified: file.modified,
          path: file.path
        })),
        deletedFiles: deletedFiles.map(file => ({
          name: file.name,
          folder: file.folder,
          size: file.size,
          sizeFormatted: formatBytes(file.size)
        }))
      }
    });

  } catch (error: any) {
    console.error('Cleanup orphaned media error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup orphaned media',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Helper function to format bytes
function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
