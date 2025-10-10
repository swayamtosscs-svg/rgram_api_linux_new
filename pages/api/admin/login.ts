import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import User from '@/lib/models/User';
import { Admin } from '../../../lib/models/Admin';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { email, password, username } = req.body;

    // Validate required fields
    if ((!email && !username) || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email/username and password are required'
      });
    }

    // Find user by email or username (include password field)
    const user = await User.findOne({
      $or: [
        { email: email },
        { username: username }
      ]
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is an admin
    const admin = await Admin.findOne({ 
      user: user._id, 
      isActive: true 
    });

    if (!admin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        username: user.username,
        email: user.email,
        role: admin.role,
        permissions: admin.permissions,
        isAdmin: true
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Update last active
    user.lastActive = new Date();
    await user.save();

    // Return success response with token
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          avatar: user.avatar,
          isActive: user.isActive,
          lastActive: user.lastActive
        },
        admin: {
          id: admin._id,
          role: admin.role,
          permissions: admin.permissions,
          isActive: admin.isActive,
          createdAt: admin.createdAt
        },
        expiresIn: '7d'
      }
    });

  } catch (error: any) {
    console.error('Admin login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
