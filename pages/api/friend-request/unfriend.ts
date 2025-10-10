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

    const { friendId } = req.body;
    
    if (!friendId) {
      return res.status(400).json({ success: false, message: 'Friend ID is required' });
    }

    const currentUserId = decoded.userId;

    // Check if trying to unfriend yourself
    if (currentUserId === friendId) {
      return res.status(400).json({ success: false, message: 'Cannot unfriend yourself' });
    }

    // Find the accepted friend request between the two users
    const friendRequest = await FriendRequest.findOne({
      $or: [
        { sender: currentUserId, recipient: friendId, status: 'accepted' },
        { sender: friendId, recipient: currentUserId, status: 'accepted' }
      ]
    });

    if (!friendRequest) {
      return res.status(404).json({ success: false, message: 'Friendship not found' });
    }

    // Delete the friend request (unfriend)
    await FriendRequest.findByIdAndDelete(friendRequest._id);

    return res.status(200).json({
      success: true,
      message: 'Successfully unfriended user',
      data: {
        unfriendedUserId: friendId,
        friendshipRemovedAt: new Date()
      }
    });

  } catch (error: any) {
    console.error('Unfriend error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
}
