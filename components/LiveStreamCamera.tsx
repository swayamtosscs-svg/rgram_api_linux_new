import React, { useRef, useEffect, useState, useCallback } from 'react';

interface LiveStreamCameraProps {
  isStreamer: boolean;
  streamId?: string;
  onStreamStart?: (stream: MediaStream) => void;
  onStreamStop?: () => void;
  onError?: (error: string) => void;
  autoStart?: boolean;
  quality?: 'low' | 'medium' | 'high';
  facingMode?: 'user' | 'environment';
}

const LiveStreamCamera: React.FC<LiveStreamCameraProps> = ({
  isStreamer = false,
  streamId,
  onStreamStart,
  onStreamStop,
  onError,
  autoStart = true,
  quality = 'medium',
  facingMode = 'user'
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');

  // Get camera constraints based on quality
  const getCameraConstraints = useCallback((deviceId?: string) => {
    const constraints: MediaStreamConstraints = {
      video: {
        facingMode: facingMode,
        width: quality === 'high' ? { ideal: 1920, min: 1280 } : 
               quality === 'medium' ? { ideal: 1280, min: 720 } : 
               { ideal: 640, min: 480 },
        height: quality === 'high' ? { ideal: 1080, min: 720 } : 
                quality === 'medium' ? { ideal: 720, min: 480 } : 
                { ideal: 480, min: 360 },
        frameRate: quality === 'high' ? { ideal: 30, min: 24 } : 
                   quality === 'medium' ? { ideal: 24, min: 15 } : 
                   { ideal: 15, min: 10 }
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 48000
      }
    };

    if (deviceId) {
      (constraints.video as any).deviceId = { exact: deviceId };
    }

    return constraints;
  }, [quality, facingMode]);

  // Get available camera devices
  const getCameraDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      setCameraDevices(cameras);
      
      if (cameras.length > 0 && !selectedCamera) {
        setSelectedCamera(cameras[0].deviceId);
      }
    } catch (err) {
      console.error('Error getting camera devices:', err);
      setError('Failed to get camera devices');
    }
  }, [selectedCamera]);

  // Start camera
  const startCamera = useCallback(async (deviceId?: string) => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const errorMsg = 'Camera access not supported in this browser';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const constraints = getCameraConstraints(deviceId);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setIsCameraOn(true);
      onStreamStart?.(stream);
      
      // Auto-start streaming if this is a streamer
      if (isStreamer && streamId) {
        // Here you would typically send the stream to your streaming service
        console.log('Streamer camera started, ready to go live');
      }

    } catch (err: any) {
      let errorMsg = 'Failed to start camera';
      
      if (err.name === 'NotAllowedError') {
        errorMsg = 'Camera access denied. Please allow camera access and try again.';
      } else if (err.name === 'NotFoundError') {
        errorMsg = 'No camera found on this device.';
      } else if (err.name === 'NotReadableError') {
        errorMsg = 'Camera is already in use by another application.';
      } else if (err.name === 'OverconstrainedError') {
        errorMsg = 'Camera does not meet the required constraints.';
      }
      
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [isStreamer, streamId, getCameraConstraints, onStreamStart, onError]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCameraOn(false);
    onStreamStop?.();
  }, [onStreamStop]);

  // Switch camera
  const switchCamera = useCallback(async () => {
    if (cameraDevices.length < 2) return;
    
    const currentIndex = cameraDevices.findIndex(device => device.deviceId === selectedCamera);
    const nextIndex = (currentIndex + 1) % cameraDevices.length;
    const nextCamera = cameraDevices[nextIndex];
    
    setSelectedCamera(nextCamera.deviceId);
    
    if (isCameraOn) {
      stopCamera();
      await startCamera(nextCamera.deviceId);
    }
  }, [cameraDevices, selectedCamera, isCameraOn, stopCamera, startCamera]);

  // Toggle camera
  const toggleCamera = useCallback(async () => {
    if (isCameraOn) {
      stopCamera();
    } else {
      await startCamera(selectedCamera);
    }
  }, [isCameraOn, stopCamera, startCamera, selectedCamera]);

  // Initialize camera devices and auto-start if enabled
  useEffect(() => {
    getCameraDevices();
    
    if (autoStart && isStreamer) {
      startCamera();
    }
  }, [autoStart, isStreamer, getCameraDevices, startCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Handle camera device changes
  useEffect(() => {
    const handleDeviceChange = () => {
      getCameraDevices();
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [getCameraDevices]);

  return (
    <div className="live-stream-camera">
      <div className="camera-container">
        <video
          ref={videoRef}
          className={`camera-video ${isCameraOn ? 'active' : ''}`}
          autoPlay
          playsInline
          muted={isStreamer} // Streamer's video should be muted to prevent feedback
          controls={false}
        />
        
        {!isCameraOn && !isLoading && (
          <div className="camera-placeholder">
            <div className="camera-icon">📹</div>
            <p>{isStreamer ? 'Camera will start automatically' : 'Camera not available'}</p>
          </div>
        )}
        
        {isLoading && (
          <div className="camera-loading">
            <div className="loading-spinner"></div>
            <p>Starting camera...</p>
          </div>
        )}
        
        {error && (
          <div className="camera-error">
            <p>⚠️ {error}</p>
            <button onClick={() => startCamera(selectedCamera)}>Retry</button>
          </div>
        )}
      </div>

      <div className="camera-controls">
        {isStreamer && (
          <>
            <button
              onClick={toggleCamera}
              className={`control-btn ${isCameraOn ? 'stop' : 'start'}`}
              disabled={isLoading}
            >
              {isCameraOn ? '🛑 Stop Camera' : '📹 Start Camera'}
            </button>
            
            {cameraDevices.length > 1 && (
              <button
                onClick={switchCamera}
                className="control-btn switch"
                disabled={!isCameraOn || isLoading}
              >
                🔄 Switch Camera
              </button>
            )}
            
            {cameraDevices.length > 1 && (
              <select
                value={selectedCamera}
                onChange={(e) => setSelectedCamera(e.target.value)}
                className="camera-select"
                disabled={!isCameraOn || isLoading}
              >
                {cameraDevices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${device.deviceId.slice(0, 8)}...`}
                  </option>
                ))}
              </select>
            )}
          </>
        )}
        
        <div className="camera-status">
          <span className={`status-indicator ${isCameraOn ? 'on' : 'off'}`}>
            {isCameraOn ? '🟢 Live' : '🔴 Off'}
          </span>
          {isStreamer && (
            <span className="quality-indicator">
              Quality: {quality.toUpperCase()}
            </span>
          )}
        </div>
      </div>

      <style jsx>{`
        .live-stream-camera {
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .camera-container {
          position: relative;
          width: 100%;
          background: #000;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 16px;
        }
        
        .camera-video {
          width: 100%;
          height: auto;
          min-height: 400px;
          background: #1a1a1a;
          display: block;
        }
        
        .camera-video.active {
          background: transparent;
        }
        
        .camera-placeholder {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          color: #fff;
        }
        
        .camera-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        
        .camera-loading {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          color: #fff;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #333;
          border-top: 4px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .camera-error {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          color: #ff6b6b;
          background: rgba(0, 0, 0, 0.8);
          padding: 20px;
          border-radius: 8px;
        }
        
        .camera-error button {
          background: #007bff;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 12px;
        }
        
        .camera-controls {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
          justify-content: center;
        }
        
        .control-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .control-btn.start {
          background: #28a745;
          color: white;
        }
        
        .control-btn.stop {
          background: #dc3545;
          color: white;
        }
        
        .control-btn.switch {
          background: #17a2b8;
          color: white;
        }
        
        .control-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .camera-select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
        }
        
        .camera-status {
          display: flex;
          gap: 16px;
          align-items: center;
          margin-left: auto;
        }
        
        .status-indicator {
          font-weight: 500;
        }
        
        .status-indicator.on {
          color: #28a745;
        }
        
        .status-indicator.off {
          color: #dc3545;
        }
        
        .quality-indicator {
          color: #6c757d;
          font-size: 14px;
        }
        
        @media (max-width: 768px) {
          .camera-controls {
            flex-direction: column;
            align-items: stretch;
          }
          
          .camera-status {
            margin-left: 0;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default LiveStreamCamera;
