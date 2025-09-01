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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
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

    const { publicId, resourceType = 'auto' } = req.body;

    if (!publicId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Public ID is required' 
      });
    }

    // Verify the file belongs to the user by checking tags
    try {
             const fileInfo: any = await new Promise((resolve, reject) => {
         cloudinary.api.resource(publicId, { resource_type: resourceType }, (error, result) => {
           if (error) reject(error);
           else resolve(result);
         });
       });

      // Debug: Log file info for troubleshooting
      console.log('File info from Cloudinary:', {
        publicId: fileInfo.public_id,
        folder: fileInfo.folder,
        tags: fileInfo.tags,
        user: user._id.toString(),
        expectedPattern: `rgram/users/${user._id}`,
        fullFileInfo: fileInfo
      });

      // Log all available properties from Cloudinary
      console.log('All Cloudinary file properties:', Object.keys(fileInfo));
      console.log('File public_id:', fileInfo.public_id);
      console.log('File tags:', fileInfo.tags);
      console.log('File folder:', fileInfo.folder);
      console.log('File context:', fileInfo.context);

      // Check if file has user tag and belongs to user's folder
      if (!fileInfo.tags || !fileInfo.tags.includes(user._id.toString()) || !fileInfo.tags.includes('user')) {
        return res.status(403).json({ 
          success: false, 
          message: 'You can only delete your own files' 
        });
      }
      
      // Additional check: verify file is in user's folder
      // Since Cloudinary might not always return folder, we'll check the public_id structure instead
      const expectedPattern = `rgram/users/${user._id}`;
      
      // Check if public_id starts with expected pattern
      if (!fileInfo.public_id || !fileInfo.public_id.startsWith(expectedPattern)) {
        return res.status(403).json({ 
          success: false, 
          message: `Access denied - file not in your folder. Expected: ${expectedPattern}, Got: ${fileInfo.public_id}` 
        });
      }

      // Additional validation: check if the user ID in the public_id matches the authenticated user
      const publicIdParts = fileInfo.public_id.split('/');
      if (publicIdParts.length < 4 || publicIdParts[2] !== user._id.toString()) {
        return res.status(403).json({ 
          success: false, 
          message: `Access denied - file public_id structure invalid or user ID mismatch` 
        });
      }

      console.log('✅ File validation passed - user can delete this file');

    } catch (error: any) {
      if (error.http_code === 404) {
        return res.status(404).json({ 
          success: false, 
          message: 'File not found' 
        });
      }
      throw error;
    }

    // Delete from Cloudinary
    const deleteResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, { resource_type: resourceType }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });

    res.json({
      success: true,
      message: 'File deleted successfully',
      data: {
        deletedFile: {
          publicId,
          resourceType,
          deletedAt: new Date(),
          deletedBy: {
            userId: user._id,
            username: user.username,
            fullName: user.fullName
          }
        },
        cloudinaryResult: deleteResult
      }
    });

  } catch (error: any) {
    console.error('File deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
