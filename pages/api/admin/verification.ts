import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import User from '../../../lib/models/User';
import { VerificationRequest, VerificationBadge } from '../../../lib/models/Verification';
import { verifyAdminToken } from '../../../lib/middleware/adminAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const decoded = await verifyAdminToken(token);
  if (!decoded) {
    return res.status(401).json({ success: false, message: 'Invalid admin token' });
  }

  switch (req.method) {
    case 'GET':
      return getVerificationRequests(req, res, decoded);
    case 'POST':
      return handleVerificationAction(req, res, decoded);
    case 'PUT':
      return updateVerificationBadge(req, res, decoded);
    case 'DELETE':
      return revokeVerificationBadge(req, res, decoded);
    default:
      return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}

// Get Verification Requests (Admin)
async function getVerificationRequests(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status = 'pending', 
      type, 
      priority,
      search 
    } = req.query;

    const query: any = {};
    
    if (status) {
      query.status = status;
    }
    
    if (type) {
      query.type = type;
    }
    
    if (priority) {
      query.priority = priority;
    }

    if (search) {
      query.$or = [
        { 'personalInfo.fullName': { $regex: search, $options: 'i' } },
        { 'businessInfo.businessName': { $regex: search, $options: 'i' } },
        { reason: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const requests = await VerificationRequest.find(query)
      .populate('user', 'username fullName email avatar')
      .populate('reviewedBy', 'username fullName')
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await VerificationRequest.countDocuments(query);

    // Get statistics
    const stats = await Promise.all([
      VerificationRequest.countDocuments({ status: 'pending' }),
      VerificationRequest.countDocuments({ status: 'approved' }),
      VerificationRequest.countDocuments({ status: 'rejected' }),
      VerificationRequest.countDocuments({ status: 'under_review' }),
      VerificationBadge.countDocuments({ status: 'active' })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        requests,
        statistics: {
          pending: stats[0],
          approved: stats[1],
          rejected: stats[2],
          underReview: stats[3],
          totalVerified: stats[4]
        },
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
    console.error('Get verification requests error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Handle Verification Action (Approve/Reject)
async function handleVerificationAction(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const { action, requestId, reason, badgeType, expiresAt } = req.body;

    if (!action || !requestId) {
      return res.status(400).json({
        success: false,
        message: 'Action and request ID are required'
      });
    }

    const request = await VerificationRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Verification request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request has already been processed'
      });
    }

    switch (action) {
      case 'approve':
        return approveVerification(req, res, admin, request, badgeType, expiresAt);
      case 'reject':
        return rejectVerification(req, res, admin, request, reason);
      case 'under_review':
        return markUnderReview(req, res, admin, request, reason);
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }

  } catch (error: any) {
    console.error('Handle verification action error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Approve Verification
async function approveVerification(req: NextApiRequest, res: NextApiResponse, admin: any, request: any, badgeType: string, expiresAt?: string) {
  try {
    // Check if user already has a verification badge
    const existingBadge = await VerificationBadge.findOne({ 
      user: request.user, 
      status: 'active' 
    });

    if (existingBadge) {
      return res.status(400).json({
        success: false,
        message: 'User already has an active verification badge'
      });
    }

    // Determine badge type based on request type if not provided
    let finalBadgeType = badgeType;
    if (!finalBadgeType) {
      switch (request.type) {
        case 'personal':
          finalBadgeType = 'blue_tick';
          break;
        case 'business':
          finalBadgeType = 'business_tick';
          break;
        case 'celebrity':
          finalBadgeType = 'gold_tick';
          break;
        case 'organization':
          finalBadgeType = 'silver_tick';
          break;
        default:
          finalBadgeType = 'blue_tick';
      }
    }

    // Create verification badge
    const badge = await VerificationBadge.create({
      user: request.user,
      type: finalBadgeType,
      verifiedBy: admin.userId,
      reason: 'Verified by admin',
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      verifiedAt: new Date()
    });

    // Update request status
    request.status = 'approved';
    request.reviewedBy = admin.userId;
    request.reviewedAt = new Date();
    await request.save();

    // Update user's verification status
    await User.findByIdAndUpdate(request.user, { 
      isVerified: true,
      verificationType: finalBadgeType
    });

    // Populate details
    await request.populate('user', 'username fullName email avatar');
    await badge.populate('user', 'username fullName email avatar');

    return res.status(200).json({
      success: true,
      message: 'Verification approved successfully',
      data: { 
        request, 
        badge,
        badgeType: finalBadgeType
      }
    });

  } catch (error: any) {
    console.error('Approve verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Reject Verification
async function rejectVerification(req: NextApiRequest, res: NextApiResponse, admin: any, request: any, reason: string) {
  try {
    // Update request status
    request.status = 'rejected';
    request.reviewedBy = admin.userId;
    request.reviewedAt = new Date();
    request.rejectionReason = reason;
    await request.save();

    // Populate details
    await request.populate('user', 'username fullName email avatar');

    return res.status(200).json({
      success: true,
      message: 'Verification rejected successfully',
      data: { request }
    });

  } catch (error: any) {
    console.error('Reject verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Mark Under Review
async function markUnderReview(req: NextApiRequest, res: NextApiResponse, admin: any, request: any, reason: string) {
  try {
    // Update request status
    request.status = 'under_review';
    request.reviewedBy = admin.userId;
    request.reviewedAt = new Date();
    request.additionalInfo = reason;
    await request.save();

    // Populate details
    await request.populate('user', 'username fullName email avatar');

    return res.status(200).json({
      success: true,
      message: 'Verification marked as under review',
      data: { request }
    });

  } catch (error: any) {
    console.error('Mark under review error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Update Verification Badge
async function updateVerificationBadge(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const { userId, badgeType, expiresAt, reason } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const badge = await VerificationBadge.findOne({ 
      user: userId, 
      status: 'active' 
    });

    if (!badge) {
      return res.status(404).json({
        success: false,
        message: 'Active verification badge not found'
      });
    }

    // Update badge
    if (badgeType) badge.type = badgeType;
    if (expiresAt) badge.expiresAt = new Date(expiresAt);
    if (reason) badge.reason = reason;

    await badge.save();

    // Update user's verification type
    await User.findByIdAndUpdate(userId, { 
      verificationType: badge.type
    });

    // Populate details
    await badge.populate('user', 'username fullName email avatar');

    return res.status(200).json({
      success: true,
      message: 'Verification badge updated successfully',
      data: { badge }
    });

  } catch (error: any) {
    console.error('Update verification badge error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Revoke Verification Badge
async function revokeVerificationBadge(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const { userId, reason } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const badge = await VerificationBadge.findOne({ 
      user: userId, 
      status: 'active' 
    });

    if (!badge) {
      return res.status(404).json({
        success: false,
        message: 'Active verification badge not found'
      });
    }

    // Revoke badge
    badge.status = 'revoked';
    badge.reason = reason;
    await badge.save();

    // Update user's verification status
    await User.findByIdAndUpdate(userId, { 
      isVerified: false,
      verificationType: null
    });

    // Populate details
    await badge.populate('user', 'username fullName email avatar');

    return res.status(200).json({
      success: true,
      message: 'Verification badge revoked successfully',
      data: { badge }
    });

  } catch (error: any) {
    console.error('Revoke verification badge error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
