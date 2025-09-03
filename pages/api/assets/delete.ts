import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    console.log('🗑️ Starting assets delete operation...');

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

    // Get file path from request body
    const { filePath, fileName, folder } = req.body;

    if (!filePath && !fileName) {
      return res.status(400).json({
        success: false,
        message: 'File path or file name is required'
      });
    }

    let targetFilePath: string;

    if (filePath) {
      // If full path is provided, validate it belongs to the user
      const userDir = path.join(process.cwd(), 'public', 'assets', userId);
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
      // If only fileName is provided, construct the path
      const folderName = folder || 'general';
      targetFilePath = path.join(process.cwd(), 'public', 'assets', userId, folderName, fileName);
    }

    // Check if file exists
    if (!fs.existsSync(targetFilePath)) {
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
    const userDir = path.join(process.cwd(), 'public', 'assets', userId);
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
            username: userId, // Using userId as username for simplicity
            fullName: userId
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
