import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import User from '../../../lib/models/User';
import { verifyToken } from '../../../lib/middleware/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
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

    // Find user
    const user = await (User as any).findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { religion } = req.body;

    // Validation
    if (!religion || typeof religion !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Religion is required'
      });
    }

    if (religion.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Religion cannot be empty'
      });
    }

    if (religion.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Religion must be less than 50 characters'
      });
    }

    // Update user's religion
    const updatedUser = await (User as any).findByIdAndUpdate(
      decoded.userId,
      { religion: religion.trim() },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Religion preference saved successfully',
      data: {
        user: {
          id: updatedUser._id,
          email: updatedUser.email,
          username: updatedUser.username,
          fullName: updatedUser.fullName,
          religion: updatedUser.religion,
          isEmailVerified: updatedUser.isEmailVerified,
          isVerified: updatedUser.isVerified,
          createdAt: updatedUser.createdAt,
          lastActive: updatedUser.lastActive
        }
      }
    });
  } catch (error: any) {
    console.error('Select religion error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
