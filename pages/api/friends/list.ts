import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import FriendRequest from '@/lib/models/FriendRequest';
import { verifyToken } from '@/lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
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

    const currentUserId = decoded.userId;
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Get accepted friend requests where user is either sender or recipient
    const friendRequests = await FriendRequest.find({
      $or: [
        { sender: currentUserId, status: 'accepted' },
        { recipient: currentUserId, status: 'accepted' }
      ]
    })
      .populate('sender', 'username fullName avatar')
      .populate('recipient', 'username fullName avatar')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // Transform to get friend details (not the current user)
    const friends = friendRequests.map((request: any) => {
      if (request.sender._id.toString() === currentUserId) {
        return {
          _id: request.recipient._id,
          username: request.recipient.username,
          fullName: request.recipient.fullName,
          avatar: request.recipient.avatar,
          friendshipDate: request.respondedAt
        };
      } else {
        return {
          _id: request.sender._id,
          username: request.sender.username,
          fullName: request.sender.fullName,
          avatar: request.sender.avatar,
          friendshipDate: request.respondedAt
        };
      }
    });

    const totalFriends = await FriendRequest.countDocuments({
      $or: [
        { sender: currentUserId, status: 'accepted' },
        { recipient: currentUserId, status: 'accepted' }
      ]
    });

    const totalPages = Math.ceil(totalFriends / Number(limit));

    return res.status(200).json({
      success: true,
      message: 'Friends list retrieved successfully',
      data: {
        friends,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalFriends,
          hasNextPage: Number(page) < totalPages,
          hasPrevPage: Number(page) > 1
        }
      }
    });

  } catch (error: any) {
    console.error('List friends error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
}
