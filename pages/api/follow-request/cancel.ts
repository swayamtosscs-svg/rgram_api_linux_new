import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import Follow from '../../../lib/models/Follow';
import { verifyToken } from '../../../lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
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

    const { followRequestId } = req.query;
    if (!followRequestId) {
      return res.status(400).json({ success: false, message: 'Follow request ID is required' });
    }

    const currentUserId = decoded.userId;

    // Find the follow request
    const followRequest = await Follow.findById(followRequestId);
    if (!followRequest) {
      return res.status(404).json({ success: false, message: 'Follow request not found' });
    }

    // Check if the current user is the one who sent the request
    if (followRequest.follower.toString() !== currentUserId) {
      return res.status(403).json({ success: false, message: 'You can only cancel follow requests sent by you' });
    }

    // Check if the request is still pending
    if (followRequest.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot cancel follow request that is already ${followRequest.status}` 
      });
    }

    // Delete the follow request
    await Follow.findByIdAndDelete(followRequestId);

    return res.status(200).json({
      success: true,
      message: 'Follow request cancelled successfully'
    });

  } catch (error: any) {
    console.error('Cancel follow request error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
}
