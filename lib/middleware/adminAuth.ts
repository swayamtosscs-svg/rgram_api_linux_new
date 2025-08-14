import { NextApiRequest, NextApiResponse } from 'next';
import User from '../models/User';
import dbConnect from '../database';
import { verifyToken } from './auth';

export async function adminMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => Promise<void>
) {
  try {
    await dbConnect();
    
    // Get token from header
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify token and get user ID
    const decoded = await verifyToken(token);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Get user from database
    const user = await User.findOne({ _id: decoded.userId });

    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Add user to request for further use
    req.adminUser = user;
    await next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({ message: 'Server error in admin middleware' });
  }
}
