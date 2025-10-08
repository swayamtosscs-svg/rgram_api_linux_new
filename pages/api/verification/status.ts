import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import User from '../../../lib/models/User';
import { VerificationBadge } from '../../../lib/models/Verification';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Get user details
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get verification badge
    const badge = await VerificationBadge.findOne({ 
      user: userId, 
      status: 'active' 
    }).populate('verifiedBy', 'username fullName');

    // Get verification history
    const verificationHistory = await VerificationBadge.find({ 
      user: userId 
    }).populate('verifiedBy', 'username fullName').sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          avatar: user.avatar,
          isVerified: user.isVerified,
          verificationType: user.verificationType
        },
        currentBadge: badge,
        verificationHistory,
        isVerified: !!badge,
        verificationType: badge?.type || null
      }
    });

  } catch (error: any) {
    console.error('Get verification status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
