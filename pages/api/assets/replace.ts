import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import User from '../../../lib/models/User';

export const config = {
  api: {
    bodyParser: false,
  },
};

// MongoDB connection function
async function connectToDatabase() {
  if (mongoose.connections[0].readyState) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI!, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      family: 4,
      retryWrites: true,
      w: 1
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    console.log('🔄 Starting assets replace...');

    // Connect to MongoDB
    await connectToDatabase();

    // Get user ID from query parameters
    const userId = req.query.userId as string;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required. Provide userId in query params' 
      });
    }

    // Get user details from database to get username
    const user = await User.findById(userId).select('username fullName').lean();
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const username = user.username || user.fullName || userId;
    console.log('👤 User found:', { userId, username });

    // Check if content-type is multipart/form-data
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return res.status(400).json({
        success: false,
        message: 'Content-Type must be multipart/form-data',
        receivedContentType: contentType
      });
    }

    // Parse multipart form data
    const form = formidable({
      maxFileSize: 100 * 1024 * 1024, // 100MB max file size
      allowEmptyFiles: false,
      multiples: false,
      keepExtensions: true,
      maxFields: 10,
      maxFieldsSize: 20 * 1024 * 1024,
      filter: ({ mimetype }: any) => {
        console.log('🔍 File mimetype:', mimetype);
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

    console.log('📋 Parsed fields:', fields);
    console.log('📁 Parsed files:', Object.keys(files));

    // Get file to replace
    const fileToReplace = files.file as any;
    if (!fileToReplace) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file provided for replacement' 
      });
    }

    // Get existing file name from query or body
    const existingFileName = req.query.existingFileName as string || req.body?.existingFileName;
    const existingFolder = req.query.existingFolder as string || req.body?.existingFolder;

    if (!existingFileName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Existing file name is required' 
      });
    }

    // Create user directory path using username
    const userDir = path.join(process.cwd(), 'public', 'assets', username);
    
    if (!fs.existsSync(userDir)) {
      return res.status(404).json({ 
        success: false, 
        message: 'User assets directory not found' 
      });
    }

    // Find existing file
    let existingFilePath = '';
    let foundFolder = '';

    if (existingFolder) {
      // If folder is specified, look in that specific folder
      const folderPath = path.join(userDir, existingFolder);
      if (fs.existsSync(folderPath)) {
        existingFilePath = path.join(folderPath, existingFileName);
        if (fs.existsSync(existingFilePath)) {
          foundFolder = existingFolder;
        }
      }
    } else {
      // If no folder specified, search in all folders
      const folders = ['images', 'videos', 'audio', 'documents', 'general'];
      for (const folderName of folders) {
        const folderPath = path.join(userDir, folderName);
        if (fs.existsSync(folderPath)) {
          const filePath = path.join(folderPath, existingFileName);
          if (fs.existsSync(filePath)) {
            existingFilePath = filePath;
            foundFolder = folderName;
            break;
          }
        }
      }
    }

    if (!existingFilePath || !fs.existsSync(existingFilePath)) {
      return res.status(404).json({ 
        success: false, 
        message: 'Existing file not found',
        debug: {
          existingFileName: existingFileName,
          existingFolder: existingFolder,
          userDir: userDir,
          searchedIn: existingFolder ? [existingFolder] : ['images', 'videos', 'audio', 'documents', 'general']
        }
      });
    }

    // Get existing file stats
    const existingFileStats = fs.statSync(existingFilePath);
    const existingPublicUrl = `/assets/${username}/${foundFolder}/${existingFileName}`;

    // Determine new file folder based on file type
    let newFolder = foundFolder;
    let newTargetDir = path.join(userDir, foundFolder);
    
    if (fileToReplace.mimetype?.includes('image/')) {
      newFolder = 'images';
      newTargetDir = path.join(userDir, 'images');
    } else if (fileToReplace.mimetype?.includes('video/')) {
      newFolder = 'videos';
      newTargetDir = path.join(userDir, 'videos');
    } else if (fileToReplace.mimetype?.includes('audio/')) {
      newFolder = 'audio';
      newTargetDir = path.join(userDir, 'audio');
    } else if (fileToReplace.mimetype?.includes('application/pdf') || fileToReplace.mimetype?.includes('application/')) {
      newFolder = 'documents';
      newTargetDir = path.join(userDir, 'documents');
    } else {
      newFolder = 'general';
      newTargetDir = path.join(userDir, 'general');
    }

    // Create new target directory if it doesn't exist
    if (!fs.existsSync(newTargetDir)) {
      fs.mkdirSync(newTargetDir, { recursive: true });
    }

    // Generate new filename using username
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substr(2, 9);
    const fileExtension = path.extname(fileToReplace.originalFilename || '');
    const newFileName = `${username}_${timestamp}_${randomString}${fileExtension}`;
    
    // Full path for the new file
    const newFilePath = path.join(newTargetDir, newFileName);
    
    // Copy new file to target directory
    fs.copyFileSync(fileToReplace.filepath, newFilePath);
    
    // Get new file stats
    const newFileStats = fs.statSync(newFilePath);
    
    // Generate new public URL
    const newPublicUrl = `/assets/${username}/${newFolder}/${newFileName}`;

    // Delete the old file
    fs.unlinkSync(existingFilePath);

    // Clean up temporary file
    try {
      if (fileToReplace.filepath && fs.existsSync(fileToReplace.filepath)) {
        fs.unlinkSync(fileToReplace.filepath);
      }
    } catch (cleanupError) {
      console.error('Error cleaning up temporary file:', cleanupError);
    }

    console.log(`✅ Successfully replaced: ${existingFileName} with ${newFileName}`);

    // Return success response
    res.json({
      success: true,
      message: 'File replaced successfully',
      data: {
        replacedFile: {
          oldFileName: existingFileName,
          oldPath: existingFilePath,
          oldPublicUrl: existingPublicUrl,
          oldSize: existingFileStats.size,
          oldFolder: foundFolder
        },
        newFile: {
          fileName: newFileName,
          localPath: newFilePath,
          publicUrl: newPublicUrl,
          size: newFileStats.size,
          mimetype: fileToReplace.mimetype,
          folder: newFolder,
          replacedAt: new Date(),
          replacedBy: {
            userId: userId,
            username: username,
            fullName: user.fullName
          }
        },
        storageInfo: {
          type: 'assets',
          basePath: '/assets',
          userPath: `/assets/${username}`,
          username: username,
          userId: userId
        }
      }
    });

  } catch (error: any) {
    console.error('Assets replace error:', error);
    res.status(500).json({
      success: false,
      message: 'Assets replace failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}
