import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import User from '../../../lib/models/User';
import bcrypt from 'bcryptjs';
import { validateResetToken, markTokenAsUsed } from './forgot-password';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await connectDB();
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
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

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update the user's password
    const updatedUser = await User.findByIdAndUpdate(
      userData._id,
      { 
        password: hashedPassword,
        passwordChangedAt: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Mark the token as used
    await markTokenAsUsed(token);

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error: any) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
