import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import { ContentReport } from '../../../lib/models/Admin';
import { verifyToken } from '../../../lib/middleware/auth';

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
      return createReport(req, res, decoded.userId);
    case 'GET':
      return getReports(req, res, decoded.userId);
    default:
      return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}

// Create Report
async function createReport(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { contentId, contentType, reason, description } = req.body;

    // Validate required fields
    if (!contentId || !contentType || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Content ID, content type, and reason are required'
      });
    }

    // Validate content type
    if (!['post', 'reel', 'story', 'comment'].includes(contentType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid content type'
      });
    }

    // Check if user has already reported this content
    const existingReport = await ContentReport.findOne({
      reporter: userId,
      reportedContent: contentId,
      contentType
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'You have already reported this content'
      });
    }

    // Create report
    const report = await ContentReport.create({
      reporter: userId,
      reportedContent: contentId,
      contentType,
      reason,
      description
    });

    return res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: { report }
    });

  } catch (error: any) {
    console.error('Create report error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Get User's Reports
async function getReports(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query: any = { reporter: userId };
    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const reports = await ContentReport.find(query)
      .populate('reviewedBy', 'username fullName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await ContentReport.countDocuments(query);

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
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
