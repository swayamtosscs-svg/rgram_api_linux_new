import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import connectDB from '../../../lib/database';
import User from '../../../lib/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    console.log('🗑️ Starting assets delete operation...');

    // Connect to database
    await connectDB();

    // Get user ID from query parameters or headers
    const userId = req.query.userId as string || req.headers['x-user-id'] as string;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required. Provide userId in query params or x-user-id header' 
      });
    }

    // Validate user ID format (basic validation)
    if (userId.length < 3) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid user ID format' 
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

    // Get file path from request body or query parameters
    const { filePath, fileName: bodyFileName, folder: bodyFolder } = req.body;
    const queryFileName = req.query.fileName as string;
    const queryFolder = req.query.folder as string;
    
    const fileName = bodyFileName || queryFileName;
    const folder = bodyFolder || queryFolder;

    if (!filePath && !fileName) {
      return res.status(400).json({
        success: false,
        message: 'File path or file name is required'
      });
    }

    let targetFilePath: string = '';

    if (filePath) {
      // If full path is provided, validate it belongs to the user
      const userDir = path.join(process.cwd(), 'public', 'assets', username);
      const resolvedPath = path.resolve(filePath);
      const resolvedUserDir = path.resolve(userDir);
      
      if (!resolvedPath.startsWith(resolvedUserDir)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: File does not belong to user'
        });
      }
      
      targetFilePath = resolvedPath;
    } else {
      // If only fileName is provided, try to find the file in all folders
      if (!folder) {
        const userDir = path.join(process.cwd(), 'public', 'assets', username);
        
        // Search for the file in all folders
        try {
          const folders = fs.readdirSync(userDir);
          let found = false;
          
          for (const folderName of folders) {
            const potentialPath = path.join(userDir, folderName, fileName);
            if (fs.existsSync(potentialPath)) {
              targetFilePath = potentialPath;
              found = true;
              console.log(`🔍 Found file in folder: ${folderName}`);
              break;
            }
          }
          
          if (!found) {
            return res.status(404).json({
              success: false,
              message: 'File not found in any folder'
            });
          }
        } catch (error) {
          return res.status(404).json({
            success: false,
            message: 'User directory not found'
          });
        }
      } else {
        // If folder is provided, use it
        const folderName = folder;
        targetFilePath = path.join(process.cwd(), 'public', 'assets', username, folderName, fileName);
      }
    }

    // Check if file exists
    if (!targetFilePath || !fs.existsSync(targetFilePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    console.log('📁 Target file found:', targetFilePath);

    // Get file info before deletion
    const fileStats = fs.statSync(targetFilePath);
    const relativePath = path.relative(path.join(process.cwd(), 'public'), targetFilePath);
    const publicUrl = `/${relativePath.replace(/\\/g, '/')}`;

    // Delete the file
    fs.unlinkSync(targetFilePath);
    console.log('✅ File deleted successfully:', targetFilePath);

    // Check if the folder is now empty and remove it if so
    const folderPath = path.dirname(targetFilePath);
    try {
      const remainingFiles = fs.readdirSync(folderPath);
      if (remainingFiles.length === 0) {
        fs.rmdirSync(folderPath);
        console.log(`🗂️ Removed empty folder: ${folderPath}`);
      }
    } catch (folderError) {
      console.log('Could not remove folder (may not be empty):', folderError);
    }

    // Check if user directory is now empty and remove it if so
    const userDir = path.join(process.cwd(), 'public', 'assets', username);
    try {
      const remainingFolders = fs.readdirSync(userDir);
      if (remainingFolders.length === 0) {
        fs.rmdirSync(userDir);
        console.log(`🗂️ Removed empty user directory: ${userDir}`);
      }
    } catch (userDirError) {
      console.log('Could not remove user directory (may not be empty):', userDirError);
    }

    res.json({
      success: true,
      message: 'Asset deleted successfully',
      data: {
        deletedFile: {
          fileName: path.basename(targetFilePath),
          filePath: targetFilePath,
          publicUrl: publicUrl,
          size: fileStats.size,
          deletedAt: new Date(),
          deletedBy: {
            userId: userId,
            username: username,
            fullName: user.fullName || username
          }
        }
      }
    });

  } catch (error: any) {
    console.error('Assets delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete asset',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
