import { useState, useEffect, useCallback, useRef } from 'react';

interface CameraDevice {
  deviceId: string;
  label: string;
  kind: string;
}

interface CameraConstraints {
  width?: number | { ideal: number; min: number };
  height?: number | { ideal: number; min: number };
  frameRate?: number | { ideal: number; min: number };
  facingMode?: 'user' | 'environment';
}

interface UseCameraReturn {
  stream: MediaStream | null;
  isActive: boolean;
  isLoading: boolean;
  error: string | null;
  devices: CameraDevice[];
  selectedDevice: string;
  startCamera: (constraints?: CameraConstraints, deviceId?: string) => Promise<void>;
  stopCamera: () => void;
  switchCamera: () => Promise<void>;
  setSelectedDevice: (deviceId: string) => void;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
}

const useCamera = (): UseCameraReturn => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [hasPermission, setHasPermission] = useState(false);
  
  const streamRef = useRef<MediaStream | null>(null);

  // Get available camera devices
  const getDevices = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) {
        throw new Error('Media devices not supported');
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 8)}...`,
          kind: device.kind
        }));

      setDevices(cameras);
      
      if (cameras.length > 0 && !selectedDevice) {
        setSelectedDevice(cameras[0].deviceId);
      }
    } catch (err) {
      console.error('Failed to get camera devices:', err);
      setError('Failed to get camera devices');
    }
  }, [selectedDevice]);

  // Request camera permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera access not supported');
      }

      const testStream = await navigator.mediaDevices.getUserMedia({ video: true });
      testStream.getTracks().forEach(track => track.stop());
      
      setHasPermission(true);
      return true;
    } catch (err: any) {
      let errorMsg = 'Camera access denied';
      
      if (err.name === 'NotAllowedError') {
        errorMsg = 'Camera access denied. Please allow camera access and try again.';
      } else if (err.name === 'NotFoundError') {
        errorMsg = 'No camera found on this device.';
      } else if (err.name === 'NotReadableError') {
        errorMsg = 'Camera is already in use by another application.';
      }
      
      setError(errorMsg);
      setHasPermission(false);
      return false;
    }
  }, []);

  // Start camera with specified constraints
  const startCamera = useCallback(async (
    constraints: CameraConstraints = {},
    deviceId?: string
  ) => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera access not supported in this browser');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Stop existing stream if any
      if (streamRef.current) {
        stopCamera();
      }

      const videoConstraints: MediaTrackConstraints = {
        width: constraints.width || { ideal: 1280, min: 640 },
        height: constraints.height || { ideal: 720, min: 480 },
        frameRate: constraints.frameRate || { ideal: 24, min: 15 },
        facingMode: constraints.facingMode || 'user'
      };

      if (deviceId) {
        videoConstraints.deviceId = { exact: deviceId };
      }

      const mediaConstraints: MediaStreamConstraints = {
        video: videoConstraints,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        }
      };

      const newStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      
      streamRef.current = newStream;
      setStream(newStream);
      setIsActive(true);
      setHasPermission(true);

      // Update selected device if not set
      if (!deviceId && newStream.getVideoTracks().length > 0) {
        const track = newStream.getVideoTracks()[0];
        const settings = track.getSettings();
        if (settings.deviceId) {
          setSelectedDevice(settings.deviceId);
        }
      }

    } catch (err: any) {
      let errorMsg = 'Failed to start camera';
      
      if (err.name === 'NotAllowedError') {
        errorMsg = 'Camera access denied. Please allow camera access and try again.';
        setHasPermission(false);
      } else if (err.name === 'NotFoundError') {
        errorMsg = 'No camera found on this device.';
      } else if (err.name === 'NotReadableError') {
        errorMsg = 'Camera is already in use by another application.';
      } else if (err.name === 'OverconstrainedError') {
        errorMsg = 'Camera does not meet the required constraints.';
      }
      
      setError(errorMsg);
      setIsActive(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setStream(null);
    setIsActive(false);
  }, []);

  // Switch to next available camera
  const switchCamera = useCallback(async () => {
    if (devices.length < 2) return;
    
    const currentIndex = devices.findIndex(device => device.deviceId === selectedDevice);
    const nextIndex = (currentIndex + 1) % devices.length;
    const nextDevice = devices[nextIndex];
    
    setSelectedDevice(nextDevice.deviceId);
    
    if (isActive) {
      await startCamera({}, nextDevice.deviceId);
    }
  }, [devices, selectedDevice, isActive, startCamera]);

  // Initialize devices and check permission on mount
  useEffect(() => {
    getDevices();
    requestPermission();
  }, [getDevices, requestPermission]);

  // Handle device changes
  useEffect(() => {
    const handleDeviceChange = () => {
      getDevices();
    };

    if (navigator.mediaDevices) {
      navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
      return () => {
        navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
      };
    }
  }, [getDevices]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    stream,
    isActive,
    isLoading,
    error,
    devices,
    selectedDevice,
    startCamera,
    stopCamera,
    switchCamera,
    setSelectedDevice,
    hasPermission,
    requestPermission
  };
};

export default useCamera;
