import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import { ChatThread, Message } from '../../../lib/models/Chat';
import { verifyToken } from '../../../lib/middleware/auth';
import { validateAndCreateObjectIds, isValidObjectId } from '../../../lib/utils/objectId';
import mongoose from 'mongoose';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

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

    // Parse multipart form data
    const form = formidable({
      maxFileSize: 100 * 1024 * 1024, // 100MB max file size
      allowEmptyFiles: false,
      filter: ({ mimetype }: any) => {
        // Allow common file types
        return mimetype && (
          mimetype.includes('image/') ||
          mimetype.includes('video/') ||
          mimetype.includes('audio/') ||
          mimetype.includes('application/pdf') ||
          mimetype.includes('application/msword') ||
          mimetype.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') ||
          mimetype.includes('text/')
        );
      }
    });

    const [fields, files] = await form.parse(req);

    // Extract form fields
    const toUserId = Array.isArray(fields.toUserId) ? fields.toUserId[0] : fields.toUserId;
    const content = Array.isArray(fields.content) ? fields.content[0] : fields.content;
    const messageType = Array.isArray(fields.messageType) ? fields.messageType[0] : fields.messageType || 'text';
    const replyTo = Array.isArray(fields.replyTo) ? fields.replyTo[0] : fields.replyTo;

    if (!toUserId || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'toUserId and content are required' 
      });
    }

    // Validate message type
    const validMessageTypes = ['text', 'image', 'video', 'audio', 'file', 'location'];
    if (!validMessageTypes.includes(messageType)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid message type' 
      });
    }

    // Validate and create ObjectIds
    let objectIds;
    let participants;
    
    try {
      objectIds = validateAndCreateObjectIds({
        userId,
        toUserId
      });

      // Check if user is trying to send message to themselves
      if (objectIds.userId.equals(objectIds.toUserId)) {
        return res.status(400).json({
          success: false,
          message: 'Cannot send message to yourself'
        });
      }

      participants = [objectIds.userId, objectIds.toUserId].sort();

    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Find or create chat thread
    let thread = await ChatThread.findOne({ participants: { $all: participants } });
    
    if (!thread) {
      thread = await ChatThread.create({ 
        participants, 
        lastMessageAt: new Date(),
        unreadCount: { [objectIds.toUserId.toString()]: 0 }
      });
    }

    // Handle media upload if file is present
    let mediaInfo = null;
    let mediaUrl = null;

    if (files.file && Array.isArray(files.file) && files.file.length > 0) {
      const file = files.file[0];
      
      if (file.size && file.size > 0) {
        // Create user directory structure
        const userDir = path.join(process.cwd(), 'public', 'uploads', userId);
        const imagesDir = path.join(userDir, 'images');
        const videosDir = path.join(userDir, 'videos');
        const audioDir = path.join(userDir, 'audio');
        const documentsDir = path.join(userDir, 'documents');
        const generalDir = path.join(userDir, 'general');

        // Create directories if they don't exist
        [userDir, imagesDir, videosDir, audioDir, documentsDir, generalDir].forEach(dir => {
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
        });

        // Determine folder based on file type
        let folder = 'general';
        let targetDir = generalDir;
        
        if (file.mimetype?.includes('image/')) {
          folder = 'images';
          targetDir = imagesDir;
        } else if (file.mimetype?.includes('video/')) {
          folder = 'videos';
          targetDir = videosDir;
        } else if (file.mimetype?.includes('audio/')) {
          folder = 'audio';
          targetDir = audioDir;
        } else if (file.mimetype?.includes('application/pdf') || file.mimetype?.includes('application/')) {
          folder = 'documents';
          targetDir = documentsDir;
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substr(2, 9);
        const fileExtension = path.extname(file.originalFilename || '');
        const fileName = `${userId}_${timestamp}_${randomString}${fileExtension}`;
        
        // Full path for the file
        const filePath = path.join(targetDir, fileName);
        
        // Copy file to target directory
        fs.copyFileSync(file.filepath, filePath);
        
        // Get file stats
        const fileStats = fs.statSync(filePath);
        
        // Generate public URL
        const publicUrl = `/uploads/${userId}/${folder}/${fileName}`;
        
        mediaInfo = {
          fileName: fileName,
          originalName: file.originalFilename,
          localPath: filePath,
          publicUrl: publicUrl,
          size: fileStats.size,
          mimetype: file.mimetype,
          folder: folder,
          uploadedAt: new Date()
        };

        mediaUrl = publicUrl;

        // Clean up temporary file
        try {
          if (file.filepath && fs.existsSync(file.filepath)) {
            fs.unlinkSync(file.filepath);
          }
        } catch (cleanupError) {
          console.error('Error cleaning up temporary file:', cleanupError);
        }
      }
    }

    // Create message
    const messageData: any = {
      thread: thread._id,
      sender: objectIds.userId,
      recipient: objectIds.toUserId,
      content: content.trim(),
      messageType,
      isRead: false
    };

    if (mediaUrl) {
      messageData.mediaUrl = mediaUrl;
      messageData.mediaInfo = mediaInfo;
    }
    if (replyTo && isValidObjectId(replyTo)) {
      messageData.replyTo = new mongoose.Types.ObjectId(replyTo);
    }

    const message = await Message.create(messageData);

    // Update thread
    thread.lastMessage = message._id;
    thread.lastMessageAt = new Date();
    
    // Increment unread count for recipient
    const currentUnread = thread.unreadCount.get(objectIds.toUserId.toString()) || 0;
    thread.unreadCount.set(objectIds.toUserId.toString(), currentUnread + 1);
    
    await thread.save();

    // Populate message with sender info for response
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username fullName avatar')
      .populate('recipient', 'username fullName avatar')
      .populate('replyTo', 'content sender')
      .lean();

    res.status(201).json({ 
      success: true, 
      message: 'Message sent successfully',
      data: {
        message: populatedMessage,
        threadId: thread._id,
        mediaInfo: mediaInfo ? {
          fileName: mediaInfo.fileName,
          originalName: mediaInfo.originalName,
          publicUrl: mediaInfo.publicUrl,
          size: mediaInfo.size,
          mimetype: mediaInfo.mimetype,
          folder: mediaInfo.folder
        } : null
      }
    });

  } catch (error: any) {
    console.error('Send message with media error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
