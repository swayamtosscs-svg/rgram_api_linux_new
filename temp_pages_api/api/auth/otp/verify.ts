import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../lib/database';
import User from '../../../../lib/models/User';
import OTP from '../../../../lib/models/OTP';
import { generateToken } from '../../../../lib/middleware/auth';
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

    const { email, code, purpose = 'signup' } = req.body;

    // Validation
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP code are required'
      });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Validate OTP code format
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({
        success: false,
        message: 'OTP code must be 6 digits'
      });
    }

    // Verify OTP
    const verification = await (OTP as any).verifyOTP(email, code, purpose);
    
    if (!verification.valid) {
      return res.status(400).json({
        success: false,
        message: verification.message
      });
    }

    // Handle different purposes
    if (purpose === 'signup') {
      // For signup, just verify the OTP was valid
      res.json({
        success: true,
        message: 'Email verified successfully. You can now complete your registration.',
        data: { 
          email, 
          verified: true,
          purpose 
        }
      });
    } else if (purpose === 'login') {
      // For login, find user and generate token
      const user = await (User as any).findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated. Please contact support.'
        });
      }

      const token = generateToken(user._id);
      
      // Update last active
      user.lastActive = new Date();
      await user.save();

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            email: user.email,
            username: user.username,
            fullName: user.fullName,
            avatar: user.avatar,
            bio: user.bio,
            website: user.website,
            location: user.location,
            isPrivate: user.isPrivate,
            isEmailVerified: user.isEmailVerified,
            followersCount: user.followersCount,
            followingCount: user.followingCount,
            postsCount: user.postsCount,
            reelsCount: user.reelsCount,
            createdAt: user.createdAt,
            lastActive: user.lastActive
          },
          token
        }
      });
    } else if (purpose === 'password_reset') {
      // For password reset, return success to allow password change
      res.json({
        success: true,
        message: 'OTP verified successfully. You can now reset your password.',
        data: { 
          email, 
          verified: true,
          purpose 
        }
      });
    } else if (purpose === 'email_verification') {
      // For email verification, update user's email verification status
      const user = await (User as any).findOne({ email });
      if (user) {
        user.isEmailVerified = true;
        await user.save();
      }

      res.json({
        success: true,
        message: 'Email verified successfully.',
        data: { 
          email, 
          verified: true,
          purpose 
        }
      });
    } else {
      res.json({
        success: true,
        message: 'OTP verified successfully',
        data: { 
          email, 
          verified: true,
          purpose 
        }
      });
    }
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
