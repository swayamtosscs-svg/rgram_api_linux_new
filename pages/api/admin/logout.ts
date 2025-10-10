import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import User from '@/lib/models/User';
import { verifyAdminToken } from '../../../lib/middleware/adminAuth';

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

    // Verify token to get user info
    const decoded = await verifyAdminToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Update user's last logout time
    await User.findByIdAndUpdate(decoded.userId, {
      lastLogout: new Date()
    });

    // In a real application, you might want to:
    // 1. Add token to a blacklist
    // 2. Store logout event in audit log
    // 3. Clear any server-side sessions

    return res.status(200).json({
      success: true,
      message: 'Logout successful',
      data: {
        userId: decoded.userId,
        username: decoded.username,
        logoutTime: new Date()
      }
    });

  } catch (error: any) {
    console.error('Admin logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
