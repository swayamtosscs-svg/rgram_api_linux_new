import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import User from '@/lib/models/User';
import { generateToken } from '../../../lib/middleware/auth';
import { validateEmail, validateUsername } from '../../../lib/utils/validation';

// Helper function to determine if input is email or username
const isEmail = (input: string): boolean => {
  return validateEmail(input);
};

// Helper function to determine if input is username
const isUsername = (input: string): boolean => {
  const usernameValidation = validateUsername(input);
  return usernameValidation.isValid;
};

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

    const { email, username, password } = req.body;

    // Accept either email or username, but not both
    const loginField = email || username;
    if (!loginField || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide either email or username along with password' 
      });
    }

    if (email && username) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide either email or username, not both' 
      });
    }

    // Determine if the input is email or username
    let user;
    if (isEmail(loginField)) {
      // Login with email
      user = await (User as any).findOne({ email: loginField.toLowerCase() }).select('+password');
    } else if (isUsername(loginField)) {
      // Login with username
      user = await (User as any).findOne({ username: loginField.toLowerCase() }).select('+password');
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid email address or username' 
      });
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated. Please contact support.' });
    }

    const token = generateToken(user._id);

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
          role: user.role,
          avatar: user.avatar,
          bio: user.bio,
          website: user.website,
          location: user.location,
          religion: user.religion,
          isPrivate: user.isPrivate,
          isEmailVerified: user.isEmailVerified,
          isVerified: user.isVerified,
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
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
}
