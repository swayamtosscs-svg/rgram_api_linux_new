import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import { validateResetToken } from './forgot-password';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await connectDB();
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    // Validate the token
    const resetToken = await validateResetToken(token);
    
    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Check if token is expired
    if (resetToken.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Reset token has expired'
      });
    }

    // Check if token has already been used
    if (resetToken.isUsed) {
      return res.status(400).json({
        success: false,
        message: 'Reset token has already been used'
      });
    }

    // Type assertion for the populated user data
    const userData = resetToken.userId as any;

    res.json({
      success: true,
      message: 'Token is valid',
      data: {
        userId: userData._id,
        email: userData.email,
        username: userData.username,
        fullName: userData.fullName
      }
    });

  } catch (error: any) {
    console.error('Token validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
