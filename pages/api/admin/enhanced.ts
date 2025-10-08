import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import Post from '../../../lib/models/Post';
import User from '../../../lib/models/User';
import { Admin, UserBlock, ContentReport } from '../../../lib/models/Admin';
import Notification from '../../../lib/models/Notification';
import { verifyToken } from '../../../lib/middleware/auth';
import { deleteFileByUrl } from '../../../utils/localStorage';

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

  // Check if user is admin
  const admin = await Admin.findOne({ user: decoded.userId, isActive: true });
  if (!admin) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }

  switch (req.method) {
    case 'GET':
      return getDashboardData(req, res, admin);
    case 'POST':
      return handleAdminAction(req, res, admin);
    case 'PUT':
      return updateAdminSettings(req, res, admin);
    default:
      return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}

// Get Admin Dashboard Data
async function getDashboardData(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const { type, page = 1, limit = 10 } = req.query;

    switch (type) {
      case 'stats':
        return getStats(req, res);
      case 'users':
        return getUsers(req, res, admin);
      case 'content':
        return getContent(req, res, admin);
      case 'reports':
        return getReports(req, res, admin);
      case 'blocks':
        return getBlocks(req, res, admin);
      default:
        return getOverviewStats(req, res);
    }

  } catch (error: any) {
    console.error('Get dashboard data error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Get Overview Statistics
async function getOverviewStats(req: NextApiRequest, res: NextApiResponse) {
  try {
    const [
      totalUsers,
      activeUsers,
      totalPosts,
      totalReels,
      totalStories,
      totalReports,
      pendingReports,
      blockedUsers
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Post.countDocuments({ type: 'post', isActive: true }),
      Post.countDocuments({ type: 'reel', isActive: true }),
      Post.countDocuments({ type: 'story', isActive: true }),
      ContentReport.countDocuments(),
      ContentReport.countDocuments({ status: 'pending' }),
      UserBlock.countDocuments({ isActive: true })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          totalPosts,
          totalReels,
          totalStories,
          totalReports,
          pendingReports,
          blockedUsers
        }
      }
    });

  } catch (error: any) {
    console.error('Get overview stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

// Get Detailed Statistics
async function getStats(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { period = '7d' } = req.query;
    
    let dateFilter: any = {};
    const now = new Date();
    
    switch (period) {
      case '1d':
        dateFilter = { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) };
        break;
      case '7d':
        dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
        break;
      case '30d':
        dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
        break;
      case '90d':
        dateFilter = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
        break;
    }

    const [
      newUsers,
      newPosts,
      newReels,
      newStories,
      newReports
    ] = await Promise.all([
      User.countDocuments({ createdAt: dateFilter }),
      Post.countDocuments({ type: 'post', createdAt: dateFilter }),
      Post.countDocuments({ type: 'reel', createdAt: dateFilter }),
      Post.countDocuments({ type: 'story', createdAt: dateFilter }),
      ContentReport.countDocuments({ createdAt: dateFilter })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        period,
        stats: {
          newUsers,
          newPosts,
          newReels,
          newStories,
          newReports
        }
      }
    });

  } catch (error: any) {
    console.error('Get stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

// Get Users List
async function getUsers(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    if (!admin.permissions.canManageUsers) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied: Cannot manage users'
      });
    }

    const { page = 1, limit = 10, search, status } = req.query;
    
    const query: any = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      query.isActive = status === 'active';
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: {
        users,
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
    console.error('Get users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

// Get Content List
async function getContent(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    if (!admin.permissions.canModerateContent) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied: Cannot moderate content'
      });
    }

    const { page = 1, limit = 10, type, status, search } = req.query;
    
    const query: any = {};
    if (type) {
      query.type = type;
    }
    if (status) {
      query.isActive = status === 'active';
    }
    if (search) {
      query.$or = [
        { content: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const content = await Post.find(query)
      .populate('author', 'username fullName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Post.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: {
        content,
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
    console.error('Get content error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

// Get Reports
async function getReports(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    if (!admin.permissions.canManageReports) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied: Cannot manage reports'
      });
    }

    const { page = 1, limit = 10, status = 'pending' } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const reports = await ContentReport.find({ status })
      .populate('reporter', 'username fullName avatar')
      .populate('reviewedBy', 'username fullName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await ContentReport.countDocuments({ status });

    return res.status(200).json({
      success: true,
      data: {
        reports,
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
    console.error('Get reports error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

// Get User Blocks
async function getBlocks(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    if (!admin.permissions.canBlockUsers) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied: Cannot block users'
      });
    }

    const { page = 1, limit = 10, userId } = req.query;
    
    const query: any = {};
    if (userId) {
      query.userId = userId;
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const blocks = await UserBlock.find(query)
      .populate('userId', 'username fullName avatar')
      .populate('blockedBy', 'username fullName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await UserBlock.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: {
        blocks,
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
    console.error('Get blocks error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

// Handle Admin Actions
async function handleAdminAction(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const { action, targetId, reason, duration, type } = req.body;

    switch (action) {
      case 'block_user':
        return blockUser(req, res, admin, targetId, reason, duration, type);
      case 'unblock_user':
        return unblockUser(req, res, admin, targetId);
      case 'delete_content':
        return deleteContent(req, res, admin, targetId, reason);
      case 'review_report':
        return reviewReport(req, res, admin, targetId, reason);
      case 'create_admin':
        return createAdmin(req, res, admin, targetId);
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }

  } catch (error: any) {
    console.error('Admin action error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Block User
async function blockUser(req: NextApiRequest, res: NextApiResponse, admin: any, userId: string, reason: string, duration?: number, type: string = 'temporary') {
  try {
    if (!admin.permissions.canBlockUsers) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied: Cannot block users'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is already blocked
    const existingBlock = await UserBlock.findOne({
      userId,
      isActive: true,
      $or: [
        { type: 'permanent' },
        { expiresAt: { $gt: new Date() } }
      ]
    });

    if (existingBlock) {
      return res.status(400).json({
        success: false,
        message: 'User is already blocked'
      });
    }

    // Create block
    const block = await UserBlock.create({
      userId,
      blockedBy: admin._id,
      reason,
      type,
      duration: type === 'temporary' ? duration : undefined
    });

    // Deactivate user if permanent block
    if (type === 'permanent') {
      user.isActive = false;
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: `User blocked ${type}ly`,
      data: { block }
    });

  } catch (error: any) {
    console.error('Block user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

// Unblock User
async function unblockUser(req: NextApiRequest, res: NextApiResponse, admin: any, userId: string) {
  try {
    if (!admin.permissions.canBlockUsers) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied: Cannot block users'
      });
    }

    // Deactivate all active blocks for user
    await UserBlock.updateMany(
      { userId, isActive: true },
      { isActive: false }
    );

    // Reactivate user
    await User.findByIdAndUpdate(userId, { isActive: true });

    return res.status(200).json({
      success: true,
      message: 'User unblocked successfully'
    });

  } catch (error: any) {
    console.error('Unblock user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

// Delete Content
async function deleteContent(req: NextApiRequest, res: NextApiResponse, admin: any, contentId: string, reason: string) {
  try {
    if (!admin.permissions.canDeleteContent) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied: Cannot delete content'
      });
    }

    const content = await Post.findById(contentId);
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Delete media files
    const allMedia = [...(content.images || []), ...(content.videos || [])];
    for (const mediaUrl of allMedia) {
      if (mediaUrl && mediaUrl.includes('/assets/')) {
        await deleteFileByUrl(mediaUrl);
      }
    }

    // Soft delete content
    content.isActive = false;
    content.isRemoved = true;
    content.removedReason = reason;
    content.removedBy = admin._id;
    content.removedAt = new Date();
    await content.save();

    return res.status(200).json({
      success: true,
      message: 'Content deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete content error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

// Review Report
async function reviewReport(req: NextApiRequest, res: NextApiResponse, admin: any, reportId: string, action: string) {
  try {
    if (!admin.permissions.canManageReports) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied: Cannot manage reports'
      });
    }

    const report = await ContentReport.findById(reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    report.status = 'reviewed';
    report.reviewedBy = admin._id;
    report.reviewedAt = new Date();
    report.action = action;
    await report.save();

    return res.status(200).json({
      success: true,
      message: 'Report reviewed successfully'
    });

  } catch (error: any) {
    console.error('Review report error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

// Create Admin
async function createAdmin(req: NextApiRequest, res: NextApiResponse, admin: any, userId: string) {
  try {
    if (admin.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only super admin can create other admins'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is already admin
    const existingAdmin = await Admin.findOne({ user: userId });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'User is already an admin'
      });
    }

    const newAdmin = await Admin.create({
      user: userId,
      role: 'moderator',
      permissions: {
        canManageUsers: false,
        canDeleteContent: false,
        canBlockUsers: false,
        canViewAnalytics: false,
        canModerateContent: true,
        canManageReports: true
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: { admin: newAdmin }
    });

  } catch (error: any) {
    console.error('Create admin error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

// Update Admin Settings
async function updateAdminSettings(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const { permissions, role } = req.body;

    // Only super admin can change roles
    if (role && admin.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only super admin can change roles'
      });
    }

    if (permissions) {
      admin.permissions = { ...admin.permissions, ...permissions };
    }

    if (role) {
      admin.role = role;
    }

    await admin.save();

    return res.status(200).json({
      success: true,
      message: 'Admin settings updated successfully',
      data: { admin }
    });

  } catch (error: any) {
    console.error('Update admin settings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
