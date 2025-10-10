// Mobile App Integration Example for Google Login API
// This file shows how to integrate the Google Login API in mobile apps

// React Native Example
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: 'your_google_web_client_id', // From Google Cloud Console
  offlineAccess: true,
});

// Google Login Function
export const googleLogin = async () => {
  try {
    // Check if device supports Google Play services
    await GoogleSignin.hasPlayServices();
    
    // Sign in with Google
    const userInfo = await GoogleSignin.signIn();
    
    // Extract user data
    const { user } = userInfo;
    const userData = {
      email: user.email,
      name: user.name,
      googleId: user.id,
      avatar: user.photo
    };
    
    // Send to your API
    const response = await fetch('http://your-api-domain.com/api/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Store token
      await AsyncStorage.setItem('authToken', data.data.token);
      
      // Navigate to main app
      // navigation.navigate('Home');
      
      return {
        success: true,
        user: data.data.user,
        token: data.data.token
      };
    } else {
      throw new Error(data.message || 'Login failed');
    }
    
  } catch (error) {
    console.error('Google login error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Check if user is already logged in
export const checkAuthStatus = async () => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    
    if (token) {
      // Verify token with API
      const response = await fetch('http://your-api-domain.com/api/auth/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        return {
          isLoggedIn: true,
          user: data.data,
          token: token
        };
      } else {
        // Token is invalid, remove it
        await AsyncStorage.removeItem('authToken');
        return { isLoggedIn: false };
      }
    }
    
    return { isLoggedIn: false };
  } catch (error) {
    console.error('Auth check error:', error);
    return { isLoggedIn: false };
  }
};

// Logout function
export const logout = async () => {
  try {
    // Sign out from Google
    await GoogleSignin.signOut();
    
    // Remove stored token
    await AsyncStorage.removeItem('authToken');
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: error.message };
  }
};

// Usage in React Native Component
/*
import React, { useEffect, useState } from 'react';
import { View, Button, Text } from 'react-native';
import { googleLogin, checkAuthStatus, logout } from './googleAuth';

const LoginScreen = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const authStatus = await checkAuthStatus();
    if (authStatus.isLoggedIn) {
      setUser(authStatus.user);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const result = await googleLogin();
    
    if (result.success) {
      setUser(result.user);
    } else {
      alert('Login failed: ' + result.error);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {user ? (
        <View>
          <Text>Welcome, {user.fullName}!</Text>
          <Text>Email: {user.email}</Text>
          <Button title="Logout" onPress={handleLogout} />
        </View>
      ) : (
        <Button title="Sign in with Google" onPress={handleGoogleLogin} />
      )}
    </View>
  );
};

export default LoginScreen;
*/
