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
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    console.log('📤 Starting assets upload...');

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

    if (!files.file || !Array.isArray(files.file)) {
      return res.status(400).json({ 
        success: false, 
        message: 'No files uploaded' 
      });
    }

    const uploadedFiles = [];
    const errors = [];

    // Create user directory structure in public/assets folder
    const userDir = path.join(process.cwd(), 'public', 'assets', userId);
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

    // Process each file
    for (const file of files.file) {
      try {
        // Check if file has content
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
        const publicUrl = `/assets/${userId}/${folder}/${fileName}`;
        
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
            username: userId, // Using userId as username for simplicity
            fullName: userId
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
    for (const file of files.file) {
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
          total: files.file.length,
          successful: uploadedFiles.length,
          failed: errors.length
        },
        storageInfo: {
          type: 'assets',
          basePath: '/assets',
          userPath: `/assets/${userId}`
        }
      }
    });

  } catch (error: any) {
    console.error('Assets file upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Assets file upload failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
