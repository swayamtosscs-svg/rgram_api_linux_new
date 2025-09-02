import React from 'react';

export default function Home() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>API RGram</h1>
      <p style={{ color: '#666', marginBottom: '30px', textAlign: 'center', maxWidth: '600px' }}>
        Welcome to the API RGram server. This is a backend API service for the RGram application.
      </p>
      
      <div style={{ 
        backgroundColor: '#fff', 
        borderRadius: '8px', 
        padding: '20px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        maxWidth: '800px',
        width: '100%'
      }}>
        <h2 style={{ color: '#333', marginBottom: '15px' }}>Available API Endpoints:</h2>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          <li style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
            <strong>/api/videos/religion</strong> - Fetches videos filtered by religion
          </li>
          <li style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
            <strong>/api/videos/religious-reels</strong> - Handles religious reels with pagination
          </li>
          <li style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
            <strong>/api/videos/fetch-religious-reels</strong> - Alternative endpoint for fetching religious reels
          </li>
          <li style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
            <strong>/api/videos/categories</strong> - Retrieves video categories with counts
          </li>
          <li style={{ padding: '10px 0' }}>
            <strong>/api/videos/add-links</strong> - Endpoint for adding links to videos
          </li>
        </ul>
      </div>
      
      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <a 
          href="/video-api-demo.html" 
          style={{ 
            display: 'inline-block', 
            backgroundColor: '#4CAF50', 
            color: 'white', 
            padding: '12px 20px', 
            textDecoration: 'none', 
            borderRadius: '4px',
            fontWeight: 'bold',
            marginBottom: '20px',
            marginRight: '10px'
          }}
        >
          Try Video API Demo
        </a>
        <a 
          href="/chat" 
          style={{ 
            display: 'inline-block', 
            backgroundColor: '#9C27B0', 
            color: 'white', 
            padding: '12px 20px', 
            textDecoration: 'none', 
            borderRadius: '4px',
            fontWeight: 'bold',
            marginBottom: '20px',
            marginRight: '10px'
          }}
        >
          Open Chat
        </a>
        <a 
          href="/users-list" 
          style={{ 
            display: 'inline-block', 
            backgroundColor: '#673AB7', 
            color: 'white', 
            padding: '12px 20px', 
            textDecoration: 'none', 
            borderRadius: '4px',
            fontWeight: 'bold',
            marginBottom: '20px',
            marginRight: '10px'
          }}
        >
          Find People to Chat
        </a>
        <a 
          href="/chat-demo" 
          style={{ 
            display: 'inline-block', 
            backgroundColor: '#FF9800', 
            color: 'white', 
            padding: '12px 20px', 
            textDecoration: 'none', 
            borderRadius: '4px',
            fontWeight: 'bold',
            marginBottom: '20px',
            marginRight: '10px'
          }}
        >
          Try Demo Chat
        </a>
        <a 
          href="/auth/forgot-password" 
          style={{ 
            display: 'inline-block', 
            backgroundColor: '#E91E63', 
            color: 'white', 
            padding: '12px 20px', 
            textDecoration: 'none', 
            borderRadius: '4px',
            fontWeight: 'bold',
            marginBottom: '20px'
          }}
        >
          Forgot Password Demo
        </a>
        <p style={{ color: '#999', fontSize: '14px' }}>
          For more information, please refer to the API documentation.
        </p>
      </div>
    </div>
  );
}