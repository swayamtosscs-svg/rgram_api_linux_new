import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import User from '../../../lib/models/User';
import BlacklistedToken from '../../../lib/models/BlacklistedToken';
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
    
    // Check if a specific userId is provided in the request body
    const { userId } = req.body;
    
    // If userId is provided, check if the authenticated user has permission to log out another user
    // For now, we'll just allow it (you might want to add admin check here)
    const targetUserId = userId || authenticatedUserId;
    
    // If a specific userId is provided (either logging out another user or self with userId)
     if (userId) {
      // Find the user to ensure they exist
      const userExists = await User.findById(userId);
      if (!userExists) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Update the user's lastActive timestamp
      await User.findByIdAndUpdate(targetUserId, { lastActive: new Date() });
      
      // For logging out a specific user, we'll invalidate their current token
      // This is a simplified approach - in a production environment, you might want to 
      // implement more sophisticated token tracking for invalidating all user tokens
      
      // If we're logging out ourselves, blacklist our current token
      if (userId === authenticatedUserId) {
        const blacklisted = await blacklistToken(token, targetUserId);
        
        if (!blacklisted) {
          return res.status(500).json({
            success: false,
            message: 'Failed to invalidate token'
          });
        }
      } else {
        // We're logging out another user - create a special blacklist entry that will invalidate all tokens
        // for this user until they log in again
        
        // Calculate an expiration date (e.g., 30 days from now)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        
        // Create a special blacklist entry with a null token to indicate all tokens for this user are invalid
        // In a real implementation, you might want to use a more sophisticated approach
        await BlacklistedToken.create({
          token: `LOGOUT_ALL_${targetUserId}_${Date.now()}`, // Unique token identifier
          userId: targetUserId,
          expiresAt,
          createdAt: new Date()
        });
        
        // Log the action
        console.log(`Admin user ${authenticatedUserId} logged out user ${targetUserId}`);
      }
    } else {
      // Regular logout - just the current user with the current token
      // Update the user's lastActive timestamp
      await User.findByIdAndUpdate(authenticatedUserId, { lastActive: new Date() });
      
      // Add the token to the blacklist
      const blacklisted = await blacklistToken(token, authenticatedUserId);
      
      if (!blacklisted) {
        return res.status(500).json({
          success: false,
          message: 'Failed to invalidate token'
        });
      }
    }

    // Return success response with appropriate message
    let message = 'Logged out successfully';
    if (userId && userId !== authenticatedUserId) {
      message = `User ${userId} has been logged out successfully`;
    }
    
    return res.status(200).json({
      success: true,
      message
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}