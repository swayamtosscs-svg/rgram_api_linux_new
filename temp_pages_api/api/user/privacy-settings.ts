import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import User from '../../../lib/models/User';
import { verifyToken } from '../../../lib/middleware/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    // Get current privacy settings
    try {
      await connectDB();

      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Access token required'
        });
      }

      const decoded = await verifyToken(token);
      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }

      const user = await (User as any).findById(decoded.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: {
          userId: user._id,
          username: user.username,
          fullName: user.fullName,
          privacySettings: {
            isPrivate: user.isPrivate,
            profileVisibility: user.isPrivate ? 'private' : 'public',
            lastUpdated: user.updatedAt
          }
        }
      });

    } catch (error: any) {
      console.error('Get privacy settings error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

  } else if (req.method === 'PUT') {
    // Update privacy settings
    try {
      await connectDB();

      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Access token required'
        });
      }

      const decoded = await verifyToken(token);
      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }

      const user = await (User as any).findById(decoded.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const { isPrivate, action } = req.body;

      let newPrivacyStatus: boolean;
      let message: string;

      if (action === 'toggle') {
        // Toggle current privacy status
        newPrivacyStatus = !user.isPrivate;
        message = `Account is now ${newPrivacyStatus ? 'private' : 'public'}`;
      } else if (action === 'set') {
        // Set specific privacy status
        if (typeof isPrivate !== 'boolean') {
          return res.status(400).json({
            success: false,
            message: 'isPrivate must be a boolean value'
          });
        }
        newPrivacyStatus = isPrivate;
        message = `Account privacy set to ${newPrivacyStatus ? 'private' : 'public'}`;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid action. Use "toggle" or "set"'
        });
      }

      // Update user privacy
      const updatedUser = await (User as any).findByIdAndUpdate(
        decoded.userId,
        { 
          isPrivate: newPrivacyStatus,
          updatedAt: new Date()
        },
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        message: message,
        data: {
          userId: updatedUser._id,
          username: updatedUser.username,
          fullName: updatedUser.fullName,
          isPrivate: updatedUser.isPrivate,
          profileVisibility: updatedUser.isPrivate ? 'private' : 'public',
          privacyChangedAt: new Date().toISOString(),
          previousStatus: user.isPrivate
        }
      });

    } catch (error: any) {
      console.error('Update privacy settings error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

  } else {
    return res.status(405).json({ 
      success: false,
      message: 'Method not allowed' 
    });
  }
}
