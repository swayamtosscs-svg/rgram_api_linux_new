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

    const { idDocument } = req.body;

    // Validation
    if (!idDocument || typeof idDocument !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'ID document is required'
      });
    }

    if (idDocument.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'ID document cannot be empty'
      });
    }

    // Check if user already has a pending or approved verification request
    if (user.verificationRequest && user.verificationRequest.status !== 'rejected') {
      return res.status(400).json({
        success: false,
        message: `You already have a ${user.verificationRequest.status} verification request`
      });
    }

    // Create verification request
    const verificationRequest = {
      idDocument: idDocument.trim(),
      status: 'pending' as const,
      submittedAt: new Date()
    };

    // Update user with verification request
    const updatedUser = await (User as any).findByIdAndUpdate(
      decoded.userId,
      { 
        verificationRequest,
        // Reset isVerified to false when submitting new request
        isVerified: false
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Verification request submitted successfully',
      data: {
        user: {
          id: updatedUser._id,
          email: updatedUser.email,
          username: updatedUser.username,
          fullName: updatedUser.fullName,
          isEmailVerified: updatedUser.isEmailVerified,
          isVerified: updatedUser.isVerified,
          verificationRequest: {
            status: updatedUser.verificationRequest.status,
            submittedAt: updatedUser.verificationRequest.submittedAt
          },
          createdAt: updatedUser.createdAt,
          lastActive: updatedUser.lastActive
        }
      }
    });
  } catch (error: any) {
    console.error('Verify request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
