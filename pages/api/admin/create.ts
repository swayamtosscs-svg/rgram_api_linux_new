import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import User from '@/lib/models/User';
import { Admin } from '../../../lib/models/Admin';
import { verifyToken } from '@/lib/middleware/auth';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const decoded = await verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  switch (req.method) {
    case 'POST':
      return createAdmin(req, res, decoded.userId);
    case 'GET':
      return getAdmins(req, res, decoded.userId);
    case 'PUT':
      return updateAdmin(req, res, decoded.userId);
    case 'DELETE':
      return deleteAdmin(req, res, decoded.userId);
    default:
      return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}

// Create Admin
async function createAdmin(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { 
      username, 
      email, 
      password, 
      fullName, 
      role = 'moderator',
      permissions = {},
      makeExistingUserAdmin = false,
      existingUserId 
    } = req.body;

    // Check if current user is super admin
    const currentAdmin = await Admin.findOne({ user: userId, isActive: true });
    if (!currentAdmin || currentAdmin.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only super admin can create other admins'
      });
    }

    let adminUser;

    if (makeExistingUserAdmin && existingUserId) {
      // Make existing user an admin
      adminUser = await User.findById(existingUserId);
      if (!adminUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if user is already an admin
      const existingAdmin = await Admin.findOne({ user: existingUserId });
      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          message: 'User is already an admin'
        });
      }
    } else {
      // Create new admin user
      if (!username || !email || !password || !fullName) {
        return res.status(400).json({
          success: false,
          message: 'Username, email, password, and full name are required'
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

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create new user
      adminUser = await User.create({
        username,
        email,
        password: hashedPassword,
        fullName,
        isActive: true,
        isVerified: true,
        role: 'admin'
      });
    }

    // Set default permissions based on role
    const defaultPermissions = {
      super_admin: {
        canManageUsers: true,
        canDeleteContent: true,
        canBlockUsers: true,
        canViewAnalytics: true,
        canModerateContent: true,
        canManageReports: true
      },
      admin: {
        canManageUsers: true,
        canDeleteContent: true,
        canBlockUsers: true,
        canViewAnalytics: true,
        canModerateContent: true,
        canManageReports: true
      },
      moderator: {
        canManageUsers: false,
        canDeleteContent: true,
        canBlockUsers: false,
        canViewAnalytics: false,
        canModerateContent: true,
        canManageReports: true
      }
    };

    const finalPermissions = { ...defaultPermissions[role as keyof typeof defaultPermissions], ...permissions };

    // Create admin record
    const admin = await Admin.create({
      user: adminUser._id,
      role,
      permissions: finalPermissions,
      isActive: true
    });

    // Populate user details
    await admin.populate('user', 'username email fullName avatar');

    return res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: { admin }
    });

  } catch (error: any) {
    console.error('Create admin error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Get Admins
async function getAdmins(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    // Check if current user is admin
    const currentAdmin = await Admin.findOne({ user: userId, isActive: true });
    if (!currentAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { page = 1, limit = 10, role, status } = req.query;

    const query: any = {};
    if (role) {
      query.role = role;
    }
    if (status) {
      query.isActive = status === 'active';
    }

    const skip = (Number(page) - 1) * Number(limit);

    const admins = await Admin.find(query)
      .populate('user', 'username email fullName avatar isActive')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Admin.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: {
        admins,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalItems: total,
          itemsPerPage: Number(limit),
          hasNextPage: Number(page) < Math.ceil(total / Number(limit)),
          hasPrevPage: Number(page) > 1
        }
      }
    });

  } catch (error: any) {
    console.error('Get admins error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Update Admin
async function updateAdmin(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { adminId } = req.query;
    const { role, permissions, isActive } = req.body;

    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: 'Admin ID is required'
      });
    }

    // Check if current user is super admin
    const currentAdmin = await Admin.findOne({ user: userId, isActive: true });
    if (!currentAdmin || currentAdmin.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only super admin can update admin settings'
      });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Prevent super admin from demoting themselves
    if (admin.user.toString() === userId && role && role !== 'super_admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot demote yourself from super admin'
      });
    }

    // Update fields
    if (role) admin.role = role;
    if (permissions) admin.permissions = { ...admin.permissions, ...permissions };
    if (isActive !== undefined) admin.isActive = isActive;

    await admin.save();

    // Populate user details
    await admin.populate('user', 'username email fullName avatar');

    return res.status(200).json({
      success: true,
      message: 'Admin updated successfully',
      data: { admin }
    });

  } catch (error: any) {
    console.error('Update admin error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Delete Admin (Soft Delete/Deactivate)
async function deleteAdmin(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { adminId, permanent = false } = req.query;

    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: 'Admin ID is required'
      });
    }

    // Check if current user is super admin
    const currentAdmin = await Admin.findOne({ user: userId, isActive: true });
    if (!currentAdmin || currentAdmin.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only super admin can delete admins'
      });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Prevent super admin from deleting themselves
    if (admin.user.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete yourself'
      });
    }

    if (permanent === 'true') {
      // Permanent deletion - remove from database
      await Admin.findByIdAndDelete(adminId);
      
      // Also delete the user account permanently
      await User.findByIdAndDelete(admin.user);
      
      return res.status(200).json({
        success: true,
        message: 'Admin permanently deleted successfully'
      });
    } else {
      // Soft delete - deactivate admin
      admin.isActive = false;
      await admin.save();

      // Also deactivate the user account
      await User.findByIdAndUpdate(admin.user, { isActive: false });

      return res.status(200).json({
        success: true,
        message: 'Admin deactivated successfully'
      });
    }

  } catch (error: any) {
    console.error('Delete admin error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
