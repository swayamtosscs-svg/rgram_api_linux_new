import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import User from '@/lib/models/User';
import cloudinary from '../../../utils/cloudinary';
import { verifyToken } from '@/lib/middleware/auth';
import multer from 'multer';
import { NextApiRequestWithFiles } from '../../../lib/types/next.d';

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Helper function to run multer middleware
const runMiddleware = (req: NextApiRequest, res: NextApiResponse, fn: any) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export const config = {
  api: {
    bodyParser: false, // Disable body parser, we'll use multer
  },
};

export default async function handler(
  req: NextApiRequestWithFiles,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Run multer middleware to handle file upload
    await runMiddleware(req, res, upload.single('image'));

    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = await verifyToken(token);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Validate file
    const { originalname, mimetype, size } = req.file;
    
    if (!mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'Invalid file type. Only images are allowed.' });
    }

    if (size > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'File size too large. Maximum size is 5MB' });
    }

    // Connect to database
    await connectDB();

    // Check if user exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Convert buffer to base64 for Cloudinary
    const base64Image = `data:${mimetype};base64,${req.file.buffer.toString('base64')}`;

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        base64Image,
        {
          folder: 'profile-pictures',
          public_id: `user_${user._id}_${Date.now()}`,
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto:good' }
          ],
          resource_type: 'image'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });

    // Delete old profile picture if exists
    if (user.avatar && user.avatar.includes('cloudinary')) {
      try {
        const publicId = user.avatar.split('/').pop()?.split('.')[0];
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      } catch (deleteError) {
        console.error('Error deleting old profile picture:', deleteError);
        // Continue with the process even if deletion fails
      }
    }

    // Update user's avatar in database
    user.avatar = (uploadResult as any).secure_url;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        avatar: user.avatar,
        cloudinaryId: (uploadResult as any).public_id,
        url: (uploadResult as any).secure_url,
        originalName: originalname,
        fileSize: size,
        mimeType: mimetype
      }
    });

  } catch (error) {
    console.error('Profile picture upload error:', error);
    
    if (error instanceof Error && error.message.includes('Only image files are allowed')) {
      return res.status(400).json({ error: 'Only image files are allowed' });
    }
    
    if (error instanceof Error && error.message.includes('File too large')) {
      return res.status(400).json({ error: 'File size too large. Maximum size is 5MB' });
    }

    res.status(500).json({ 
      error: 'Failed to upload profile picture',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
