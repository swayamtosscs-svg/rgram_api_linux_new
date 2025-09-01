# 🎥 Live Streaming Camera Implementation

This document describes the complete camera implementation for the live streaming system, including automatic camera access for streamers and viewer camera retrieval capabilities.

## 🚀 Features

### **For Streamers:**
- ✅ **Automatic Camera Access**: Camera opens automatically when starting a stream
- ✅ **Multiple Camera Support**: Switch between front/back cameras and external cameras
- ✅ **Quality Settings**: Configurable resolution (480p, 720p, 1080p) and frame rates
- ✅ **Real-time Preview**: Live camera feed with controls
- ✅ **Camera Device Management**: Select and manage multiple camera devices
- ✅ **Error Handling**: Comprehensive error handling for camera access issues

### **For Viewers:**
- ✅ **Camera Access Detection**: Automatically detect if viewer has camera access
- ✅ **Camera Data Tracking**: Track viewer camera capabilities and device info
- ✅ **Enhanced Analytics**: Include camera data in viewer statistics
- ✅ **Privacy Controls**: Respect user camera permissions

## 📁 File Structure

```
api_rgram1/
├── components/
│   ├── LiveStreamCamera.tsx          # Camera component for streamers
│   └── LiveStreamViewer.tsx          # Viewer component for watching streams
├── hooks/
│   └── useCamera.ts                  # Custom hook for camera management
├── pages/
│   ├── live-stream.tsx               # Main live streaming page
│   └── live-stream/[id].tsx          # Individual stream viewer page
└── pages/api/live-stream/
    └── viewer.ts                     # Enhanced viewer tracking API
```

## 🔧 Components Overview

### 1. **LiveStreamCamera Component**
The main camera component for streamers that automatically opens the camera.

**Key Features:**
- Automatic camera initialization
- Multiple camera device support
- Quality and resolution controls
- Real-time video preview
- Error handling and retry mechanisms

**Props:**
```typescript
interface LiveStreamCameraProps {
  isStreamer: boolean;           // Whether this is a streamer view
  streamId?: string;             // Stream ID for tracking
  onStreamStart?: (stream: MediaStream) => void;  // Camera started callback
  onStreamStop?: () => void;     // Camera stopped callback
  onError?: (error: string) => void;  // Error callback
  autoStart?: boolean;           // Auto-start camera
  quality?: 'low' | 'medium' | 'high';  // Video quality
  facingMode?: 'user' | 'environment';  // Camera facing mode
}
```

**Usage:**
```tsx
<LiveStreamCamera
  isStreamer={true}
  streamId="stream_123"
  onStreamStart={(stream) => console.log('Camera started:', stream)}
  onStreamStop={() => console.log('Camera stopped')}
  onError={(error) => console.error('Camera error:', error)}
  autoStart={true}
  quality="720p"
  facingMode="user"
/>
```

### 2. **LiveStreamViewer Component**
Component for viewers to watch live streams with camera access detection.

**Key Features:**
- Automatic stream joining
- Camera access detection
- Real-time comments and likes
- Stream statistics
- Error handling

**Props:**
```typescript
interface LiveStreamViewerProps {
  streamId: string;              // Stream ID to watch
  streamUrl: string;             // Stream playback URL
  title: string;                 // Stream title
  username: string;              // Streamer username
  onJoin?: () => void;           // Join callback
  onLeave?: () => void;          // Leave callback
  onComment?: (message: string) => void;  // Comment callback
  onLike?: () => void;           // Like callback
  isPrivate?: boolean;           // Private stream flag
  allowComments?: boolean;       // Allow comments
  allowLikes?: boolean;          // Allow likes
}
```

### 3. **useCamera Hook**
Custom React hook for managing camera access and streams.

**Features:**
- Camera device enumeration
- Permission management
- Stream constraints configuration
- Device switching
- Error handling

**Usage:**
```tsx
const {
  stream,
  isActive,
  isLoading,
  error,
  devices,
  selectedDevice,
  startCamera,
  stopCamera,
  switchCamera,
  hasPermission,
  requestPermission
} = useCamera();

// Start camera with custom constraints
await startCamera({
  width: { ideal: 1920, min: 1280 },
  height: { ideal: 1080, min: 720 },
  frameRate: { ideal: 30, min: 24 }
}, selectedDevice);
```

## 🎯 Camera Implementation Details

### **Automatic Camera Access**

1. **Permission Request**: Camera permission is automatically requested when the component mounts
2. **Device Detection**: Available camera devices are enumerated and listed
3. **Auto-start**: Camera starts automatically for streamers (configurable)
4. **Quality Settings**: Camera quality is set based on user preferences

### **Camera Constraints**

The system automatically sets optimal camera constraints:

```typescript
const constraints = {
  video: {
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
```

### **Error Handling**

Comprehensive error handling for various camera scenarios:

- **Permission Denied**: User denied camera access
- **No Camera Found**: Device has no camera
- **Camera in Use**: Camera is used by another application
- **Constraints Not Met**: Camera doesn't meet quality requirements
- **Browser Not Supported**: MediaDevices API not available

## 📊 Enhanced Viewer Tracking

### **Camera Data Collection**

The viewer tracking API now collects camera information:

