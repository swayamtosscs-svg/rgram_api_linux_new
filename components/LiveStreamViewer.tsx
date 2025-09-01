import React, { useRef, useEffect, useState, useCallback } from 'react';

interface LiveStreamViewerProps {
  streamId: string;
  streamUrl: string;
  title: string;
  username: string;
  onJoin?: () => void;
  onLeave?: () => void;
  onComment?: (message: string) => void;
  onLike?: () => void;
  isPrivate?: boolean;
  allowComments?: boolean;
  allowLikes?: boolean;
}

const LiveStreamViewer: React.FC<LiveStreamViewerProps> = ({
  streamId,
  streamUrl,
  title,
  username,
  onJoin,
  onLeave,
  onComment,
  onLike,
  isPrivate = false,
  allowComments = true,
  allowLikes = true
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<Array<{
    id: string;
    username: string;
    message: string;
    timestamp: string;
  }>>([]);

  // Join the stream
  const joinStream = useCallback(async () => {
    try {
      // Call the join API
      const response = await fetch('/api/live-stream/viewer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          streamId,
          action: 'join'
        })
      });

      if (response.ok) {
        setIsJoined(true);
        onJoin?.();
        
        // Start playing the stream
        if (videoRef.current) {
          videoRef.current.src = streamUrl;
          videoRef.current.play();
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to join stream');
      }
    } catch (err) {
      setError('Failed to join stream');
      console.error('Join stream error:', err);
    }
  }, [streamId, streamUrl, onJoin]);

  // Leave the stream
  const leaveStream = useCallback(async () => {
    try {
      // Call the leave API
      const response = await fetch('/api/live-stream/viewer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          streamId,
          action: 'leave'
        })
      });

      if (response.ok) {
        setIsJoined(false);
        setIsPlaying(false);
        onLeave?.();
        
        // Stop the video
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.src = '';
        }
      }
    } catch (err) {
      console.error('Leave stream error:', err);
    }
  }, [streamId, onLeave]);

  // Send a comment
  const sendComment = useCallback(async () => {
    if (!commentText.trim() || !allowComments) return;

    try {
      const response = await fetch('/api/live-stream/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          streamId,
          message: commentText.trim()
        })
      });

      if (response.ok) {
        const newComment = {
          id: Date.now().toString(),
          username: 'You',
          message: commentText.trim(),
          timestamp: new Date().toLocaleTimeString()
        };
        
        setComments(prev => [newComment, ...prev]);
        setCommentText('');
        onComment?.(commentText.trim());
      }
    } catch (err) {
      console.error('Send comment error:', err);
    }
  }, [commentText, streamId, allowComments, onComment]);

  // Toggle like
  const toggleLike = useCallback(async () => {
    if (!allowLikes) return;

    try {
      const action = isLiked ? 'unlike' : 'like';
      const response = await fetch('/api/live-stream/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          streamId,
          action
        })
      });

      if (response.ok) {
        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
        onLike?.();
      }
    } catch (err) {
      console.error('Toggle like error:', err);
    }
  }, [isLiked, streamId, allowLikes, onLike]);

  // Handle video events
  const handleVideoLoad = useCallback(() => {
    setIsLoading(false);
    setIsPlaying(true);
  }, []);

  const handleVideoError = useCallback(() => {
    setError('Failed to load video stream');
    setIsLoading(false);
  }, []);

  const handleVideoPlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handleVideoPause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  // Auto-join stream when component mounts
  useEffect(() => {
    joinStream();
    
    return () => {
      if (isJoined) {
        leaveStream();
      }
    };
  }, []);

  // Fetch stream stats periodically
  useEffect(() => {
    if (!isJoined) return;

    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/live-stream/${streamId}`);
        if (response.ok) {
          const data = await response.json();
          setViewerCount(data.data.viewerCount || 0);
          setLikeCount(data.data.likes || 0);
        }
      } catch (err) {
        console.error('Fetch stats error:', err);
      }
    };

    const interval = setInterval(fetchStats, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [streamId, isJoined]);

  return (
    <div className="live-stream-viewer">
      <div className="stream-header">
        <div className="stream-info">
          <h2 className="stream-title">{title}</h2>
          <p className="streamer-name">by {username}</p>
          {isPrivate && <span className="private-badge">🔒 Private</span>}
        </div>
        
        <div className="stream-stats">
          <span className="viewer-count">👥 {viewerCount} viewers</span>
          <span className="like-count">❤️ {likeCount} likes</span>
        </div>
      </div>

      <div className="video-container">
        <video
          ref={videoRef}
          className="stream-video"
          controls
          autoPlay
          playsInline
          onLoadedData={handleVideoLoad}
          onError={handleVideoError}
          onPlay={handleVideoPlay}
          onPause={handleVideoPause}
        />
        
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Loading stream...</p>
          </div>
        )}
        
        {error && (
          <div className="error-overlay">
            <p>⚠️ {error}</p>
            <button onClick={joinStream}>Retry</button>
          </div>
        )}
        
        {!isPlaying && isJoined && !isLoading && (
          <div className="play-overlay">
            <button onClick={() => videoRef.current?.play()}>
              ▶️ Play Stream
            </button>
          </div>
        )}
      </div>

      <div className="stream-controls">
        <button
          onClick={toggleLike}
          className={`like-btn ${isLiked ? 'liked' : ''}`}
          disabled={!allowLikes}
        >
          {isLiked ? '❤️ Liked' : '🤍 Like'}
        </button>
        
        <button
          onClick={leaveStream}
          className="leave-btn"
        >
          🚪 Leave Stream
        </button>
      </div>

      {allowComments && (
        <div className="comments-section">
          <h3>Live Comments</h3>
          
          <div className="comment-input">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              onKeyPress={(e) => e.key === 'Enter' && sendComment()}
            />
            <button onClick={sendComment} disabled={!commentText.trim()}>
              Send
            </button>
          </div>
          
          <div className="comments-list">
            {comments.map(comment => (
              <div key={comment.id} className="comment">
                <span className="comment-username">{comment.username}</span>
                <span className="comment-message">{comment.message}</span>
                <span className="comment-time">{comment.timestamp}</span>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="no-comments">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .live-stream-viewer {
          width: 100%;
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .stream-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 8px;
        }
        
        .stream-title {
          margin: 0 0 8px 0;
          font-size: 24px;
          font-weight: 600;
          color: #333;
        }
        
        .streamer-name {
          margin: 0;
          color: #666;
          font-size: 16px;
        }
        
        .private-badge {
          display: inline-block;
          background: #ffc107;
          color: #333;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          margin-top: 8px;
        }
        
        .stream-stats {
          display: flex;
          gap: 16px;
          font-size: 14px;
          color: #666;
        }
        
        .video-container {
          position: relative;
          width: 100%;
          background: #000;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 20px;
        }
        
        .stream-video {
          width: 100%;
          height: auto;
          min-height: 500px;
          display: block;
        }
        
        .loading-overlay,
        .error-overlay,
        .play-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.8);
          color: white;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #333;
          border-top: 4px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .error-overlay button,
        .play-overlay button {
          background: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          margin-top: 16px;
        }
        
        .stream-controls {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }
        
        .like-btn,
        .leave-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .like-btn {
          background: #e9ecef;
          color: #333;
        }
        
        .like-btn.liked {
          background: #dc3545;
          color: white;
        }
        
        .leave-btn {
          background: #6c757d;
          color: white;
        }
        
        .like-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .comments-section {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
        }
        
        .comments-section h3 {
          margin: 0 0 16px 0;
          color: #333;
        }
        
        .comment-input {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }
        
        .comment-input input {
          flex: 1;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .comment-input button {
          padding: 10px 20px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .comment-input button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .comments-list {
          max-height: 300px;
          overflow-y: auto;
        }
        
        .comment {
          display: flex;
          gap: 12px;
          padding: 12px;
          border-bottom: 1px solid #eee;
          align-items: center;
        }
        
        .comment-username {
          font-weight: 600;
          color: #007bff;
          min-width: 80px;
        }
        
        .comment-message {
          flex: 1;
          color: #333;
        }
        
        .comment-time {
          color: #666;
          font-size: 12px;
          min-width: 80px;
        }
        
        .no-comments {
          text-align: center;
          color: #666;
          font-style: italic;
          padding: 20px;
        }
        
        @media (max-width: 768px) {
          .stream-header {
            flex-direction: column;
            gap: 16px;
          }
          
          .stream-stats {
            justify-content: flex-start;
          }
          
          .comment {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
          
          .comment-username,
          .comment-time {
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default LiveStreamViewer;
