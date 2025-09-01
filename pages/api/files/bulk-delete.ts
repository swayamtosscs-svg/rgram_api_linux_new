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

    const { files } = req.body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Files array is required' 
      });
    }

    if (files.length > 50) {
      return res.status(400).json({ 
        success: false, 
        message: 'Maximum 50 files can be deleted at once' 
      });
    }

    const results: {
      successful: Array<{
        publicId: string;
        resourceType: string;
        deletedAt: Date;
        cloudinaryResult: any;
      }>;
      failed: Array<{
        publicId: string;
        error: string;
      }>;
    } = {
      successful: [],
      failed: []
    };

    // Process each file
    for (const file of files) {
      try {
        const { publicId, resourceType = 'auto' } = file;

        if (!publicId) {
          results.failed.push({
            publicId: 'unknown',
            error: 'Public ID is missing'
          });
          continue;
        }

                 // Verify the file belongs to the user
         try {
           const fileInfo: any = await new Promise((resolve, reject) => {
             cloudinary.api.resource(publicId, { resource_type: resourceType }, (error, result) => {
               if (error) reject(error);
               else resolve(result);
             });
           });

          // Check if file has user tag and belongs to user's folder
          if (!fileInfo.tags || !fileInfo.tags.includes(user._id.toString()) || !fileInfo.tags.includes('user')) {
            results.failed.push({
              publicId,
              error: 'Access denied - file does not belong to user'
            });
            continue;
          }
          
          // Additional check: verify file is in user's folder
          // Since Cloudinary might not always return folder, we'll check the public_id structure instead
          const expectedPattern = `rgram/users/${user._id}`;
          
          // Check if public_id starts with expected pattern
          if (!fileInfo.public_id || !fileInfo.public_id.startsWith(expectedPattern)) {
            results.failed.push({
              publicId,
              error: `Access denied - file not in your folder. Expected: ${expectedPattern}, Got: ${fileInfo.public_id}`
            });
            continue;
          }

          // Additional validation: check if the user ID in the public_id matches the authenticated user
          const publicIdParts = fileInfo.public_id.split('/');
          if (publicIdParts.length < 4 || publicIdParts[2] !== user._id.toString()) {
            results.failed.push({
              publicId,
              error: `Access denied - file public_id structure invalid or user ID mismatch`
            });
            continue;
          }

        } catch (error: any) {
          if (error.http_code === 404) {
            results.failed.push({
              publicId,
              error: 'File not found'
            });
            continue;
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

        results.successful.push({
          publicId,
          resourceType,
          deletedAt: new Date(),
          cloudinaryResult: deleteResult
        });

      } catch (error: any) {
        results.failed.push({
          publicId: file.publicId || 'unknown',
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Bulk deletion completed. ${results.successful.length} successful, ${results.failed.length} failed.`,
      data: {
        summary: {
          total: files.length,
          successful: results.successful.length,
          failed: results.failed.length
        },
        successful: results.successful,
        failed: results.failed.length > 0 ? results.failed : undefined,
        deletedBy: {
          userId: user._id,
          username: user.username,
          fullName: user.fullName
        }
      }
    });

  } catch (error: any) {
    console.error('Bulk file deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process bulk deletion',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
