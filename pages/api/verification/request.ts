import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import User from '@/lib/models/User';
import { VerificationRequest, VerificationBadge } from '../../../lib/models/Verification';
import { verifyToken } from '@/lib/middleware/auth';
import { uploadFileToLocal } from '../../../utils/localStorage';

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
      return createVerificationRequest(req, res, decoded.userId);
    case 'GET':
      return getVerificationRequests(req, res, decoded.userId);
    case 'PUT':
      return updateVerificationRequest(req, res, decoded.userId);
    case 'DELETE':
      return cancelVerificationRequest(req, res, decoded.userId);
    default:
      return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}

// Create Verification Request
async function createVerificationRequest(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { 
      type, 
      personalInfo, 
      reason, 
      businessInfo, 
      socialMediaProfiles, 
      additionalInfo,
      documents 
    } = req.body;

    // Validate required fields
    if (!type || !personalInfo || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Type, personal info, and reason are required'
      });
    }

    // Validate type
    if (!['personal', 'business', 'celebrity', 'organization'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid documents type'
      });
    }

    // Check if user already has a documents badge
    const existingBadge = await VerificationBadge.findOne({ 
      user: userId, 
      status: 'active' 
    });

    if (existingBadge) {
      return res.status(400).json({
        success: false,
        message: 'User is already verified'
      });
    }

    // Check if user has a pending request
    const pendingRequest = await VerificationRequest.findOne({ 
      user: userId, 
      status: 'pending' 
    });

    if (pendingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending documents request'
      });
    }

    // Process document uploads if provided
    let processedDocuments: any = {};
    if (documents) {
      if (documents.idProof) {
        const uploadResult = await uploadFileToLocal(
          documents.idProof,
          userId,
          'documents'
        );
        if (uploadResult.success) {
          processedDocuments.idProof = uploadResult.data?.publicUrl;
        }
      }

      if (documents.addressProof) {
        const uploadResult = await uploadFileToLocal(
          documents.addressProof,
          userId,
          'documents'
        );
        if (uploadResult.success) {
          processedDocuments.addressProof = uploadResult.data?.publicUrl;
        }
      }

      if (documents.businessProof) {
        const uploadResult = await uploadFileToLocal(
          documents.businessProof,
          userId,
          'documents'
        );
        if (uploadResult.success) {
          processedDocuments.businessProof = uploadResult.data?.publicUrl;
        }
      }

      if (documents.additionalDocuments && Array.isArray(documents.additionalDocuments)) {
        processedDocuments.additionalDocuments = [];
        for (const doc of documents.additionalDocuments) {
          const uploadResult = await uploadFileToLocal(
            doc,
            userId,
            'documents'
          );
          if (uploadResult.success) {
            processedDocuments.additionalDocuments.push(uploadResult.data?.publicUrl);
          }
        }
      }
    }

    // Determine priority based on type and social media presence
    let priority = 'medium';
    if (type === 'celebrity' || type === 'organization') {
      priority = 'high';
    }
    if (socialMediaProfiles && socialMediaProfiles.length > 0) {
      const hasHighFollowers = socialMediaProfiles.some((profile: any) => 
        profile.followers && profile.followers > 100000
      );
      if (hasHighFollowers) {
        priority = 'high';
      }
    }

    // Create verification request
    const request = await VerificationRequest.create({
      user: userId,
      type,
      personalInfo,
      reason,
      documents: processedDocuments,
      businessInfo,
      socialMediaProfiles,
      additionalInfo,
      priority
    });

    // Populate user details
    await request.populate('user', 'username fullName email avatar');

    return res.status(201).json({
      success: true,
      message: 'Verification request submitted successfully',
      data: { request }
    });

  } catch (error: any) {
    console.error('Create documents request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Get User's Verification Requests
async function getVerificationRequests(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query: any = { user: userId };
    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const requests = await VerificationRequest.find(query)
      .populate('reviewedBy', 'username fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await VerificationRequest.countDocuments(query);

    // Get user's documents badge if exists
    const badge = await VerificationBadge.findOne({ user: userId });

    return res.status(200).json({
      success: true,
      data: {
        requests,
        badge,
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
    console.error('Get documents requests error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Update Verification Request
async function updateVerificationRequest(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { requestId } = req.query;
    const { personalInfo, businessInfo, socialMediaProfiles, additionalInfo, documents } = req.body;

    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: 'Request ID is required'
      });
    }

    const request = await VerificationRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Verification request not found'
      });
    }

    // Check if user owns this request
    if (request.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own documents requests'
      });
    }

    // Check if request can be updated
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending requests can be updated'
      });
    }

    // Update fields
    if (personalInfo) request.personalInfo = { ...request.personalInfo, ...personalInfo };
    if (businessInfo) request.businessInfo = { ...request.businessInfo, ...businessInfo };
    if (socialMediaProfiles) request.socialMediaProfiles = socialMediaProfiles;
    if (additionalInfo) request.additionalInfo = additionalInfo;

    // Process document updates if provided
    if (documents) {
      // Similar document processing as in create request
      // Implementation depends on your specific needs
    }

    await request.save();

    // Populate user details
    await request.populate('user', 'username fullName email avatar');

    return res.status(200).json({
      success: true,
      message: 'Verification request updated successfully',
      data: { request }
    });

  } catch (error: any) {
    console.error('Update documents request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Cancel Verification Request
async function cancelVerificationRequest(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { requestId } = req.query;

    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: 'Request ID is required'
      });
    }

    const request = await VerificationRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Verification request not found'
      });
    }

    // Check if user owns this request
    if (request.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own documents requests'
      });
    }

    // Check if request can be cancelled
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending requests can be cancelled'
      });
    }

    // Delete the request
    await VerificationRequest.findByIdAndDelete(requestId);

    return res.status(200).json({
      success: true,
      message: 'Verification request cancelled successfully'
    });

  } catch (error: any) {
    console.error('Cancel documents request error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
