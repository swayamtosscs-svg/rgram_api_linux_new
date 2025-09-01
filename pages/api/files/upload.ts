import { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';
import { verifyToken } from '../../../lib/middleware/auth';
import connectDB from '../../../lib/database';
import User from '../../../lib/models/User';
import formidable from 'formidable';
import fs from 'fs';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }

    // Connect to database
    await connectDB();

    // Get user info
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Parse multipart form data
    const form = formidable({
      maxFileSize: 100 * 1024 * 1024, // 100MB max file size
      allowEmptyFiles: true, // Allow empty files to handle edge cases
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
        message: 'No files uploaded',
        debug: { files: files, fields: fields }
      });
    }

    // Debug: Log file information
    console.log('Files received:', JSON.stringify(files.file, null, 2));
    console.log('Fields received:', JSON.stringify(fields, null, 2));

    const uploadedFiles = [];
    const errors = [];

    // Process each file
    for (const file of files.file) {
      try {
        console.log('Processing file:', JSON.stringify(file, null, 2));
        
        // Check if file has content
        if (!file.filepath || !file.size || file.size === 0) {
          console.log('File appears empty:', file);
          errors.push({
            fileName: file.originalFilename || 'unknown',
            error: `File appears empty - Size: ${file.size}, Filepath: ${file.filepath}`
          });
          continue;
        }

        // Check if file exists and is readable
        if (!fs.existsSync(file.filepath)) {
          console.log('File does not exist:', file.filepath);
          errors.push({
            fileName: file.originalFilename || 'unknown',
            error: `File does not exist: ${file.filepath}`
          });
          continue;
        }

        // Get file stats
        try {
          const fileStats = fs.statSync(file.filepath);
          console.log('File stats:', {
            size: fileStats.size,
            isFile: fileStats.isFile(),
            isDirectory: fileStats.isDirectory()
          });
          
                  // Use actual file size from stats if formidable size is wrong
        if (fileStats.size > 0 && (!file.size || file.size === 0)) {
          file.size = fileStats.size;
          console.log('Updated file size from stats:', file.size);
        }
      } catch (statsError) {
        console.error('Error getting file stats:', statsError);
      }

      // Final check for valid file size
      if (!file.size || file.size === 0) {
        console.log('File still appears empty after stats check:', file);
        errors.push({
          fileName: file.originalFilename || 'unknown',
          error: `File appears empty - Size: ${file.size}, Filepath: ${file.filepath}`
        });
        continue;
      }

        // Determine folder based on file type
        let folder = 'general';
        if (file.mimetype?.includes('image/')) folder = 'images';
        else if (file.mimetype?.includes('video/')) folder = 'videos';
        else if (file.mimetype?.includes('audio/')) folder = 'audio';
        else if (file.mimetype?.includes('application/pdf')) folder = 'documents';
        else if (file.mimetype?.includes('application/')) folder = 'documents';

        console.log(`Uploading file to folder: ${folder}`);

                 // Upload to Cloudinary with user ID organization
         const result: any = await new Promise((resolve, reject) => {
           cloudinary.uploader.upload(
             file.filepath,
             {
               folder: `rgram/users/${user._id}/${folder}`,
               resource_type: 'auto',
               public_id: `${user._id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
               tags: ['rgram', 'user', user._id.toString(), user.username],
               context: {
                 uploaded_by: user._id.toString(),
                 username: user.username,
                 fullName: user.fullName,
                 upload_date: new Date().toISOString(),
                 user_folder: `users/${user._id}`
               }
             },
             (error, result) => {
               if (error) reject(error);
               else resolve(result);
             }
           );
         });

        uploadedFiles.push({
          originalName: file.originalFilename,
          fileName: file.newFilename,
          publicId: result.public_id,
          url: result.secure_url,
          format: result.format,
          size: result.bytes,
          width: result.width,
          height: result.height,
          duration: result.duration,
          resourceType: result.resource_type,
          folder: folder,
          uploadedAt: new Date(),
          uploadedBy: {
            userId: user._id,
            username: user.username,
            fullName: user.fullName
          }
        });

        console.log(`✅ Successfully uploaded: ${file.originalFilename}`);

      } catch (error: any) {
        console.error(`❌ Error uploading ${file.originalFilename}:`, error);
        errors.push({
          fileName: file.originalFilename || 'unknown',
          error: error.message || 'Unknown error occurred',
          details: {
            size: file.size,
            mimetype: file.mimetype,
            filepath: file.filepath
          }
        });
      }
    }

    // Clean up temporary files
    for (const file of files.file) {
      try {
        if (file.filepath && fs.existsSync(file.filepath)) {
          fs.unlinkSync(file.filepath);
          console.log(`Cleaned up temporary file: ${file.filepath}`);
        }
      } catch (cleanupError) {
        console.error('Error cleaning up temporary file:', cleanupError);
      }
    }

    // Return results
    res.json({
      success: true,
      message: `Successfully uploaded ${uploadedFiles.length} files`,
      data: {
        uploadedFiles,
        errors: errors.length > 0 ? errors : undefined,
        summary: {
          total: files.file.length,
          successful: uploadedFiles.length,
          failed: errors.length
        }
      }
    });

  } catch (error: any) {
    console.error('File upload error:', error);
    res.status(500).json({
      success: false,
      message: 'File upload failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
