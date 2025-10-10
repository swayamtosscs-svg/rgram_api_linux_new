import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/database';
import User from '@/lib/models/User';
import PasswordResetToken from '@/lib/models/PasswordResetToken';
import { sendPasswordResetConfirmationEmail } from '../../../lib/utils/email';

// Load environment variables
require('dotenv').config({ path: '.env.local' });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await connectDB();
    const { token, password, email } = req.body;

    if (!token || !password || !email) {
      return res.status(400).json({
        success: false,
        message: 'Token, password, and email are required'
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Find the reset token
    const resetTokenData = await PasswordResetToken.findOne({
      token,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    }).populate('userId');

    if (!resetTokenData) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Verify the email matches the token's user
    const user = resetTokenData.userId as any;
    if (user.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: 'Email does not match the reset token'
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user password
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
      passwordChangedAt: new Date()
    });

    // Mark token as used
    await PasswordResetToken.findByIdAndUpdate(resetTokenData._id, {
      isUsed: true
    });

    // Send confirmation email
    try {
      await sendPasswordResetConfirmationEmail(user.email, user.fullName || user.username);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the password reset if email fails
    }

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error: any) {
    console.error('Reset password error:', error);
    
    if (error.name === 'MongoError' || error.name === 'MongooseError') {
      return res.status(500).json({
        success: false,
        message: 'Database connection error'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

