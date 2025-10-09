import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import User from '@/lib/models/User';
import { Admin } from '../../../lib/models/Admin';
import Post from '@/lib/models/Post';
import Notification from '@/lib/models/Notification';
import { verifyToken } from '@/lib/middleware/auth';

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
    case 'DELETE':
      return deleteAdmin(req, res, decoded.userId);
    case 'POST':
      return bulkDeleteAdmins(req, res, decoded.userId);
    case 'PUT':
      return restoreAdmin(req, res, decoded.userId);
    default:
      return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}

// Delete Admin (Soft Delete/Deactivate)
async function deleteAdmin(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { adminId, permanent = false, deleteContent = false } = req.query;

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

    const adminUser = await User.findById(admin.user);
    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }

    if (permanent === 'true') {
      // Permanent deletion - remove from database
      
      // Delete all content created by this admin if requested
      if (deleteContent === 'true') {
        await Post.updateMany(
          { author: admin.user },
          { 
            isActive: false,
            isRemoved: true,
            removedReason: 'Admin account deleted',
            removedBy: userId,
            removedAt: new Date()
          }
        );
      }

      // Delete all notifications related to this admin
      await Notification.deleteMany({
        $or: [
          { sender: admin.user },
          { recipient: admin.user }
        ]
      });

      // Delete admin record
      await Admin.findByIdAndDelete(adminId);
      
      // Delete user account permanently
      await User.findByIdAndDelete(admin.user);
      
      return res.status(200).json({
        success: true,
        message: 'Admin permanently deleted successfully',
        data: {
          deletedAdmin: {
            id: adminId,
            username: adminUser.username,
            email: adminUser.email,
            role: admin.role
          },
          contentDeleted: deleteContent === 'true'
        }
      });
    } else {
      // Soft delete - deactivate admin
      admin.isActive = false;
      await admin.save();

      // Also deactivate the user account
      adminUser.isActive = false;
      await adminUser.save();

      return res.status(200).json({
        success: true,
        message: 'Admin deactivated successfully',
        data: {
          deactivatedAdmin: {
            id: adminId,
            username: adminUser.username,
            email: adminUser.email,
            role: admin.role
          }
        }
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

// Bulk Delete Admins
async function bulkDeleteAdmins(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { adminIds, permanent = false, deleteContent = false } = req.body;

    if (!adminIds || !Array.isArray(adminIds) || adminIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Admin IDs array is required'
      });
    }

    // Check if current user is super admin
    const currentAdmin = await Admin.findOne({ user: userId, isActive: true });
    if (!currentAdmin || currentAdmin.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only super admin can bulk delete admins'
      });
    }

    // Prevent super admin from deleting themselves
    if (adminIds.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete yourself'
      });
    }

    const admins = await Admin.find({ _id: { $in: adminIds } });
    const adminUsers = await User.find({ _id: { $in: admins.map(a => a.user) } });

    if (permanent) {
      // Permanent deletion
      
      // Delete all content created by these admins if requested
      if (deleteContent) {
        await Post.updateMany(
          { author: { $in: admins.map(a => a.user) } },
          { 
            isActive: false,
            isRemoved: true,
            removedReason: 'Admin accounts deleted',
            removedBy: userId,
            removedAt: new Date()
          }
        );
      }

      // Delete all notifications related to these admins
      await Notification.deleteMany({
        $or: [
          { sender: { $in: admins.map(a => a.user) } },
          { recipient: { $in: admins.map(a => a.user) } }
        ]
      });

      // Delete admin records
      await Admin.deleteMany({ _id: { $in: adminIds } });
      
      // Delete user accounts permanently
      await User.deleteMany({ _id: { $in: admins.map(a => a.user) } });
      
      return res.status(200).json({
        success: true,
        message: `${admins.length} admins permanently deleted successfully`,
        data: {
          deletedAdmins: admins.map(admin => ({
            id: admin._id,
            username: adminUsers.find(u => u._id.toString() === admin.user.toString())?.username,
            email: adminUsers.find(u => u._id.toString() === admin.user.toString())?.email,
            role: admin.role
          })),
          contentDeleted: deleteContent
        }
      });
    } else {
      // Soft delete - deactivate admins
      await Admin.updateMany(
        { _id: { $in: adminIds } },
        { isActive: false }
      );

      // Also deactivate user accounts
      await User.updateMany(
        { _id: { $in: admins.map(a => a.user) } },
        { isActive: false }
      );

      return res.status(200).json({
        success: true,
        message: `${admins.length} admins deactivated successfully`,
        data: {
          deactivatedAdmins: admins.map(admin => ({
            id: admin._id,
            username: adminUsers.find(u => u._id.toString() === admin.user.toString())?.username,
            email: adminUsers.find(u => u._id.toString() === admin.user.toString())?.email,
            role: admin.role
          }))
        }
      });
    }

  } catch (error: any) {
    console.error('Bulk delete admins error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Restore Admin (Reactivate)
async function restoreAdmin(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { adminId } = req.body;

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
        message: 'Only super admin can restore admins'
      });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Reactivate admin
    admin.isActive = true;
    await admin.save();

    // Also reactivate the user account
    await User.findByIdAndUpdate(admin.user, { isActive: true });

    // Populate user details
    await admin.populate('user', 'username email fullName avatar');

    return res.status(200).json({
      success: true,
      message: 'Admin restored successfully',
      data: { admin }
    });

  } catch (error: any) {
    console.error('Restore admin error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
