import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../lib/database';
import User from '../../../../lib/models/User';
import { generateToken } from '../../../../lib/middleware/auth';

// Mock user data for testing
const MOCK_USER_DATA = {
  googleId: 'mock_google_id_123',
  email: 'mock_user@example.com',
  name: 'Mock User',
  avatar: 'https://via.placeholder.com/150'
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log('Testing Google callback with mock data...');
    
    // Connect to database
    await connectDB();
    console.log('Database connection successful');
    
    // Check if mock user already exists
    let user = await User.findOne({ email: MOCK_USER_DATA.email });
    console.log('User search result:', user ? 'User found' : 'User not found');
    
    if (!user) {
      // Create mock user
      const username = MOCK_USER_DATA.email.split('@')[0] + Math.floor(Math.random() * 1000);
      
      user = await User.create({
        email: MOCK_USER_DATA.email,
        googleId: MOCK_USER_DATA.googleId,
        fullName: MOCK_USER_DATA.name,
        username,
        password: Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10),
        avatar: MOCK_USER_DATA.avatar || '',
        isEmailVerified: true,
      });
      console.log('New user created:', username);
    }
    
    // Update last active
    user.lastActive = new Date();
    await user.save();
    console.log('User last active updated');
    
    // Generate token
    const token = generateToken(user._id);
    console.log('JWT token generated');
    
    // Return success response with token
    return res.status(200).json({
      success: true,
      message: 'Mock Google authentication successful',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        avatar: user.avatar
      },
      token
    });
  } catch (error) {
    console.error('Error in test callback:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Mock Google authentication failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}