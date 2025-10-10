import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { initGoogleOAuth } from '../lib/utils/googleAuth';

/**
 * Example Google Login Button component
 * This is a simplified example. In a real application, you would use a library like
 * react-google-login or @react-oauth/google for a more robust implementation.
 */
const GoogleLoginButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    // Load Google API script
    const loadGoogleScript = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      
      return script;
    };
    
    const script = loadGoogleScript();
    
    return () => {
      // Cleanup
      if (script) document.body.removeChild(script);
    };
  }, []);

  // Initialize Google OAuth
  const initGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Use the utility function from googleAuth.ts
      const authUrl = await initGoogleOAuth();
      
      // Redirect to Google OAuth page
      window.location.href = authUrl;
    } catch (error: any) {
      setLoading(false);
      const errorMessage = error.message || 'Failed to initialize Google login';
      setError(errorMessage);
      console.error('Failed to initialize Google login:', error);
    }
  };

  // Handle the OAuth callback
  const handleOAuthCallback = async (token: string) => {
    if (token) {
      // Store the token in localStorage or state management
      localStorage.setItem('auth_token', token);
      
      // Redirect to dashboard or home page
      window.location.href = '/dashboard';
    }
  };

  // Check for token in URL (for OAuth callback)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
      handleOAuthCallback(token);
    }
  }, []);

  return (
    <button 
      onClick={initGoogleLogin}
      className="google-login-button"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 20px',
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '4px',
        cursor: 'pointer',
        fontFamily: 'Roboto, Arial, sans-serif',
        fontSize: '14px',
        fontWeight: 500,
        color: '#757575',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      }}
    >
      <img 
        src="https://developers.google.com/identity/images/g-logo.png" 
        alt="Google logo" 
        style={{ marginRight: '10px', width: '18px', height: '18px' }}
      />
      Sign in with Google
    </button>
  );
};

export default GoogleLoginButton;