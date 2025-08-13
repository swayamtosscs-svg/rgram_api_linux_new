import axios from 'axios';

interface GoogleUser {
  email: string;
  name: string;
  googleId: string;
  avatar?: string;
}

/**
 * Process Google OAuth response and authenticate with our backend
 * @param googleResponse Response from Google OAuth
 * @returns Authentication result from our API
 */
export const authenticateWithGoogle = async (googleResponse: any) => {
  try {
    if (!googleResponse || !googleResponse.profileObj) {
      throw new Error('Invalid Google response');
    }

    const { email, name, googleId, imageUrl } = googleResponse.profileObj;

    const userData: GoogleUser = {
      email,
      name,
      googleId,
      avatar: imageUrl
    };

    // Configure axios with timeout and retry logic
    const axiosWithTimeout = axios.create({
      timeout: 10000, // 10 seconds timeout
    });

    // Call our API endpoint to authenticate/register the user
    const response = await axiosWithTimeout.post('/api/auth/google', userData);
    return response.data;
  } catch (error: any) {
    // Handle network errors specifically
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      console.error('Google authentication timeout:', error);
      throw new Error('Connection to authentication service timed out. Please try again.');
    }
    
    if (error.code === 'ENOTFOUND' || error.message?.includes('getaddrinfo')) {
      console.error('Google authentication DNS error:', error);
      throw new Error('Unable to connect to authentication service. Please check your internet connection.');
    }
    
    console.error('Google authentication error:', error);
    throw error;
  }
};

/**
 * Initialize Google OAuth client
 * This function should be called on the client side
 * @returns Promise that resolves with the auth URL or rejects with an error
 */
export const initGoogleAuth = async (): Promise<string> => {
  try {
    // Configure axios with timeout and retry logic
    const axiosWithTimeout = axios.create({
      timeout: 10000, // 10 seconds timeout
    });
    
    // Get the Google Auth URL from our backend
    const response = await axiosWithTimeout.get('/api/auth/google/init');
    
    if (response.data.success && response.data.data.authUrl) {
      // Check if this is a mock URL (starts with /api instead of https://)
      const authUrl = response.data.data.authUrl;
      
      // If it's a mock URL and doesn't include the origin, add the current origin
      if (authUrl.startsWith('/api') && typeof window !== 'undefined') {
        return `${window.location.origin}${authUrl}`;
      }
      
      return authUrl;
    } else {
      throw new Error('Failed to initialize Google authentication');
    }
  } catch (error: any) {
    // Handle network errors specifically
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      console.error('Google OAuth initialization timeout:', error);
      throw new Error('Connection to authentication service timed out. Please try again.');
    }
    
    if (error.code === 'ENOTFOUND' || error.message?.includes('getaddrinfo')) {
      console.error('Google OAuth initialization DNS error:', error);
      throw new Error('Unable to connect to authentication service. Please check your internet connection.');
    }
    
    console.error('Google OAuth initialization error:', error);
    throw error;
  }
};