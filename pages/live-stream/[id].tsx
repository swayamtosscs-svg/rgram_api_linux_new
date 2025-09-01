import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import LiveStreamViewer from '../../components/LiveStreamViewer';

interface LiveStream {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'live' | 'ended' | 'cancelled';
  playbackUrl: string;
  username: string;
  isPrivate: boolean;
  settings: {
    enableChat: boolean;
    enableLikes: boolean;
    enableComments: boolean;
  };
}

const LiveStreamViewerPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [stream, setStream] = useState<LiveStream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadStream(id);
    }
  }, [id]);

  const loadStream = async (streamId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to watch this stream');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`/api/live-stream/${streamId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStream(data.data);
      } else if (response.status === 404) {
        setError('Stream not found');
      } else if (response.status === 403) {
        setError('Access denied to this stream');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load stream');
      }
    } catch (err) {
      setError('Failed to load stream');
      console.error('Load stream error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = () => {
    console.log('Joined stream:', stream?._id);
  };

  const handleLeave = () => {
    console.log('Left stream:', stream?._id);
    // Optionally redirect back to streams list
    router.push('/live-stream');
  };

  const handleComment = (message: string) => {
    console.log('Comment sent:', message);
  };

  const handleLike = () => {
    console.log('Stream liked');
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading stream...</p>
      </div>
    );
  }

  if (error || !stream) {
    return (
      <div className="error-container">
        <h2>⚠️ Error</h2>
        <p>{error || 'Stream not found'}</p>
        <button onClick={() => router.push('/live-stream')}>
          Back to Streams
        </button>
      </div>
    );
  }

  if (stream.status !== 'live') {
    return (
      <div className="stream-ended-container">
        <h2>📺 Stream Ended</h2>
        <p>"{stream.title}" by {stream.username} has ended.</p>
        <button onClick={() => router.push('/live-stream')}>
          Find Other Streams
        </button>
      </div>
    );
  }

  return (
    <div className="live-stream-viewer-page">
      <div className="page-header">
        <button 
          onClick={() => router.push('/live-stream')}
          className="back-btn"
        >
          ← Back to Streams
        </button>
        <h1>🎥 Live Stream</h1>
      </div>

      <LiveStreamViewer
        streamId={stream._id}
        streamUrl={stream.playbackUrl}
        title={stream.title}
        username={stream.username}
        onJoin={handleJoin}
        onLeave={handleLeave}
        onComment={handleComment}
        onLike={handleLike}
        isPrivate={stream.isPrivate}
        allowComments={stream.settings.enableComments}
        allowLikes={stream.settings.enableLikes}
      />

      <style jsx>{`
        .live-stream-viewer-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .page-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .back-btn {
          padding: 8px 16px;
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s;
        }
        
        .back-btn:hover {
          background: #5a6268;
        }
        
        .page-header h1 {
          margin: 0;
          font-size: 2rem;
          color: #333;
        }
        
        .loading-container,
        .error-container,
        .stream-ended-container {
          text-align: center;
          padding: 60px 20px;
        }
        
        .loading-spinner {
          width: 60px;
          height: 60px;
          border: 6px solid #f3f3f3;
          border-top: 6px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .error-container h2,
        .stream-ended-container h2 {
          color: #dc3545;
          margin-bottom: 16px;
        }
        
        .stream-ended-container h2 {
          color: #6c757d;
        }
        
        .error-container button,
        .stream-ended-container button {
          background: #007bff;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
          margin-top: 16px;
        }
        
        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }
          
          .page-header h1 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default LiveStreamViewerPage;
