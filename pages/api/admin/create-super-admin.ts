import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import User from '@/lib/models/User';
import { Admin } from '../../../lib/models/Admin';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { 
      username, 
      email, 
      password, 
      fullName,
      secretKey 
    } = req.body;

    // Check secret key for security
    if (secretKey !== process.env.SUPER_ADMIN_SECRET_KEY) {
      return res.status(403).json({
        success: false,
        message: 'Invalid secret key'
      });
    }

    // Validate required fields
    if (!username || !email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, password, and full name are required'
      });
    }

    // Check if super admin already exists
    const existingSuperAdmin = await Admin.findOne({ 
      role: 'super_admin', 
      isActive: true 
    });
    
    if (existingSuperAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Super admin already exists'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    // Create super admin user (password will be hashed by pre-save hook)
    const superAdminUser = await User.create({
      username,
      email,
      password,
      fullName,
      isActive: true,
      isVerified: true,
      role: 'super_admin'
    });

    // Create super admin record
    const superAdmin = await Admin.create({
      user: superAdminUser._id,
      role: 'super_admin',
      permissions: {
        canManageUsers: true,
        canDeleteContent: true,
        canBlockUsers: true,
        canViewAnalytics: true,
        canModerateContent: true,
        canManageReports: true
      },
      isActive: true
    });

    // Populate user details
    await superAdmin.populate('user', 'username email fullName avatar');

    return res.status(201).json({
      success: true,
      message: 'Super admin created successfully',
      data: { 
        admin: superAdmin,
        user: {
          id: superAdminUser._id,
          username: superAdminUser.username,
          email: superAdminUser.email,
          fullName: superAdminUser.fullName
        }
      }
    });

  } catch (error: any) {
    console.error('Create super admin error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
