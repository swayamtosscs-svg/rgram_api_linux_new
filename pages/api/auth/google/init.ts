import { NextApiRequest, NextApiResponse } from 'next';
import dns from 'dns';
import { promisify } from 'util';

// Promisify DNS lookup for async/await usage
const dnsLookup = promisify(dns.lookup);

// Function to check if Google APIs are accessible
async function checkGoogleApiAccess(): Promise<boolean> {
  try {
    await dnsLookup('accounts.google.com');
    return true;
  } catch (error) {
    console.error('DNS resolution error for Google APIs:', error);
    return false;
  }
}

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
    // Check if we're using mock Google auth
    const useMockAuth = process.env.MOCK_GOOGLE_AUTH === 'true';
    console.log('MOCK_GOOGLE_AUTH setting:', process.env.MOCK_GOOGLE_AUTH);

    // Get Google OAuth configuration
    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    const redirectUri = process.env.GOOGLE_CALLBACK_URL || '';

    // Check if Google APIs are accessible
    const isGoogleAccessible = await checkGoogleApiAccess();
    if (!isGoogleAccessible) {
      return res.status(503).json({
        success: false,
        message: 'Google services are currently unavailable',
        error: 'DNS resolution failed for Google APIs'
      });
    }

    // If mock auth is enabled, return a local mock URL
    if (useMockAuth) {
      console.log('Using mock Google auth URL');
      
      // Create a local mock OAuth URL that points to our callback
      const baseUrl = process.env.CORS_ORIGIN || 'http://localhost:3000';
      const mockAuthUrl = `${baseUrl}/api/auth/google/callback?test=true&format=json`;
      
      return res.json({
        success: true,
        data: {
          authUrl: mockAuthUrl,
          isMock: true,
          message: 'Mock OAuth URL generated - will bypass Google servers'
        }
      });
    }

    // For real Google OAuth, check configuration
    if (!clientId || !redirectUri) {
      return res.status(500).json({
        success: false,
        message: 'Google OAuth configuration is missing. Please set GOOGLE_CLIENT_ID and GOOGLE_CALLBACK_URL environment variables.',
        setupRequired: true,
        instructions: {
          step1: 'Go to Google Cloud Console (https://console.cloud.google.com/)',
          step2: 'Create OAuth 2.0 credentials',
          step3: 'Add redirect URI: http://localhost:3000/api/auth/google/callback',
          step4: 'Copy Client ID and Client Secret',
          step5: 'Set environment variables: GOOGLE_CLIENT_ID and GOOGLE_CALLBACK_URL'
        }
      });
    }

    // Generate real Google OAuth URL
    const scope = encodeURIComponent('profile email');
    const responseType = 'code';
    const accessType = 'offline';
    const prompt = 'consent';

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${scope}&access_type=${accessType}&prompt=${prompt}`;

    res.json({
      success: true,
      data: {
        authUrl,
        isMock: false,
        message: 'Real Google OAuth URL generated - will fetch real user data from Google'
      }
    });
  } catch (error: any) {
    console.error('Google init error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}