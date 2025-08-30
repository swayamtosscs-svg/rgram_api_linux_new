import { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';
import { verifyToken } from '../../../lib/middleware/auth';
import connectDB from '../../../lib/database';
import User from '../../../lib/models/User';

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
    const formidable = require('formidable');
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

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err: any, fields: any, files: any) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    if (!files.file || !Array.isArray(files.file)) {
      return res.status(400).json({ 
        success: false, 
        message: 'No files uploaded' 
      });
    }

    const uploadedFiles = [];
    const errors = [];

    // Process each file
    for (const file of files.file) {
      try {
        // Determine folder based on file type
        let folder = 'general';
        if (file.mimetype?.includes('image/')) folder = 'images';
        else if (file.mimetype?.includes('video/')) folder = 'videos';
        else if (file.mimetype?.includes('audio/')) folder = 'audio';
        else if (file.mimetype?.includes('application/pdf')) folder = 'documents';
        else if (file.mimetype?.includes('application/')) folder = 'documents';

        // Upload to Cloudinary with user ID organization
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
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
          ).end(file.file);
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

      } catch (error: any) {
        errors.push({
          fileName: file.originalFilename,
          error: error.message
        });
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
