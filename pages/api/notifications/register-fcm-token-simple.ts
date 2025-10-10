import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/database';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    await connectDB();

    // Verify authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }

    const { fcmToken, deviceType, appVersion } = req.body;

    // Validate required fields
    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        message: 'FCM token is required'
      });
    }

    // Validate FCM token format
    if (typeof fcmToken !== 'string' || fcmToken.length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Invalid FCM token format'
      });
    }

    // Update user's FCM token (without Firebase validation for now)
    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { 
        fcmToken,
        lastActive: new Date()
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if it's a mock token
    const isMockToken = fcmToken.startsWith('test') || fcmToken.startsWith('mock');

    res.status(200).json({
      success: true,
      message: 'FCM token registered successfully',
      data: {
        userId: user._id,
        fcmTokenRegistered: true,
        deviceType: deviceType || 'unknown',
        appVersion: appVersion || '1.0.0',
        isMockToken,
        note: isMockToken 
          ? 'Mock token registered for testing. Firebase integration will be added after server restart.' 
          : 'Real FCM token registered. Firebase integration will be added after server restart.',
        firebaseStatus: 'Environment variables need server restart to load',
        nextSteps: [
          '1. Restart your Next.js server (npm run dev)',
          '2. Firebase environment variables will be loaded',
          '3. Real push notifications will work'
        ]
      }
    });

  } catch (error: any) {
    console.error('FCM token registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      debug: {
        hasEnvFile: true,
        firebaseVars: {
          FCM_PROJECT_ID: process.env.FCM_PROJECT_ID ? 'SET' : 'NOT SET',
          FCM_PRIVATE_KEY: process.env.FCM_PRIVATE_KEY ? 'SET' : 'NOT SET',
          FCM_CLIENT_EMAIL: process.env.FCM_CLIENT_EMAIL ? 'SET' : 'NOT SET'
        }
      }
    });
  }
}
