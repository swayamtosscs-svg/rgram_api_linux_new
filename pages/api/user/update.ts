import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import User from '../../../lib/models/User';
import { verifyToken } from '../../../lib/middleware/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ 
      success: false,
      message: 'Method not allowed' 
    });
  }

  try {
    await connectDB();

    // Get token from header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Find user
    const user = await (User as any).findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { 
      fullName, 
      bio, 
      website, 
      location, 
      isPrivate, 
      religion 
    } = req.body;

    // Validation
    if (fullName && fullName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Full name must be at least 2 characters long'
      });
    }

    if (bio && bio.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Bio must be less than 500 characters'
      });
    }

    if (website && !isValidUrl(website)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid website URL'
      });
    }

    if (religion && religion.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Religion must be less than 50 characters'
      });
    }

    // Update user
    const updateData: any = {};
    if (fullName !== undefined) updateData.fullName = fullName.trim();
    if (bio !== undefined) updateData.bio = bio.trim();
    if (website !== undefined) updateData.website = website.trim();
    if (location !== undefined) updateData.location = location.trim();
    if (isPrivate !== undefined) updateData.isPrivate = Boolean(isPrivate);
    if (religion !== undefined) updateData.religion = religion.trim();

    const updatedUser = await (User as any).findByIdAndUpdate(
      decoded.userId,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'User information updated successfully',
      data: {
        user: {
          id: updatedUser._id,
          email: updatedUser.email,
          username: updatedUser.username,
          fullName: updatedUser.fullName,
          avatar: updatedUser.avatar,
          bio: updatedUser.bio,
          website: updatedUser.website,
          location: updatedUser.location,
          religion: updatedUser.religion,
          isPrivate: updatedUser.isPrivate,
          isEmailVerified: updatedUser.isEmailVerified,
          isVerified: updatedUser.isVerified,
          followersCount: updatedUser.followersCount,
          followingCount: updatedUser.followingCount,
          postsCount: updatedUser.postsCount,
          reelsCount: updatedUser.reelsCount,
          createdAt: updatedUser.createdAt,
          lastActive: updatedUser.lastActive
        }
      }
    });
  } catch (error: any) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Helper function to validate URL
function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}
