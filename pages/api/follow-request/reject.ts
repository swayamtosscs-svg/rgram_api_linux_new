import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import Follow from '../../../lib/models/Follow';
import { verifyToken } from '../../../lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
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

    const { followRequestId } = req.body;
    if (!followRequestId) {
      return res.status(400).json({ success: false, message: 'Follow request ID is required' });
    }

    const currentUserId = decoded.userId;

    // Find the follow request
    const followRequest = await Follow.findById(followRequestId);
    if (!followRequest) {
      return res.status(404).json({ success: false, message: 'Follow request not found' });
    }

    // Check if the current user is the one being followed
    if (followRequest.following.toString() !== currentUserId) {
      return res.status(403).json({ success: false, message: 'You can only reject follow requests sent to you' });
    }

    // Check if the request is still pending
    if (followRequest.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: `Follow request is already ${followRequest.status}` 
      });
    }

    // Update the follow request status
    followRequest.status = 'rejected';
    followRequest.respondedAt = new Date();
    await followRequest.save();

    // Populate user details for response
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
