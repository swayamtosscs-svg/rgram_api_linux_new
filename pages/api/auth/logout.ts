import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import User from '@/lib/models/User';
import BlacklistedToken from '@/lib/models/BlacklistedToken';
import { blacklistToken, verifyToken } from '../../../lib/middleware/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      message: 'Method not allowed' 
    });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    // Extract the token
    const token = authHeader.split(' ')[1];
    
    // Verify the token to get the user ID
    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    
    // Connect to the database
    await connectDB();
    
    // Get the authenticated user ID from the decoded token
    const authenticatedUserId = decoded.userId;
    
    // Check if a specific userId is provided in the request body OR headers
    // Support both methods for flexibility
    const { userId: bodyUserId } = req.body;
    const headerUserId = req.headers.userid || req.headers['user-id'];
    
    const userId = bodyUserId || headerUserId;
    
    // Determine the target user ID
    const targetUserId = userId || authenticatedUserId;
    
    // If logging out another user, check if the authenticated user has permission
    if (userId && userId !== authenticatedUserId) {
      // Check if the authenticated user is an admin
      const authenticatedUser = await User.findById(authenticatedUserId);
      if (!authenticatedUser || !authenticatedUser.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Only admins can logout other users.'
        });
      }
      
      // Verify the target user exists
      const targetUser = await User.findById(targetUserId);
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: 'Target user not found'
        });
      }
      
      // Log the admin action
      console.log(`Admin user ${authenticatedUserId} logged out user ${targetUserId}`);
    }
    
    // Update the target user's lastActive timestamp
    await User.findByIdAndUpdate(targetUserId, { 
      lastActive: new Date() 
    });
    
    if (userId && userId !== authenticatedUserId) {
      // Logging out another user - create a special blacklist entry
      // This will invalidate all future tokens for this user
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now
      
      await BlacklistedToken.create({
        token: `LOGOUT_ALL_${targetUserId}_${Date.now()}`,
        userId: targetUserId,
        expiresAt,
        createdAt: new Date()
      });
      
      return res.status(200).json({
        success: true,
        message: `User ${targetUserId} has been logged out successfully`,
        data: {
          loggedOutUserId: targetUserId,
          loggedOutBy: authenticatedUserId,
          timestamp: new Date()
        }
      });
    } else {
      // Regular logout - blacklist the current token
      const blacklisted = await blacklistToken(token, targetUserId);
      
      if (!blacklisted) {
        return res.status(500).json({
          success: false,
          message: 'Failed to invalidate token'
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Logged out successfully',
        data: {
          loggedOutUserId: targetUserId,
          timestamp: new Date()
        }
      });
    }
    
  } catch (error: any) {
    console.error('Logout error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}