import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import User from '../../../lib/models/User';
import PasswordResetToken from '../../../lib/models/PasswordResetToken';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';

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

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('Missing SMTP configuration');
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

    // Send reset email
    await sendPasswordResetEmail(user.email, user.fullName || user.username, resetToken);

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

// Send password reset email
async function sendPasswordResetEmail(email: string, fullName: string, resetToken: string) {
  try {
    // Validate SMTP configuration
    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error('SMTP configuration incomplete');
    }

    // Create transporter (configure with your email service)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"${process.env.APP_NAME || 'RGram'}" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #8b5cf6; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">Password Reset</h1>
          </div>
          
          <div style="padding: 20px; background-color: #f9fafb;">
            <p>Hello ${fullName},</p>
            
            <p>You have requested to reset your password. Click the button below to create a new password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #6b7280;">${resetUrl}</p>
            
            <p><strong>This link will expire in 15 minutes.</strong></p>
            
            <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            
            <p>Best regards,<br>The RGram Team</p>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; color: #6b7280;">
            <p style="margin: 0; font-size: 14px;">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully to:', email);

  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}

// Helper function to validate reset token
export async function validateResetToken(token: string) {
  try {
    const resetToken = await PasswordResetToken.findOne({
      token,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    }).populate('userId', 'email username fullName').lean();
    
    return resetToken;
  } catch (error) {
    console.error('Error validating reset token:', error);
    return null;
  }
}

// Helper function to mark token as used
export async function markTokenAsUsed(token: string) {
  try {
    await PasswordResetToken.findOneAndUpdate(
      { token },
      { isUsed: true }
    );
  } catch (error) {
    console.error('Error marking token as used:', error);
  }
}

// Clean up expired tokens (run this periodically)
export async function cleanupExpiredTokens() {
  try {
    await PasswordResetToken.deleteMany({
      expiresAt: { $lt: new Date() }
    });
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
  }
}
