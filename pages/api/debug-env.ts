import { NextApiRequest, NextApiResponse } from 'next';

// Load environment variables
require('dotenv').config({ path: '.env.local' });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Get all environment variables (only show non-sensitive ones)
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
    VERCEL_URL: process.env.VERCEL_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    APP_NAME: process.env.APP_NAME,
    EMAIL_HOST: process.env.EMAIL_HOST ? 'SET' : 'NOT SET',
    EMAIL_PORT: process.env.EMAIL_PORT ? 'SET' : 'NOT SET',
    EMAIL_USER: process.env.EMAIL_USER ? 'SET' : 'NOT SET',
    EMAIL_PASS: process.env.EMAIL_PASS ? 'SET' : 'NOT SET',
    EMAIL_FROM: process.env.EMAIL_FROM ? 'SET' : 'NOT SET',
    MONGODB_URI: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
    JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
    OTP_EXPIRE_MINUTES: process.env.OTP_EXPIRE_MINUTES,
  };

  // Calculate what URL would be used for reset links
  let calculatedBaseUrl = process.env.NEXT_PUBLIC_APP_URL;
  
  if (!calculatedBaseUrl) {
    if (process.env.VERCEL_URL) {
      calculatedBaseUrl = `https://${process.env.VERCEL_URL}`;
    } else if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
      calculatedBaseUrl = 'https://api-rgram1.vercel.app';
    } else {
      calculatedBaseUrl = 'http://localhost:3000';
    }
  }
  
  // Force Vercel domain if we're on Vercel
  if (process.env.VERCEL || process.env.VERCEL_URL || process.env.NODE_ENV === 'production') {
    calculatedBaseUrl = 'https://api-rgram1.vercel.app';
  }

  return res.status(200).json({
    message: 'Environment Variables Debug',
    environment: {
      nodeEnv: process.env.NODE_ENV,
      isVercel: !!process.env.VERCEL,
      vercelUrl: process.env.VERCEL_URL,
    },
    environmentVariables: envVars,
    calculatedResetUrl: `${calculatedBaseUrl}/reset-password?token=example`,
    timestamp: new Date().toISOString(),
  });
}
