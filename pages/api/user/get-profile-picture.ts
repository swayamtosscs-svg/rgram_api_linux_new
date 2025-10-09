import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/middleware/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = await verifyToken(token);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Connect to database
    await connectDB();

    // Get user ID from query params (optional - defaults to authenticated user)
    const { userId } = req.query;
    const targetUserId = userId || decoded.userId;

    // Check if user exists
    const user = await User.findById(targetUserId).select('username fullName avatar isPrivate');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check privacy settings
    if (user.isPrivate && targetUserId !== decoded.userId) {
      // Check if the requesting user is following the target user
      const requestingUser = await User.findById(decoded.userId);
      if (!requestingUser) {
        return res.status(404).json({ error: 'Requesting user not found' });
      }

      // For now, allow access to profile picture even for private users
      // You can implement follow-checking logic here if needed
    }

    // Return profile picture information
    res.status(200).json({
      success: true,
      data: {
        userId: user._id,
        username: user.username,
        fullName: user.fullName,
        avatar: user.avatar || null,
        hasProfilePicture: !!user.avatar,
        isPrivate: user.isPrivate
      }
    });

  } catch (error) {
    console.error('Get profile picture error:', error);
    res.status(500).json({ 
      error: 'Failed to get profile picture',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

