import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../../lib/database';
import User from '../../../../lib/models/User';
import { generateToken } from '../../../../lib/middleware/auth';
import axios from 'axios';
import dns from 'dns';
import { promisify } from 'util';

// Promisify DNS lookup for async/await usage
const dnsLookup = promisify(dns.lookup);

// Function to check if Google APIs are accessible
async function checkGoogleApiAccess(): Promise<boolean> {
  try {
    await dnsLookup('oauth2.googleapis.com');
    return true;
  } catch (error) {
    console.error('DNS resolution error for Google APIs:', error);
    return false;
  }
}

// Mock user data for testing when code is not provided but in development mode
const MOCK_USER_DATA = {
  googleId: 'mock_google_id_123',
  email: 'mock_user@example.com',
  name: 'Mock User',
  avatar: 'https://via.placeholder.com/150'
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false,
      message: 'Method not allowed' 
    });
  }

  try {
    const { code } = req.query;
    const isDev = process.env.NODE_ENV === 'development';
    const isTest = req.query.test === 'true';

    // If no code is provided and not in test mode, return error
    if (!code && !isTest) {
      return res.status(400).json({ 
        success: false,
        message: 'Authorization code is required' 
      });
    }

    // Use mock data for testing or when MOCK_GOOGLE_AUTH is enabled
    if (process.env.MOCK_GOOGLE_AUTH === 'true' || (isDev && isTest)) {
      console.log(`Using mock data for Google auth (MOCK_GOOGLE_AUTH=${process.env.MOCK_GOOGLE_AUTH}, NODE_ENV=${process.env.NODE_ENV})`);
      // Return mock response for test scenario
      try {
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
        
        // For testing purposes, return JSON instead of redirect
        if (req.query.format === 'json') {
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
        }
        
        // Redirect to demo page with token
        return res.redirect(`${process.env.CORS_ORIGIN || 'https://api-rgram1.vercel.app'}/google-oauth-demo.html?token=${token}`);
      } catch (dbError) {
        console.error('Database error during mock auth:', dbError);
        return res.status(500).json({
          success: false,
          message: 'Database connection error',
          error: dbError instanceof Error ? dbError.message : 'Unknown database error'
        });
      }
    } else if (!code) {
      // Only return an error if we're not in mock mode and code is missing
      return res.status(400).json({ 
        success: false, 
        message: 'Authorization code is required' 
      });
    }
    
    // Check if Google APIs are accessible
    const isGoogleAccessible = await checkGoogleApiAccess();
    if (!isGoogleAccessible) {
      return res.status(503).json({
        success: false,
        message: 'Google services are currently unavailable',
        error: 'DNS resolution failed for Google APIs'
      });
    }

    // Configure axios with timeout and retry logic
    const axiosWithTimeout = axios.create({
      timeout: 10000, // 10 seconds timeout
    });

    // Exchange code for tokens
    const tokenResponse = await axiosWithTimeout.post(
      'https://oauth2.googleapis.com/token',
      {
        code: code as string,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL,
        grant_type: 'authorization_code'
      }
    );

    const { access_token, id_token } = tokenResponse.data;

    // Get user info
    const userInfoResponse = await axiosWithTimeout.get(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: { Authorization: `Bearer ${access_token}` }
      }
    );

    const { 
      sub: googleId, 
      email, 
      name, 
      picture: avatar 
    } = userInfoResponse.data;

    await connectDB();

    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { googleId }] });

    if (user) {
      // Update Google ID if not already set
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      // Create new user
      const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
      
      user = await User.create({
        email,
        googleId,
        fullName: name,
        username,
        password: Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10),
        avatar: avatar || '',
        isEmailVerified: true, // Auto-verify email for Google users
      });
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Redirect to demo page with token
    res.redirect(`${process.env.CORS_ORIGIN || 'https://api-rgram1.vercel.app'}/google-oauth-demo.html?token=${token}`);
  } catch (error: any) {
    console.error('Google callback error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
}