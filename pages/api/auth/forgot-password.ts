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
    // Validate email configuration
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Email configuration incomplete');
    }

    // Create transporter (configure with your email service)
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"${process.env.APP_NAME || 'R-GRAM'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset - R-GRAM</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">R-GRAM</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Spiritual & Religious Social Media</p>
            </div>
            
            <div style="padding: 40px 30px; background: #ffffff;">
              <h2 style="color: #333; margin-bottom: 20px; font-size: 24px;">Password Reset Request 🔐</h2>
              
              <p style="color: #666; line-height: 1.6; font-size: 16px;">
                Hello <strong style="color: #667eea;">${fullName}</strong>,
              </p>
              
              <p style="color: #666; line-height: 1.6; font-size: 16px;">
                You have requested to reset your password for your R-GRAM account. Click the button below to create a new password:
              </p>
              
              <div style="text-align: center; margin: 40px 0;">
                <a href="${resetUrl}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 30px; display: inline-block; font-weight: bold; font-size: 16px;">
                  Reset Password
                </a>
              </div>
              
              <div style="background: #f8f9ff; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
                <p style="color: #333; margin: 0; font-size: 14px;">
                  <strong>🔗 Alternative:</strong> Copy and paste this link into your browser:
                </p>
                <p style="word-break: break-all; color: #667eea; margin: 10px 0 0 0; font-size: 12px;">${resetUrl}</p>
              </div>
              
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 25px 0;">
                <p style="color: #856404; margin: 0; font-size: 14px;">
                  <strong>⚠️ Important:</strong> This link will expire in 15 minutes. If you didn't request this password reset, please ignore this email.
                </p>
              </div>
              
              <p style="color: #666; line-height: 1.6; font-size: 16px; margin-top: 30px;">
                For your security, never share this link with anyone. R-GRAM will never ask for your password reset link.
              </p>
              
              <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #eee; text-align: center;">
                <p style="color: #999; font-size: 14px; margin: 0;">
                  Best regards,<br>
                  <strong>The R-GRAM Team</strong>
                </p>
                <p style="color: #ccc; font-size: 12px; margin: 15px 0 0 0;">
                  This is an automated message, please do not reply to this email.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
R-GRAM - Spiritual & Religious Social Media

Password Reset Request

Hello ${fullName},

You have requested to reset your password for your R-GRAM account.

Click this link to reset your password: ${resetUrl}

⚠️ Important: This link will expire in 15 minutes.
If you didn't request this password reset, please ignore this email.

For your security, never share this link with anyone. R-GRAM will never ask for your password reset link.

Best regards,
The R-GRAM Team

This is an automated message, please do not reply to this email.
      `.trim()
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
