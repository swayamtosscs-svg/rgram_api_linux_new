import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import User from '../../../lib/models/User';
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
    
    // Get the user ID from the decoded token
    const userId = decoded.userId;
    
    // Update the user's lastActive timestamp
    await User.findByIdAndUpdate(userId, { lastActive: new Date() });
    
    // Add the token to the blacklist
    const blacklisted = await blacklistToken(token, userId);
    
    if (!blacklisted) {
      return res.status(500).json({
        success: false,
        message: 'Failed to invalidate token'
      });
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
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