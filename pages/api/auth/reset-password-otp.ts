import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import User from '../../../lib/models/User';
import OTP from '../../../lib/models/OTP';
import { sendPasswordResetConfirmationEmail } from '../../../lib/utils/email';

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
    const { email, otp, newPassword } = req.body;

    // Validation
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and new password are required'
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

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
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

    // Verify OTP again to ensure it's still valid
    const verification = await (OTP as any).verifyOTP(email.toLowerCase(), otp, 'password_reset');
    
    if (!verification.valid) {
      return res.status(400).json({
        success: false,
        message: verification.message
      });
    }

    // Update user password
    user.password = newPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    // Send confirmation email
    try {
      await sendPasswordResetConfirmationEmail(email.toLowerCase(), user.fullName);
      console.log(`✅ Password reset confirmation email sent to ${email}`);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the password reset if email fails
    }

    console.log(`✅ Password reset successful for ${email}`);

    return res.json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.',
      data: {
        email: email.toLowerCase(),
        username: user.username,
        passwordChangedAt: user.passwordChangedAt
      }
    });

  } catch (error: any) {
    console.error('❌ Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.'
    });
  }
}
