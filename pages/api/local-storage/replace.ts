import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    console.log('🔄 Starting file replace operation...');

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

    // Get target file info from query parameters
    const { targetFilePath, targetFileName, targetFolder: queryTargetFolder } = req.query;

    if (!targetFilePath && !targetFileName) {
      return res.status(400).json({
        success: false,
        message: 'Target file path or file name is required'
      });
    }

    let existingFilePath: string;

    if (targetFilePath) {
      // If full path is provided, validate it belongs to the user
      const userDir = path.join(process.cwd(), 'public', 'uploads', userId);
      const resolvedPath = path.resolve(targetFilePath as string);
      const resolvedUserDir = path.resolve(userDir);
      
      if (!resolvedPath.startsWith(resolvedUserDir)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: File does not belong to user'
        });
      }
      
      existingFilePath = resolvedPath;
    } else {
      // If only fileName is provided, construct the path
      const folderName = queryTargetFolder || 'general';
      existingFilePath = path.join(process.cwd(), 'public', 'uploads', userId, folderName as string, targetFileName as string);
    }

    // Check if target file exists
    if (!fs.existsSync(existingFilePath)) {
      return res.status(404).json({
        success: false,
        message: 'Target file not found'
      });
    }

    console.log('📁 Target file found:', existingFilePath);

    // Get existing file info
    const existingFileStats = fs.statSync(existingFilePath);
    const existingFileName = path.basename(existingFilePath);
    const existingFolder = path.basename(path.dirname(existingFilePath));
    const existingRelativePath = path.relative(path.join(process.cwd(), 'public'), existingFilePath);
    const existingPublicUrl = `/${existingRelativePath.replace(/\\/g, '/')}`;

    console.log('📋 Existing file info:', {
      fileName: existingFileName,
      folder: existingFolder,
      size: existingFileStats.size,
      modifiedAt: existingFileStats.mtime
    });

    // Parse multipart form data for new file
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

    if (!files.file || !Array.isArray(files.file)) {
      return res.status(400).json({ 
        success: false, 
        message: 'No new file provided for replacement' 
      });
    }

    const newFile = files.file[0];

    // Check if new file has content
    if (!newFile.filepath || !newFile.size || newFile.size === 0) {
      return res.status(400).json({
        success: false,
        message: 'New file appears empty'
      });
    }

    console.log('📤 New file received:', {
      originalName: newFile.originalFilename,
      size: newFile.size,
      mimetype: newFile.mimetype
    });

    // Create backup of original file (optional)
    const backupPath = existingFilePath + '.backup.' + Date.now();
    try {
      fs.copyFileSync(existingFilePath, backupPath);
      console.log('💾 Backup created:', backupPath);
    } catch (backupError) {
      console.log('⚠️ Warning: Could not create backup:', backupError);
    }

    // Determine if we need to change folder based on new file type
    let targetFolder = existingFolder;
    let targetDir = path.dirname(existingFilePath);
    
    if (newFile.mimetype?.includes('image/')) {
      targetFolder = 'images';
    } else if (newFile.mimetype?.includes('video/')) {
      targetFolder = 'videos';
    } else if (newFile.mimetype?.includes('audio/')) {
      targetFolder = 'audio';
    } else if (newFile.mimetype?.includes('application/pdf') || newFile.mimetype?.includes('application/')) {
      targetFolder = 'documents';
    } else {
      targetFolder = 'general';
    }

    // If folder type changed, move to appropriate folder
    if (targetFolder !== existingFolder) {
      const newTargetDir = path.join(process.cwd(), 'public', 'uploads', userId, targetFolder);
      
      // Create new folder if it doesn't exist
      if (!fs.existsSync(newTargetDir)) {
        fs.mkdirSync(newTargetDir, { recursive: true });
      }
      
      targetDir = newTargetDir;
    }

    // Generate new filename (keep same naming pattern)
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substr(2, 9);
    const fileExtension = path.extname(newFile.originalFilename || '');
    const newFileName = `${userId}_${timestamp}_${randomString}${fileExtension}`;
    
    // Full path for the new file
    const newFilePath = path.join(targetDir, newFileName);

    console.log('📁 New file path:', newFilePath);

    // Copy new file to target directory
    fs.copyFileSync(newFile.filepath, newFilePath);
    
    // Get new file stats
    const newFileStats = fs.statSync(newFilePath);
    
    // Generate new public URL
    const newRelativePath = path.relative(path.join(process.cwd(), 'public'), newFilePath);
    const newPublicUrl = `/${newRelativePath.replace(/\\/g, '/')}`;

    // Delete the old file
    try {
      fs.unlinkSync(existingFilePath);
      console.log('🗑️ Old file deleted:', existingFilePath);
    } catch (deleteError) {
      console.error('❌ Error deleting old file:', deleteError);
      // If we can't delete the old file, delete the new one to maintain consistency
      fs.unlinkSync(newFilePath);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete old file',
        error: 'Could not complete file replacement'
      });
    }

    // Clean up temporary files
    try {
      if (newFile.filepath && fs.existsSync(newFile.filepath)) {
        fs.unlinkSync(newFile.filepath);
      }
    } catch (cleanupError) {
      console.error('Error cleaning up temporary file:', cleanupError);
    }

    // Check if the old folder is now empty and remove it if so
    if (targetFolder !== existingFolder) {
      const oldFolderPath = path.dirname(existingFilePath);
      try {
        const remainingFiles = fs.readdirSync(oldFolderPath);
        if (remainingFiles.length === 0) {
          fs.rmdirSync(oldFolderPath);
          console.log(`Removed empty folder: ${oldFolderPath}`);
        }
      } catch (folderError) {
        console.log('Could not remove old folder (may not be empty):', folderError);
      }
    }

    console.log('✅ File replacement completed successfully');

    // Return results
    res.json({
      success: true,
      message: 'File replaced successfully',
      data: {
        replacedFile: {
          oldFile: {
            fileName: existingFileName,
            filePath: existingFilePath,
            publicUrl: existingPublicUrl,
            size: existingFileStats.size,
            folder: existingFolder,
            replacedAt: new Date()
          },
          newFile: {
            originalName: newFile.originalFilename,
            fileName: newFileName,
            filePath: newFilePath,
            publicUrl: newPublicUrl,
            size: newFileStats.size,
            mimetype: newFile.mimetype,
            folder: targetFolder,
            uploadedAt: new Date(),
            uploadedBy: {
              userId: userId,
              username: userId, // Using userId as username for simplicity
              fullName: userId
            }
          },
          backup: {
            backupPath: backupPath,
            backupCreated: fs.existsSync(backupPath)
          }
        },
        storageInfo: {
          type: 'local',
          basePath: '/uploads',
          userPath: `/uploads/${userId}`,
          newFolder: targetFolder
        }
      }
    });

  } catch (error: any) {
    console.error('Local file replace error:', error);
    res.status(500).json({
      success: false,
      message: 'File replacement failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
