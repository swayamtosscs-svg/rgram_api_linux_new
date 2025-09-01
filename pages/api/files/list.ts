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

    // Get query parameters
    const {
      folder = 'all',
      type = 'all',
      page = '1',
      limit = '20',
      search = '',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build search query for Cloudinary - user-specific files only
    let searchQuery = `tags:rgram AND tags:user AND tags:${user._id}`;
    
    if (folder !== 'all') {
      searchQuery += ` AND folder:rgram/users/${user._id}/${folder}`;
    }

    console.log('Search query:', searchQuery);
    console.log('User ID:', user._id.toString());
    
    if (type !== 'all') {
      searchQuery += ` AND resource_type:${type}`;
    }
    
    if (search) {
      searchQuery += ` AND context:${search}`;
    }

    // Get files from Cloudinary
         const cloudinaryResult: any = await new Promise((resolve, reject) => {
       cloudinary.search
         .expression(searchQuery)
         .sort_by(sortBy as string, sortOrder as 'asc' | 'desc')
         .max_results(limitNum)
         .execute()
         .then((result) => resolve(result))
         .catch((error) => reject(error));
     });

    // Format the response
    const files = cloudinaryResult.resources.map((resource: any) => ({
      id: resource.public_id,
      url: resource.secure_url,
      format: resource.format,
      size: resource.bytes,
      width: resource.width,
      height: resource.height,
      duration: resource.duration,
      resourceType: resource.resource_type,
      folder: resource.folder,
      uploadedAt: resource.created_at,
      tags: resource.tags,
      context: resource.context,
      thumbnail: resource.thumbnail_url,
      preview: resource.preview_url
    }));

         // Get total count for pagination
     const totalResult: any = await new Promise((resolve, reject) => {
       cloudinary.search
         .expression(searchQuery)
         .max_results(1)
         .execute()
         .then((result) => resolve(result))
         .catch((error) => reject(error));
     });

    const total = totalResult.total_count;

    res.json({
      success: true,
      message: 'Files retrieved successfully',
      data: {
        files,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
          hasNext: pageNum * limitNum < total,
          hasPrev: pageNum > 1
        },
        filters: {
          folder,
          type,
          search,
          sortBy,
          sortOrder
        }
      }
    });

  } catch (error: any) {
    console.error('File list error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve files',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
