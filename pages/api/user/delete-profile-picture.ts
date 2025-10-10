import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import User from '@/lib/models/User';
import cloudinary from '../../../utils/cloudinary';
import { verifyToken } from '@/lib/middleware/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = await verifyToken(token);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Connect to database
    await connectDB();

    // Check if user exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has a profile picture
    if (!user.avatar) {
      return res.status(400).json({ error: 'No profile picture to delete' });
    }

    // Delete from Cloudinary if it's a Cloudinary image
    if (user.avatar.includes('cloudinary')) {
      try {
        // Extract public ID from URL
        const urlParts = user.avatar.split('/');
        const filename = urlParts[urlParts.length - 1];
        const publicId = filename.split('.')[0];
        
        // Delete from Cloudinary
        const deleteResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.destroy(publicId, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          });
        });

        console.log('Cloudinary deletion result:', deleteResult);
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
        // Continue with database update even if Cloudinary deletion fails
      }
    }

    // Update user record - remove avatar
    user.avatar = '';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile picture deleted successfully',
      data: {
        userId: user._id,
        username: user.username,
        avatar: null,
        hasProfilePicture: false
      }
    });

  } catch (error) {
    console.error('Delete profile picture error:', error);
    res.status(500).json({ 
      error: 'Failed to delete profile picture',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

