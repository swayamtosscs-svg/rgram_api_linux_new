import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './SocialLoginDemo.module.css';
import { initGoogleOAuth } from '../lib/utils/googleAuth';

const SocialLoginDemo: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string>('');

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Error parsing user data', e);
      }
    }
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Use the utility function from googleAuth.ts
      const authUrl = await initGoogleOAuth();
      
      // Redirect to Google Auth
      window.location.href = authUrl;
    } catch (err: any) {
      console.error('Google login error:', err);
      setError(err.message || 'Failed to initialize Google login');
      setLoading(false);
    }
  };

  // For demo purposes - directly authenticate with mock data
  const handleMockGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Mock Google user data
      const mockGoogleUser = {
        email: 'test.google@example.com',
        name: 'Test Google User',
        googleId: 'google_' + Math.random().toString(36).substring(2, 15),
        avatar: 'https://example.com/avatar.jpg'
      };
      
      // Use the mock endpoint
      const response = await axios.post('/api/auth/google-mock', mockGoogleUser);
      
      // Save user data and token
      const { user, token } = response.data.data;
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(user));
      
      setUser(user);
      setLoading(false);
    } catch (err: any) {
      console.error('Mock Google login error:', err);
      setError(err.response?.data?.message || 'Failed to login with mock Google account');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Social Login Demo</h1>
      
      {error && <div className={styles.error}>{error}</div>}
      
      {!user ? (
        <div className={styles.loginContainer}>
          <button 
            className={`${styles.loginButton} ${styles.googleButton}`}
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Login with Google'}
          </button>
          
          <div className={styles.divider}>OR</div>
          
          <button 
            className={`${styles.loginButton} ${styles.mockButton}`}
            onClick={handleMockGoogleLogin}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Login with Mock Google Account'}
          </button>
        </div>
      ) : (
        <div className={styles.profileContainer}>
          <div className={styles.profileHeader}>
            <img 
              src={user.avatar || 'https://via.placeholder.com/150'} 
              alt={user.fullName} 
              className={styles.avatar}
            />
            <div className={styles.userInfo}>
              <h2>{user.fullName}</h2>
              <p>@{user.username}</p>
              <p>{user.email}</p>
            </div>
          </div>
          
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{user.followersCount}</span>
              <span className={styles.statLabel}>Followers</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{user.followingCount}</span>
              <span className={styles.statLabel}>Following</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{user.postsCount}</span>
              <span className={styles.statLabel}>Posts</span>
            </div>
          </div>
          
          <button 
            className={styles.logoutButton}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default SocialLoginDemo;