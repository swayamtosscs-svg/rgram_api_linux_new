import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../lib/database';
import User from '../../../../lib/models/User';
import OTP from '../../../../lib/models/OTP';
import { sendOTPEmail } from '../../../../lib/utils/email';
import { validateEmail } from '../../../../lib/utils/validation';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      message: 'Method not allowed' 
    });
  }

  try {
    await connectDB();

    const { email, purpose = 'signup' } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Validate purpose
    const validPurposes = ['signup', 'login', 'password_reset', 'email_verification'];
    if (!validPurposes.includes(purpose)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP purpose'
      });
    }

    // Check if user exists for login/password reset
    if (purpose === 'login' || purpose === 'password_reset') {
      const user = await (User as any).findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found with this email address'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated. Please contact support.'
        });
      }
    }

    // Check if user already exists for signup
    if (purpose === 'signup') {
      const existingUser = await (User as any).findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered. Please login instead.'
        });
      }
    }

    // Create and send OTP
    const otpData = await (OTP as any).createOTP(email, purpose);
    
    // Send OTP via email
    const emailSent = await sendOTPEmail(email, otpData.otp, purpose);
    
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please try again.'
      });
    }

    res.json({
      success: true,
      message: `OTP sent successfully to ${email}`,
      data: {
        email,
        purpose,
        expiresAt: otpData.expiresAt,
        expiresIn: `${process.env.OTP_EXPIRE_MINUTES || 10} minutes`
      }
    });
  } catch (error: any) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
