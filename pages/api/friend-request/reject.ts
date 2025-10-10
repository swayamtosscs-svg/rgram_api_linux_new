import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import FriendRequest from '@/lib/models/FriendRequest';
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

    const { requestId, senderId, recipientId } = req.body;
    
    if (!requestId) {
      return res.status(400).json({ success: false, message: 'Request ID is required' });
    }

    const currentUserId = decoded.userId;

    // Find the friend request
    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return res.status(404).json({ success: false, message: 'Friend request not found' });
    }

    // Verify the sender and recipient IDs match the request
    if (senderId && friendRequest.sender.toString() !== senderId) {
      return res.status(400).json({ success: false, message: 'Sender ID does not match the request' });
    }
    
    if (recipientId && friendRequest.recipient.toString() !== recipientId) {
      return res.status(400).json({ success: false, message: 'Recipient ID does not match the request' });
    }

    // Check if current user is the recipient
    if (friendRequest.recipient.toString() !== currentUserId) {
      return res.status(403).json({ success: false, message: 'You can only reject requests sent to you' });
    }

    // Check if request is pending
    if (friendRequest.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: `Friend request is already ${friendRequest.status}` 
      });
    }

    // Update request status to rejected
    friendRequest.status = 'rejected';
    friendRequest.respondedAt = new Date();
    await friendRequest.save();

    return res.status(200).json({
      success: true,
      message: 'Friend request rejected successfully'
    });

  } catch (error: any) {
    console.error('Reject friend request error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
}
