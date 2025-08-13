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
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_CALLBACK_URL;

    if (!clientId || !redirectUri) {
      return res.status(500).json({ 
        success: false, 
        message: 'Google OAuth configuration is missing' 
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

    // Generate Google OAuth URL
    const scope = encodeURIComponent('profile email');
    const responseType = 'code';
    const accessType = 'offline';
    const prompt = 'consent';

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${scope}&access_type=${accessType}&prompt=${prompt}`;

    res.json({
      success: true,
      data: {
        authUrl
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