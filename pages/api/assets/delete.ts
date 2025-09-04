import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import User from '../../../lib/models/User';

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
  if (req.method !== 'DELETE') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    console.log('🗑️ Starting assets delete...');

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

    // Get file parameters from query or body
    const fileName = req.query.fileName as string || req.body?.fileName;
    const folder = req.query.folder as string || req.body?.folder;

    if (!fileName) {
      return res.status(400).json({ 
        success: false, 
        message: 'File name is required. Provide fileName in query params or body' 
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

    let targetFilePath = '';

    if (folder) {
      // If folder is specified, look in that specific folder
      const folderPath = path.join(userDir, folder);
      if (fs.existsSync(folderPath)) {
        targetFilePath = path.join(folderPath, fileName);
      }
    } else {
      // If no folder specified, search in all folders
      const folders = ['images', 'videos', 'audio', 'documents', 'general'];
      for (const folderName of folders) {
        const folderPath = path.join(userDir, folderName);
        if (fs.existsSync(folderPath)) {
          const filePath = path.join(folderPath, fileName);
          if (fs.existsSync(filePath)) {
            targetFilePath = filePath;
            break;
          }
        }
      }
    }

    if (!targetFilePath || !fs.existsSync(targetFilePath)) {
      return res.status(404).json({ 
        success: false, 
        message: 'File not found',
        debug: {
          fileName: fileName,
          folder: folder,
          userDir: userDir,
          searchedIn: folder ? [folder] : ['images', 'videos', 'audio', 'documents', 'general']
        }
      });
    }

    // Get file stats before deletion
    const fileStats = fs.statSync(targetFilePath);
    const relativePath = path.relative(process.cwd(), targetFilePath);
    const publicUrl = relativePath.replace(/\\/g, '/').replace('public/', '/');

    // Delete the file
    fs.unlinkSync(targetFilePath);

    console.log(`✅ Successfully deleted: ${fileName} from ${targetFilePath}`);

    // Return success response
    res.json({
      success: true,
      message: 'File deleted successfully',
      data: {
        deletedFile: {
          fileName: fileName,
          originalPath: targetFilePath,
          publicUrl: publicUrl,
          size: fileStats.size,
          deletedAt: new Date(),
          deletedBy: {
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
    console.error('Assets delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Assets delete failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}