```typescript
// Enhanced viewer history
{
  viewerId: string;
  joinedAt: Date;
  leftAt?: Date;
  watchDuration?: number;
  cameraAccess: boolean;        // NEW: Camera access status
  deviceInfo?: {                // NEW: Device information
    hasCamera: boolean;
    cameraCount: number;
    deviceType: string;
  };
}
```

### **API Endpoint Updates**

**POST** `/api/live-stream/viewer`

**Request Body:**
```json
{
  "streamId": "stream_id_here",
  "action": "join",
  "cameraData": {
    "hasCamera": true,
    "deviceInfo": {
      "cameraCount": 2,
      "deviceType": "mobile",
      "supportsHD": true
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Viewer joined successfully",
  "data": {
    "streamId": "stream_id_here",
    "viewerCount": 15,
    "peakViewerCount": 20,
    "totalViews": 150,
    "action": "join",
    "userId": "user_id_here",
    "cameraAccess": true
  }
}
```

## 🚀 Usage Examples

### **Starting a Live Stream with Camera**

```tsx
import LiveStreamCamera from '../components/LiveStreamCamera';

function StreamerPage() {
  const handleCameraStart = (stream) => {
    console.log('Camera stream started:', stream);
    // Send stream to streaming service
    // Update UI to show "Live" status
  };

  const handleCameraError = (error) => {
    console.error('Camera error:', error);
    // Show error message to user
  };

  return (
    <div>
      <h1>Start Your Stream</h1>
      <LiveStreamCamera
        isStreamer={true}
        streamId="my_stream_123"
        onStreamStart={handleCameraStart}
        onError={handleCameraError}
        autoStart={true}
        quality="720p"
      />
    </div>
  );
}
```

### **Watching a Live Stream**

```tsx
import LiveStreamViewer from '../components/LiveStreamViewer';

function ViewerPage() {
  return (
    <LiveStreamViewer
      streamId="stream_123"
      streamUrl="https://cdn.com/stream.m3u8"
      title="Morning Darshan"
      username="Temple Priest"
      onJoin={() => console.log('Joined stream')}
      onComment={(message) => console.log('Comment:', message)}
      onLike={() => console.log('Liked stream')}
    />
  );
}
```

### **Using the Camera Hook**

```tsx
import useCamera from '../hooks/useCamera';

function CameraTest() {
  const {
    stream,
    isActive,
    devices,
    startCamera,
    stopCamera,
    switchCamera
  } = useCamera();

  return (
    <div>
      <video
        ref={videoRef}
        srcObject={stream}
        autoPlay
        playsInline
      />
      
      <button onClick={() => startCamera()}>
        Start Camera
      </button>
      
      <button onClick={stopCamera}>
        Stop Camera
      </button>
      
      {devices.length > 1 && (
        <button onClick={switchCamera}>
          Switch Camera
        </button>
      )}
    </div>
  );
}
```

## 🔒 Privacy & Security

### **Camera Permissions**
- Camera access is only requested when explicitly needed
- Users can deny camera access and still view streams
- Camera data is only collected with user consent

### **Data Protection**
- Camera device IDs are anonymized
- No video data is stored or transmitted without permission
- Camera access status is only used for analytics

## 📱 Mobile Support

### **Responsive Design**
- Camera controls adapt to mobile screens
- Touch-friendly interface for mobile devices
- Optimized for both portrait and landscape orientations

### **Mobile-Specific Features**
- Front/back camera switching
- Mobile camera quality optimization
- Touch gestures for camera controls

## 🧪 Testing

### **Camera Testing Checklist**
- [ ] Camera permission request works
- [ ] Multiple camera devices are detected
- [ ] Camera switching works correctly
- [ ] Quality settings are applied
- [ ] Error handling works for various scenarios
- [ ] Mobile camera access works
- [ ] Camera data is properly tracked

### **Browser Compatibility**
- ✅ Chrome/Chromium (desktop & mobile)
- ✅ Firefox (desktop & mobile)
- ✅ Safari (desktop & mobile)
- ✅ Edge (desktop & mobile)

## 🚀 Future Enhancements

### **Planned Features**
- **Screen Sharing**: Allow streamers to share their screen
- **Picture-in-Picture**: Support for PiP mode
- **Camera Filters**: Real-time video filters and effects
- **Advanced Analytics**: Detailed camera usage statistics
- **Multi-camera Streaming**: Stream from multiple cameras simultaneously

### **Performance Optimizations**
- **Adaptive Quality**: Automatic quality adjustment based on network
- **Hardware Acceleration**: GPU acceleration for video processing
- **Bandwidth Management**: Intelligent bandwidth usage

## 📚 Additional Resources

- [MediaDevices API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices)
- [getUserMedia API Guide](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [WebRTC Best Practices](https://webrtc.github.io/webrtc/)
- [Camera Constraints Reference](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints)

## 🤝 Support

For issues or questions about the camera implementation:

1. Check the browser console for error messages
2. Verify camera permissions in browser settings
3. Test with different camera devices
4. Check browser compatibility
5. Review the error handling in the components

---

**Note**: This implementation provides a robust foundation for live streaming with camera access. The camera opens automatically for streamers and provides comprehensive tracking for viewers, ensuring a smooth and engaging live streaming experience.
