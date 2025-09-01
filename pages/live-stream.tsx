import React, { useState, useEffect } from 'react';
import LiveStreamCamera from '../components/LiveStreamCamera';
import LiveStreamViewer from '../components/LiveStreamViewer';

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

const LiveStreamPage: React.FC = () => {
  const [isStreamer, setIsStreamer] = useState(false);
  const [currentStream, setCurrentStream] = useState<LiveStream | null>(null);
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    title: '',
    description: '',
    category: 'darshan',
    isPrivate: false,
    quality: 'medium' as 'low' | 'medium' | 'high'
  });

  // Check if user is authenticated and get their streams
  useEffect(() => {
    checkAuthAndLoadStreams();
  }, []);

  const checkAuthAndLoadStreams = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to access live streaming');
        setIsLoading(false);
        return;
      }

      // Load user's streams and available streams
      await Promise.all([
        loadUserStreams(token),
        loadAvailableStreams(token)
      ]);
      
      setIsLoading(false);
    } catch (err) {
      setError('Failed to load streams');
      setIsLoading(false);
    }
  };

  const loadUserStreams = async (token: string) => {
    try {
      const response = await fetch('/api/live-stream/list?userId=me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const userStreams = data.data.streams.filter((s: LiveStream) => 
          s.status === 'pending' || s.status === 'live'
        );
        
        if (userStreams.length > 0) {
          setIsStreamer(true);
          setCurrentStream(userStreams[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load user streams:', err);
    }
  };

  const loadAvailableStreams = async (token: string) => {
    try {
      const response = await fetch('/api/live-stream/list?status=live', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStreams(data.data.streams);
      }
    } catch (err) {
      console.error('Failed to load available streams:', err);
    }
  };

  const createStream = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to create a stream');
        return;
      }

      const response = await fetch('/api/live-stream/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...createFormData,
          settings: {
            quality: createFormData.quality,
            enableChat: true,
            enableLikes: true,
            enableComments: true,
            enableScreenShare: false,
            isArchived: true,
            moderationEnabled: true,
            language: 'hindi'
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentStream({
          _id: data.data.streamId,
          title: createFormData.title,
          description: createFormData.description,
          status: 'pending',
          playbackUrl: data.data.playbackUrl,
          username: 'You',
          isPrivate: createFormData.isPrivate,
          settings: {
            enableChat: true,
            enableLikes: true,
            enableComments: true
          }
        });
        
        setIsStreamer(true);
        setShowCreateForm(false);
        setCreateFormData({
          title: '',
          description: '',
          category: 'darshan',
          isPrivate: false,
          quality: 'medium'
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create stream');
      }
    } catch (err) {
      setError('Failed to create stream');
      console.error('Create stream error:', err);
    }
  };

  const startStream = async () => {
    if (!currentStream) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/live-stream/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          streamId: currentStream._id
        })
      });

      if (response.ok) {
        setCurrentStream(prev => prev ? { ...prev, status: 'live' } : null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to start stream');
      }
    } catch (err) {
      setError('Failed to start stream');
      console.error('Start stream error:', err);
    }
  };

  const endStream = async () => {
    if (!currentStream) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/live-stream/end', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          streamId: currentStream._id
        })
      });

      if (response.ok) {
        setCurrentStream(null);
        setIsStreamer(false);
        loadAvailableStreams(token!);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to end stream');
      }
    } catch (err) {
      setError('Failed to end stream');
      console.error('End stream error:', err);
    }
  };

  const handleCameraStreamStart = (stream: MediaStream) => {
    console.log('Camera stream started:', stream);
    // Here you would typically send the stream to your streaming service
    // For now, we'll just log it
  };

  const handleCameraStreamStop = () => {
    console.log('Camera stream stopped');
  };

  const handleCameraError = (error: string) => {
    setError(`Camera error: ${error}`);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading live streaming...</p>
      </div>
    );
  }

  if (error && !currentStream) {
    return (
      <div className="error-container">
        <h2>⚠️ Error</h2>
        <p>{error}</p>
        <button onClick={checkAuthAndLoadStreams}>Retry</button>
      </div>
    );
  }

  return (
    <div className="live-stream-page">
      <div className="page-header">
        <h1>🎥 Live Streaming</h1>
        <p>Share your spiritual moments with the world</p>
      </div>

      {isStreamer && currentStream ? (
        <div className="streamer-section">
          <div className="stream-info">
            <h2>Your Stream: {currentStream.title}</h2>
            <p>Status: <span className={`status ${currentStream.status}`}>
              {currentStream.status === 'pending' ? '⏳ Ready to Start' : 
               currentStream.status === 'live' ? '🔴 LIVE' : '⏹️ Ended'}
            </span></p>
            
            {currentStream.status === 'pending' && (
              <button onClick={startStream} className="start-btn">
                🚀 Go Live
              </button>
            )}
            
            {currentStream.status === 'live' && (
              <button onClick={endStream} className="end-btn">
                ⏹️ End Stream
              </button>
            )}
          </div>

          <LiveStreamCamera
            isStreamer={true}
            streamId={currentStream._id}
            onStreamStart={handleCameraStreamStart}
            onStreamStop={handleCameraStreamStop}
            onError={handleCameraError}
            autoStart={true}
            quality={createFormData.quality}
          />
        </div>
      ) : (
        <div className="viewer-section">
          {!showCreateForm ? (
            <div className="action-buttons">
              <button 
                onClick={() => setShowCreateForm(true)}
                className="create-stream-btn"
              >
                📹 Start Streaming
              </button>
            </div>
          ) : (
            <div className="create-stream-form">
              <h3>Create New Stream</h3>
              
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={createFormData.title}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter stream title"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={createFormData.description}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter stream description"
                  rows={3}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={createFormData.category}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="darshan">Darshan</option>
                    <option value="puja">Puja</option>
                    <option value="aarti">Aarti</option>
                    <option value="bhajan">Bhajan</option>
                    <option value="discourse">Discourse</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Quality</label>
                  <select
                    value={createFormData.quality}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, quality: e.target.value as 'low' | 'medium' | 'high' }))}
                  >
                    <option value="low">Low (480p)</option>
                    <option value="medium">Medium (720p)</option>
                    <option value="high">High (1080p)</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={createFormData.isPrivate}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
                  />
                  Private Stream
                </label>
              </div>
              
              <div className="form-actions">
                <button onClick={createStream} disabled={!createFormData.title.trim()}>
                  Create Stream
                </button>
                <button onClick={() => setShowCreateForm(false)} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {streams.length > 0 && (
            <div className="available-streams">
              <h3>🔴 Live Now</h3>
              <div className="streams-grid">
                {streams.map(stream => (
                  <div key={stream._id} className="stream-card">
                    <h4>{stream.title}</h4>
                    <p>by {stream.username}</p>
                    <p className="stream-description">{stream.description}</p>
                    <button 
                      onClick={() => window.open(`/live-stream/${stream._id}`, '_blank')}
                      className="watch-btn"
                    >
                      👁️ Watch
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .live-stream-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .page-header {
          text-align: center;
          margin-bottom: 40px;
        }
        
        .page-header h1 {
          font-size: 2.5rem;
          color: #333;
          margin-bottom: 8px;
        }
        
        .page-header p {
          font-size: 1.1rem;
          color: #666;
        }
        
        .streamer-section {
          margin-bottom: 40px;
        }
        
        .stream-info {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .stream-info h2 {
          margin: 0 0 16px 0;
          color: #333;
        }
        
        .status {
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 14px;
        }
        
        .status.pending {
          background: #fff3cd;
          color: #856404;
        }
        
        .status.live {
          background: #d4edda;
          color: #155724;
        }
        
        .start-btn,
        .end-btn {
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 16px;
        }
        
        .start-btn {
          background: #28a745;
          color: white;
        }
        
        .end-btn {
          background: #dc3545;
          color: white;
        }
        
        .viewer-section {
          text-align: center;
        }
        
        .action-buttons {
          margin-bottom: 40px;
        }
        
        .create-stream-btn {
          padding: 16px 32px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .create-stream-btn:hover {
          background: #0056b3;
          transform: translateY(-2px);
        }
        
        .create-stream-form {
          max-width: 600px;
          margin: 0 auto 40px;
          background: #f8f9fa;
          padding: 30px;
          border-radius: 12px;
          text-align: left;
        }
        
        .create-stream-form h3 {
          margin: 0 0 24px 0;
          text-align: center;
          color: #333;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #333;
        }
        
        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
        }
        
        .form-group textarea {
          resize: vertical;
          min-height: 80px;
        }
        
        .form-actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          margin-top: 24px;
        }
        
        .form-actions button {
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
        }
        
        .form-actions button:first-child {
          background: #28a745;
          color: white;
        }
        
        .cancel-btn {
          background: #6c757d;
          color: white;
        }
        
        .available-streams {
          margin-top: 40px;
        }
        
        .available-streams h3 {
          margin-bottom: 20px;
          color: #333;
        }
        
        .streams-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }
        
        .stream-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          text-align: left;
        }
        
        .stream-card h4 {
          margin: 0 0 8px 0;
          color: #333;
        }
        
        .stream-card p {
          margin: 0 0 8px 0;
          color: #666;
        }
        
        .stream-description {
          font-size: 14px;
          margin-bottom: 16px !important;
        }
        
        .watch-btn {
          background: #007bff;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .loading-container,
        .error-container {
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
        
        .error-container button {
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
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .streams-grid {
            grid-template-columns: 1fr;
          }
          
          .page-header h1 {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default LiveStreamPage;
