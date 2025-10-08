import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import User from '../../../lib/models/User';
import { Admin } from '../../../lib/models/Admin';
import { verifyAdminToken } from '../../../lib/middleware/adminAuth';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token is required'
      });
    }

    // Verify current token
    const decoded = await verifyAdminToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Get fresh user and admin data
    const user = await User.findById(decoded.userId);
    const admin = await Admin.findOne({ user: decoded.userId, isActive: true });

    if (!user || !admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin account not found or inactive'
      });
    }

    // Generate new JWT token
    const newToken = jwt.sign(
      { 
        userId: user._id,
        username: user.username,
        email: user.email,
        role: admin.role,
        permissions: admin.permissions,
        isAdmin: true
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Update last activity
    user.lastActive = new Date();
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          avatar: user.avatar,
          isActive: user.isActive,
          lastActive: user.lastActive
        },
        admin: {
          id: admin._id,
          role: admin.role,
          permissions: admin.permissions,
          isActive: admin.isActive
        },
        expiresIn: '7d'
      }
    });

  } catch (error: any) {
    console.error('Refresh token error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
