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
    console.log('📤 Starting assets upload...');
    console.log('📋 Request method:', req.method);
    console.log('📋 Request headers:', req.headers);
    console.log('🌍 Environment:', process.env.NODE_ENV);
    console.log('📁 Current working directory:', process.cwd());
    console.log('🔗 MongoDB URI exists:', !!process.env.MONGODB_URI);

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
      multiples: true,
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

    // Check for files
    let fileArray: any[] = [];
    if (files.file && Array.isArray(files.file)) {
      fileArray = files.file;
    } else if (files.file && !Array.isArray(files.file)) {
      fileArray = [files.file];
    } else if (files.files && Array.isArray(files.files)) {
      fileArray = files.files;
    } else if (files.files && !Array.isArray(files.files)) {
      fileArray = [files.files];
    } else {
      for (const [fieldName, fieldValue] of Object.entries(files)) {
        if (fieldValue) {
          if (Array.isArray(fieldValue)) {
            fileArray = fileArray.concat(fieldValue);
          } else {
            fileArray.push(fieldValue);
          }
        }
      }
    }

    if (fileArray.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No files uploaded. Please ensure you are sending files with field name "file" or "files"',
        debug: {
          receivedFields: Object.keys(files),
          receivedFieldsCount: Object.keys(files).length,
          contentType: req.headers['content-type'],
          method: req.method
        }
      });
    }

    const uploadedFiles = [];
    const errors = [];

    // Create user directory structure using username
    const userDir = path.join(process.cwd(), 'public', 'assets', username);
    const imagesDir = path.join(userDir, 'images');
    const videosDir = path.join(userDir, 'videos');
    const audioDir = path.join(userDir, 'audio');
    const documentsDir = path.join(userDir, 'documents');
    const generalDir = path.join(userDir, 'general');

    console.log('📁 Creating directories...');
    console.log('📁 User directory:', userDir);
    console.log('📁 Images directory:', imagesDir);

    // Create directories if they don't exist
    [userDir, imagesDir, videosDir, audioDir, documentsDir, generalDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        try {
          fs.mkdirSync(dir, { recursive: true });
          console.log(`✅ Created directory: ${dir}`);
        } catch (dirError: any) {
          console.error(`❌ Error creating directory ${dir}:`, dirError);
          throw new Error(`Failed to create directory ${dir}: ${dirError.message}`);
        }
      } else {
        console.log(`📁 Directory already exists: ${dir}`);
      }
    });

    // Process each file
    for (const file of fileArray) {
      try {
        if (!file.filepath || !file.size || file.size === 0) {
          errors.push({
            fileName: file.originalFilename || 'unknown',
            error: 'File appears empty'
          });
          continue;
        }

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

        // Generate unique filename using username
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substr(2, 9);
        const fileExtension = path.extname(file.originalFilename || '');
        const fileName = `${username}_${timestamp}_${randomString}${fileExtension}`;
        
        // Full path for the file
        const filePath = path.join(targetDir, fileName);
        
        // Copy file to target directory
        console.log(`📁 Copying file from ${file.filepath} to ${filePath}`);
        fs.copyFileSync(file.filepath, filePath);
        
        // Verify file was copied successfully
        if (!fs.existsSync(filePath)) {
          throw new Error(`File copy failed: ${filePath} does not exist`);
        }
        
        // Get file stats
        const fileStats = fs.statSync(filePath);
        console.log(`✅ File copied successfully: ${fileName} (${fileStats.size} bytes)`);
        
        // Generate public URL using username
        const publicUrl = `/assets/${username}/${folder}/${fileName}`;
        
        uploadedFiles.push({
          originalName: file.originalFilename,
          fileName: fileName,
          localPath: filePath,
          publicUrl: publicUrl,
          size: fileStats.size,
          mimetype: file.mimetype,
          folder: folder,
          uploadedAt: new Date(),
          uploadedBy: {
            userId: userId,
            username: username,
            fullName: user.fullName
          }
        });

        console.log(`✅ Successfully uploaded: ${file.originalFilename} to ${filePath}`);

      } catch (error: any) {
        console.error(`❌ Error uploading ${file.originalFilename}:`, error);
        errors.push({
          fileName: file.originalFilename || 'unknown',
          error: error.message || 'Unknown error occurred'
        });
      }
    }

    // Clean up temporary files
    for (const file of fileArray) {
      try {
        if (file.filepath && fs.existsSync(file.filepath)) {
          fs.unlinkSync(file.filepath);
        }
      } catch (cleanupError) {
        console.error('Error cleaning up temporary file:', cleanupError);
      }
    }

    // Return results
    res.json({
      success: true,
      message: `Successfully uploaded ${uploadedFiles.length} files to assets storage`,
      data: {
        uploadedFiles,
        errors: errors.length > 0 ? errors : undefined,
        summary: {
          total: fileArray.length,
          successful: uploadedFiles.length,
          failed: errors.length
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
    console.error('Assets file upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Assets file upload failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
}
