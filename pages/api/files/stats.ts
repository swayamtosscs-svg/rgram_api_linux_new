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
  if (req.method !== 'GET') {
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

    // Get user's file statistics from Cloudinary
    const stats = await new Promise((resolve, reject) => {
      cloudinary.search
        .expression(`tags:rgram AND tags:user AND tags:${user._id}`)
        .max_results(1000) // Get all user files for stats
        .execute((error, result) => {
          if (error) reject(error);
          else resolve(result);
        });
    });

    // Calculate statistics
    const files = stats.resources || [];
    const totalFiles = files.length;
    const totalSize = files.reduce((sum: number, file: any) => sum + (file.bytes || 0), 0);
    
    // Group by file type
    const fileTypes = files.reduce((acc: any, file: any) => {
      const type = file.resource_type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Group by folder
    const folders = files.reduce((acc: any, file: any) => {
      const folder = file.folder?.split('/').pop() || 'unknown';
      acc[folder] = (acc[folder] || 0) + 1;
      return acc;
    }, {});

    // Get recent uploads (last 10)
    const recentUploads = files
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
      .map((file: any) => ({
        id: file.public_id,
        url: file.secure_url,
        format: file.format,
        size: file.bytes,
        folder: file.folder?.split('/').pop(),
        uploadedAt: file.created_at
      }));

    res.json({
      success: true,
      message: 'User file statistics retrieved successfully',
      data: {
        user: {
          userId: user._id,
          username: user.username,
          fullName: user.fullName
        },
        statistics: {
          totalFiles,
          totalSize,
          totalSizeMB: Math.round((totalSize / (1024 * 1024)) * 100) / 100,
          fileTypes,
          folders
        },
        storage: {
          used: totalSize,
          usedMB: Math.round((totalSize / (1024 * 1024)) * 100) / 100,
          limit: 10 * 1024 * 1024 * 1024, // 10GB limit
          limitMB: 10240,
          percentage: Math.round((totalSize / (10 * 1024 * 1024 * 1024)) * 100)
        },
        recentUploads,
        folderStructure: `rgram/users/${user._id}/`
      }
    });

  } catch (error: any) {
    console.error('File stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve file statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
