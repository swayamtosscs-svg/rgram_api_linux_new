import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import Follow from '@/lib/models/Follow';
import User from '@/lib/models/User';
import Notification from '@/lib/models/Notification';
import { verifyToken } from '@/lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await connectDB();
    
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const { user_id } = req.query;
    if (!user_id || typeof user_id !== 'string') {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const currentUserId = decoded.userId;
    if (currentUserId === user_id) {
      return res.status(400).json({ success: false, message: 'Cannot reject your own request' });
    }

    // Find the pending follow request
    const followRequest = await Follow.findOne({
      follower: user_id,
      following: currentUserId,
      status: 'pending'
    });

    if (!followRequest) {
      return res.status(404).json({ 
        success: false, 
        message: 'No pending follow request found from this user' 
      });
    }

    // Update the follow request status to rejected
    followRequest.status = 'rejected';
    followRequest.respondedAt = new Date();
    await followRequest.save();

    // Create notification for the requester (optional - you might not want to notify about rejection)
    // await Notification.create({
    //   recipient: user_id,
    //   sender: currentUserId,
    //   type: 'follow',
    //   content: `${(await User.findById(currentUserId))?.fullName || 'Someone'} declined your follow request`
    // });

    // Populate the follow request for response
    await followRequest.populate('follower', 'username fullName avatar');
    await followRequest.populate('following', 'username fullName avatar');

    return res.status(200).json({
      success: true,
      message: 'Follow request rejected successfully',
      data: { followRequest }
    });

  } catch (error: any) {
    console.error('Reject follow request error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
}

