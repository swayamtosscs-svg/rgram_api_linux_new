# Live Streaming API with Viewer Tracking

## Overview
This API now includes comprehensive viewer tracking for live streams. When you start a live stream and viewers join, you can now track and retrieve viewer information including viewer IDs.

## Key Features Added
- ✅ **Active Viewer Tracking**: Track who is currently watching the stream
- ✅ **Viewer History**: Record when viewers join/leave and watch duration
- ✅ **Real-time Viewer Count**: Accurate count of current viewers
- ✅ **Viewer Details**: Get detailed information about active viewers

## API Endpoints

### 1. Start Live Stream
```http
POST /api/live/start
```
Creates a new live stream in 'pending' status.

### 2. Go Live
```http
PUT /api/live/go-live
```
**NEW**: Now returns viewer information when stream goes live!

**Request Body:**
```json
{
  "streamId": "your_stream_id",
  "userId": "your_user_id"
}
```

**Response (Updated):**
```json
{
  "success": true,
  "message": "Stream is now live!",
  "data": {
    "streamId": "stream_id_here",
    "status": "live",
    "startedAt": "2024-01-01T10:00:00.000Z",
    "playbackUrl": "https://your-cdn.com/live/stream_key/index.m3u8",
    "title": "Your Stream Title",
    "viewerInfo": {
      "currentViewers": [],
      "viewerCount": 0,
      "maxViewers": 1000,
      "isPrivate": false,
      "allowedViewers": []
    },
    "streamSettings": {
      "quality": "720p",
      "enableChat": true,
      "enableLikes": true,
      "enableComments": true
    }
  }
}
```

### 3. Join Stream
```http
POST /api/live/join
```
**UPDATED**: Now properly tracks active viewers and adds to viewer history.

**Request Body:**
```json
{
  "streamId": "stream_id_here",
  "viewerId": "viewer_user_id_here"
}
```

**Response (Updated):**
```json
{
  "success": true,
  "message": "Successfully joined stream",
  "data": {
    "streamId": "stream_id_here",
    "title": "Stream Title",
    "username": "streamer_username",
    "playbackUrl": "playback_url_here",
    "viewerCount": 1,
    "activeViewers": ["viewer_user_id_here"],
    "settings": { ... },
    "streamInfo": { ... }
  }
}
```

### 4. Get Stream Viewers (NEW!)
```http
GET /api/live/viewers?streamId=stream_id_here
```
**NEW ENDPOINT**: Get detailed information about current viewers.

**Response:**
```json
{
  "success": true,
  "message": "Stream viewers retrieved successfully",
  "data": {
    "streamId": "stream_id_here",
    "title": "Stream Title",
    "status": "live",
    "viewerStats": {
      "currentViewers": ["viewer_id_1", "viewer_id_2"],
      "viewerCount": 2,
      "peakViewerCount": 5,
      "totalViews": 10,
      "maxViewers": 1000
    },
    "viewers": [
      {
        "viewerId": "viewer_id_1",
        "username": "viewer1",
        "fullName": "Viewer One",
        "avatar": "avatar_url",
        "isVerified": false
      },
      {
        "viewerId": "viewer_id_2",
        "username": "viewer2",
        "fullName": "Viewer Two",
        "avatar": "avatar_url",
        "isVerified": true
      }
    ],
    "streamInfo": {
      "startedAt": "2024-01-01T10:00:00.000Z",
      "duration": 3600,
      "category": "darshan",
      "isPrivate": false
    }
  }
}
```

### 5. Leave Stream
```http
POST /api/live/leave
```
**UPDATED**: Now properly removes from active viewers and updates viewer history.

## Testing in Postman

### Step 1: Start a Stream
1. Use the "Start Live Stream" endpoint
2. Save the returned `streamId`

### Step 2: Go Live
1. Use the "Go Live" endpoint with your `streamId`
2. **NEW**: You'll now see viewer information in the response!

### Step 3: Join as Viewer
1. Use the "Join Stream" endpoint
2. Use a different `viewerId` than the streamer
3. **NEW**: You'll see the viewer added to `activeViewers`

### Step 4: Check Viewers
1. Use the "Get Stream Viewers" endpoint
2. **NEW**: Get detailed information about all current viewers!

### Step 5: Leave Stream
1. Use the "Leave Stream" endpoint
2. **NEW**: Viewer will be removed from active viewers

## Database Schema Updates

The `LiveStream` model now includes:

```typescript
interface ILiveStream {
  // ... existing fields ...
  activeViewers?: string[]; // Currently watching viewers
  viewerHistory?: Array<{
    viewerId: string;
    joinedAt: Date;
    leftAt?: Date;
    watchDuration?: number; // in seconds
  }>;
}
```

## Viewer Tracking Flow

1. **Stream Starts**: `activeViewers` is empty, `viewerCount` is 0
2. **Viewer Joins**: Added to `activeViewers`, `viewerCount` increases, entry added to `viewerHistory`
3. **Viewer Leaves**: Removed from `activeViewers`, `viewerCount` decreases, `viewerHistory` updated with leave time and duration
4. **Real-time Stats**: Always get accurate current viewer count and list

## Benefits

- 🎯 **Accurate Viewer Count**: No more duplicate counting
- 👥 **Real-time Viewer List**: Know exactly who is watching
- 📊 **Viewer Analytics**: Track join/leave patterns and watch duration
- 🔒 **Private Stream Support**: Control who can view private streams
- 📱 **Mobile App Ready**: Perfect for real-time viewer updates

## Example Postman Test Flow

```bash
# 1. Start stream
POST /api/live/start
# Save streamId from response

# 2. Go live
PUT /api/live/go-live
# Now returns viewer info!

# 3. Join as viewer 1
POST /api/live/join
# Viewer added to activeViewers

# 4. Join as viewer 2
POST /api/live/join
# Both viewers now in activeViewers

# 5. Check current viewers
GET /api/live/viewers?streamId=your_stream_id
# Get detailed viewer information!

# 6. Leave as viewer 1
POST /api/live/leave
# Viewer removed from activeViewers

# 7. Check viewers again
GET /api/live/viewers?streamId=your_stream_id
# See updated viewer list
```

## Troubleshooting

### Issue: Viewer ID not showing in response
**Solution**: Make sure you're calling the "Get Stream Viewers" endpoint after viewers have joined the stream.

### Issue: Viewer count not updating
**Solution**: Ensure you're calling the join/leave endpoints properly. Check that `viewerId` is valid.

### Issue: Active viewers array is empty
**Solution**: Viewers need to join the stream first using the "Join Stream" endpoint.

## Next Steps

- Implement real-time WebSocket updates for live viewer count
- Add viewer engagement metrics (likes, comments, shares)
- Create viewer analytics dashboard
- Add viewer notifications when stream goes live

---

**Note**: This API now provides complete viewer tracking capabilities. When testing in Postman, you'll see viewer IDs and detailed viewer information in the responses!
