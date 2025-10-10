import { NextApiRequest, NextApiResponse } from 'next';

// Mock user data that would normally come from the database
const mockUsers = [
  {
    _id: 'mock-user-id-123',
    email: 'test.google@example.com',
    username: 'testgoogle123',
    fullName: 'Test Google User',
    googleId: 'google_mock123',
    avatar: 'https://example.com/avatar.jpg',
    bio: 'This is a mock user for testing',
    website: 'https://example.com',
    location: 'Test Location',
    religion: 'Test Religion',
    isPrivate: false,
    isEmailVerified: true,
    isVerified: false,
    followersCount: 10,
    followingCount: 20,
    postsCount: 5,
    reelsCount: 2,
    createdAt: new Date('2023-01-01'),
    lastActive: new Date()
  }
];

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
    const { email, name, googleId, avatar } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and Google ID are required' 
      });
    }

    // Check if user already exists in our mock database
    let user = mockUsers.find(u => u.email === email || u.googleId === googleId);

    if (!user) {
      // Create a new mock user
      const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
      
      user = {
        _id: 'mock-user-id-' + Math.random().toString(36).substring(2, 10),
        email,
        googleId,
        fullName: name,
        username,
        avatar: avatar || '',
        bio: '',
        website: '',
        location: '',
        religion: '',
        isPrivate: false,
        isEmailVerified: true,
        isVerified: false,
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        reelsCount: 0,
        createdAt: new Date(),
        lastActive: new Date()
      };
      
      // Add to mock database
      mockUsers.push(user);
    }

    // Generate a mock token
    const token = 'mock_jwt_token_' + Math.random().toString(36).substring(2, 15);

    res.json({
      success: true,
      message: 'Google login successful (MOCK)',
      data: {
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          fullName: user.fullName,
          avatar: user.avatar,
          bio: user.bio,
          website: user.website,
          location: user.location,
          religion: user.religion,
          isPrivate: user.isPrivate,
          isEmailVerified: user.isEmailVerified,
          isVerified: user.isVerified,
          followersCount: user.followersCount,
          followingCount: user.followingCount,
          postsCount: user.postsCount,
          reelsCount: user.reelsCount,
          createdAt: user.createdAt,
          lastActive: user.lastActive
        },
        token
      }
    });
  } catch (error: any) {
    console.error('Google login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
}