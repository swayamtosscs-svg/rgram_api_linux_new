import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../lib/database';
import PasswordResetToken, { IPopulatedPasswordResetToken } from '../../../lib/models/PasswordResetToken';

// Load environment variables
require('dotenv').config({ path: '.env.local' });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await connectDB();
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    // Find the reset token
    const resetTokenData = await PasswordResetToken.findOne({
      token,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    }).populate('userId', 'email username fullName') as IPopulatedPasswordResetToken | null;

    if (!resetTokenData) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    res.json({
      success: true,
      message: 'Token is valid',
      user: {
        email: resetTokenData.userId.email,
        username: resetTokenData.userId.username,
        fullName: resetTokenData.userId.fullName
      }
    });

  } catch (error: any) {
    console.error('Validate reset token error:', error);
    
    if (error.name === 'MongoError' || error.name === 'MongooseError') {
      return res.status(500).json({
        success: false,
        message: 'Database connection error'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

