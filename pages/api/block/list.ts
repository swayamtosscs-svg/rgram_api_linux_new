import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await connectDB();
    
    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const userId = decoded.userId;
    
    // Get user with blocked users populated
    const user = await User.findById(userId)
      .populate({
        path: 'blockedUsers',
        select: '_id username fullName avatar bio isVerified verificationType createdAt lastActive',
        options: { sort: { createdAt: -1 } }
      })
      .select('blockedUsers');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Format blocked users data
    const blockedUsers = user.blockedUsers.map((blockedUser: any) => ({
      id: blockedUser._id,
      username: blockedUser.username,
      fullName: blockedUser.fullName,
      avatar: blockedUser.avatar,
      bio: blockedUser.bio,
      isVerified: blockedUser.isVerified,
      verificationType: blockedUser.verificationType,
      blockedAt: blockedUser.createdAt, // This will be the user's creation date, not block date
      lastActive: blockedUser.lastActive
    }));

    return res.status(200).json({
      success: true,
      message: 'Blocked users retrieved successfully',
      data: {
        blockedUsers,
        totalBlocked: blockedUsers.length
      }
    });

  } catch (error: any) {
    console.error('Get blocked users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
