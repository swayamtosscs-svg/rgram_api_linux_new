import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import connectDB from '../../../lib/database';
import User from '../../../lib/models/User';
import PasswordResetToken from '../../../lib/models/PasswordResetToken';
import { sendPasswordResetEmail } from '../../../lib/utils/email';

// Load environment variables
require('dotenv').config({ path: '.env.local' });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Check if required environment variables are set
    if (!process.env.MONGODB_URI) {
      console.error('Missing MONGODB_URI environment variable');
      return res.status(500).json({
        success: false,
        message: 'Database configuration error'
      });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Missing email configuration');
      return res.status(500).json({
        success: false,
        message: 'Email service configuration error'
      });
    }

    await connectDB();
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Remove old tokens for this user
    await PasswordResetToken.deleteMany({ userId: user._id });

    // Store reset token in database
    const resetTokenData = new PasswordResetToken({
      userId: user._id,
      token: resetToken,
      expiresAt,
      isUsed: false
    });

    await resetTokenData.save();

    // Send reset email using the centralized email utility
    const emailSent = await sendPasswordResetEmail(user.email, user.fullName || user.username, resetToken);
    
    if (!emailSent) {
      throw new Error('Failed to send password reset email');
    }

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });

  } catch (error: any) {
    console.error('Forgot password error:', error);
    
    // Provide more specific error messages based on the error type
    if (error.name === 'MongoError' || error.name === 'MongooseError') {
      return res.status(500).json({
        success: false,
        message: 'Database connection error'
      });
    }
    
    if (error.message === 'Failed to send password reset email') {
      return res.status(500).json({
        success: false,
        message: 'Email service error'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

