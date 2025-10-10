import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import User from '../../../lib/models/User';
import OTP from '../../../lib/models/OTP';

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
    await connectDB();
    const { email, otp } = req.body;

    // Validation
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
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

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'OTP must be 6 digits'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Verify OTP
    const verification = await (OTP as any).verifyOTP(email.toLowerCase(), otp, 'password_reset');
    
    if (!verification.valid) {
      return res.status(400).json({
        success: false,
        message: verification.message
      });
    }

    console.log(`✅ Password reset OTP verified for ${email}`);

    return res.json({
      success: true,
      message: 'OTP verified successfully. You can now reset your password.',
      data: {
        email: email.toLowerCase(),
        username: user.username,
        fullName: user.fullName,
        canResetPassword: true
      }
    });

  } catch (error: any) {
    console.error('❌ Verify password reset OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.'
    });
  }
}
