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

    // Toggle privacy status
    const newPrivacyStatus = !user.isPrivate;
    
    // Update user privacy
    const updatedUser = await (User as any).findByIdAndUpdate(
      decoded.userId,
      { isPrivate: newPrivacyStatus },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: `Account is now ${newPrivacyStatus ? 'private' : 'public'}`,
      data: {
        userId: updatedUser._id,
        username: updatedUser.username,
        fullName: updatedUser.fullName,
        isPrivate: updatedUser.isPrivate,
        privacyChangedAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Toggle privacy error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
