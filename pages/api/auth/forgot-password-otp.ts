import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import User from '../../../lib/models/User';
import OTP from '../../../lib/models/OTP';
import { sendOTPEmail } from '../../../lib/utils/email';

// Load environment variables
require('dotenv').config({ path: '.env.local' });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
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

    // Validation
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
        message: 'If an account with that email exists, a password reset OTP has been sent.'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Generate OTP for password reset
    const otpData = await (OTP as any).createOTP(email.toLowerCase(), 'password_reset');
    
    // Send OTP email
    const emailSent = await sendOTPEmail(
      email.toLowerCase(),
      otpData.otp,
      'password_reset'
    );

    if (!emailSent) {
      console.error('Failed to send OTP email to:', email);
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.'
      });
    }

    console.log(`✅ Password reset OTP sent to ${email}`);

    return res.json({
      success: true,
      message: 'If an account with that email exists, a password reset OTP has been sent.',
      data: {
        email: email.toLowerCase(),
        expiresAt: otpData.expiresAt,
        expiresInMinutes: parseInt(process.env.OTP_EXPIRE_MINUTES || '10')
      }
    });

  } catch (error: any) {
    console.error('❌ Forgot password OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.'
    });
  }
}
