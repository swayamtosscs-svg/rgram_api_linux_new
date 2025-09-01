import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import User from '../../../lib/models/User';
import { generateToken } from '../../../lib/middleware/auth';

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

    const { email, name, googleId, avatar } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and Google ID are required' 
      });
    }

    // Check if user already exists by email OR googleId
    let user = await User.findOne({ 
      $or: [
        { email: email },
        { googleId: googleId }
      ]
    });

    if (user) {
      // Update Google ID if not already set
      if (!user.googleId) {
        user.googleId = googleId;
        console.log('Updated existing user with Google ID');
      }
      
      // Update user's information if it was undefined or missing
      if (!user.fullName || user.fullName === 'undefined') {
        user.fullName = name;
        console.log('Updated user fullName from undefined');
      }
      
      // Update avatar if provided and different
      if (avatar && user.avatar !== avatar) {
        user.avatar = avatar;
        console.log('Updated user avatar');
      }
      
      await user.save();
      console.log('Existing user updated:', user.email);
    } else {
      // Create new user
      const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
      
      user = await User.create({
        email,
        googleId,
        fullName: name,
        username,
        password: Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10),
        avatar: avatar || '',
        isEmailVerified: true, // Auto-verify email for Google users
      });
      console.log('New user created:', username);
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Google login successful',
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
    console.error('Google login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
}