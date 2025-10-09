import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/middleware/auth';

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
    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Get user ID and privacy status from request body
    const { userId, isPrivate } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required in request body'
      });
    }

    if (typeof isPrivate !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isPrivate must be a boolean value (true for private, false for public)'
      });
    }

    // Find user by ID
    const user = await (User as any).findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with the provided ID'
      });
    }

    // Check if privacy is already set to the requested value
    if (user.isPrivate === isPrivate) {
      return res.json({
        success: true,
        message: `User ${user.username} account is already ${isPrivate ? 'private' : 'public'}`,
        data: {
          userId: user._id,
          username: user.username,
          fullName: user.fullName,
          isPrivate: user.isPrivate,
          profileVisibility: user.isPrivate ? 'private' : 'public',
          noChange: true,
          currentStatus: user.isPrivate
        }
      });
    }

    // Update user privacy
    const updatedUser = await (User as any).findByIdAndUpdate(
      userId,
      { 
        isPrivate: isPrivate,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: `User ${updatedUser.username} account privacy set to ${isPrivate ? 'private' : 'public'}`,
      data: {
        userId: updatedUser._id,
        username: updatedUser.username,
        fullName: updatedUser.fullName,
        isPrivate: updatedUser.isPrivate,
        profileVisibility: updatedUser.isPrivate ? 'private' : 'public',
        privacyChangedAt: new Date().toISOString(),
        previousStatus: user.isPrivate,
        changedBy: decoded.userId
      }
    });

  } catch (error: any) {
    console.error('Set privacy by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
