import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import FriendRequest from '../../../lib/models/FriendRequest';
import User from '../../../lib/models/User';
import Notification from '../../../lib/models/Notification';
import { verifyToken } from '../../../lib/middleware/auth';

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

    const { senderId, recipientId, message } = req.body;
    
    if (!recipientId) {
      return res.status(400).json({ success: false, message: 'Recipient ID is required' });
    }

    // Use authenticated user as sender if senderId not provided, otherwise validate
    const actualSenderId = senderId || decoded.userId;
    
    if (senderId && decoded.userId !== senderId) {
      return res.status(403).json({ success: false, message: 'You can only send friend requests as yourself' });
    }
    
    // Check if trying to send request to self
    if (actualSenderId === recipientId) {
      return res.status(400).json({ success: false, message: 'Cannot send friend request to yourself' });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ success: false, message: 'Recipient user not found' });
    }

    // Check if request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: actualSenderId, recipient: recipientId },
        { sender: recipientId, recipient: actualSenderId }
      ]
    });

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        return res.status(400).json({ 
          success: false, 
          message: existingRequest.sender.toString() === actualSenderId 
            ? 'Friend request already sent' 
            : 'Friend request already received from this user' 
        });
      } else if (existingRequest.status === 'accepted') {
        return res.status(400).json({ success: false, message: 'Already friends with this user' });
      } else if (existingRequest.status === 'rejected') {
        // Update rejected request to pending
        existingRequest.status = 'pending';
        existingRequest.sentAt = new Date();
        existingRequest.respondedAt = undefined;
        if (message) existingRequest.message = message;
        await existingRequest.save();
        
        // Create notification
        await Notification.create({
          recipient: recipientId,
          sender: actualSenderId,
          type: 'friend_request'
        });

        return res.status(200).json({ 
          success: true, 
          message: 'Friend request sent successfully',
          data: { friendRequest: existingRequest }
        });
      }
    }

    // Create new friend request
    const friendRequest = await FriendRequest.create({
      sender: actualSenderId,
      recipient: recipientId,
      message: message || '',
      sentAt: new Date()
    });

    // Create notification
    await Notification.create({
      recipient: recipientId,
      sender: actualSenderId,
      type: 'friend_request'
    });

    await friendRequest.populate('sender', 'username fullName avatar');
    await friendRequest.populate('recipient', 'username fullName avatar');

    return res.status(201).json({
      success: true,
      message: 'Friend request sent successfully',
      data: { friendRequest }
    });

  } catch (error: any) {
    console.error('Send friend request error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
}
