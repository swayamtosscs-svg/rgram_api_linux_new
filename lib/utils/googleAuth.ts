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

    // Validate required fields
    if (!email || !name || !googleId) {
      throw new Error('Missing required user information from Google');
    }

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
export const initGoogleOAuth = async () => {
  try {
    const response = await axios.get('/api/auth/google/init');
    return response.data;
  } catch (error: any) {
    console.error('Google OAuth init error:', error);
    throw error;
  }
};

/**
 * Clean up users with undefined names
 * This function can be called to fix existing users with undefined names
 */
export const cleanupUndefinedUsers = async () => {
  try {
    const response = await axios.post('/api/auth/cleanup-undefined-users');
    return response.data;
  } catch (error: any) {
    console.error('Cleanup undefined users error:', error);
    throw error;
  }
};

/**
 * Validate Google user data
 * @param userData User data from Google OAuth
 * @returns boolean indicating if data is valid
 */
export const validateGoogleUserData = (userData: any): boolean => {
  if (!userData) return false;
  
  const { email, name, googleId } = userData;
  
  // Check if required fields exist and are not undefined/null
  if (!email || email === 'undefined' || email === 'null') return false;
  if (!name || name === 'undefined' || name === 'null') return false;
  if (!googleId || googleId === 'undefined' || googleId === 'null') return false;
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;
  
  return true;
};