# Asset Upload API Implementation

## Overview
This implementation provides comprehensive asset management for posts, reels, and stories with support for images, videos, and audio files including song uploads with thumbnails.

## Directory Structure
```
public/
├── assets/
│   ├── images/     # Image uploads (JPG, PNG, GIF, WebP)
│   ├── videos/     # Video uploads (MP4, AVI, MOV, WMV, FLV, WebM)
│   └── audio/      # Audio uploads (MP3, WAV, OGG, MPEG)
```

## Features Implemented

### ✅ Image Upload
- **Location**: `public/assets/images/`
- **Formats**: JPG, JPEG, PNG, GIF, WebP
- **Max Size**: 50MB per file
- **Max Files**: 10 files per request

### ✅ Video Upload  
- **Location**: `public/assets/videos/`
- **Formats**: MP4, AVI, MOV, WMV, FLV, WebM
- **Max Size**: 50MB per file
- **Max Files**: 10 files per request

### ✅ Audio/Song Upload
- **Location**: `public/assets/audio/`
- **Formats**: MP3, WAV, OGG, MPEG
- **Max Size**: 50MB per file
- **Features**: Song title, artist, duration, thumbnail support

## API Endpoints

### Posts API (`/api/posts/enhanced`)
- **POST**: Create posts with media and songs
- **GET**: Retrieve posts with pagination and filtering
- **PUT**: Update posts (media and songs)
- **DELETE**: Delete posts and associated files

### Reels API (`/api/reels/enhanced`)
- **POST**: Create reels with media and songs
- **GET**: Retrieve reels with trending support
- **PUT**: Update reels (media and songs)
- **DELETE**: Delete reels and associated files

### Stories API (`/api/stories/enhanced`)
- **POST**: Create stories with media and songs
- **GET**: Retrieve active stories (24-hour expiration)
- **DELETE**: Delete stories and associated files

## File Upload Process

### 1. File Processing
```typescript
// Files are automatically categorized by type
const fileInfo = getFileInfo(file);
// Returns: fileName, filePath, publicUrl, fileSize, mimeType, storageType, type
```

### 2. Database Storage
```typescript
// Media files stored in EnhancedPost model
media: [{
  fileName: string,
  filePath: string,
  publicUrl: string,    // /assets/images/filename.jpg
  fileSize: number,
  mimeType: string,
  storageType: 'local',
  isPublic: true,
  type: 'image' | 'video' | 'audio'
}]

// Song data stored separately
song: {
  title: string,
  artist: string,
  duration: number,
  audioUrl: string,     // /assets/audio/filename.mp3
  thumbnailUrl: string  // /assets/images/thumbnail.jpg
}
```

### 3. Public URL Generation
- Images: `/assets/images/filename.jpg`
- Videos: `/assets/videos/filename.mp4`
- Audio: `/assets/audio/filename.mp3`

## Usage Examples

### Create Post with Image
```javascript
const formData = new FormData();
formData.append('content', 'Check out this amazing photo!');
formData.append('type', 'post');
formData.append('mediaFiles', imageFile);

fetch('/api/posts/enhanced', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
});
```

### Create Reel with Song
```javascript
const formData = new FormData();
formData.append('content', 'Dancing to this awesome track!');
formData.append('type', 'reel');
formData.append('mediaFiles', videoFile);
formData.append('songTitle', 'Amazing Song');
formData.append('songArtist', 'Cool Artist');
formData.append('audioFile', audioFile);
formData.append('thumbnailFile', thumbnailFile);

fetch('/api/reels/enhanced', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
});
```

### Create Story with Multiple Media
```javascript
const formData = new FormData();
formData.append('content', 'My day in pictures!');
formData.append('type', 'story');
formData.append('mediaFiles', imageFile1);
formData.append('mediaFiles', imageFile2);
formData.append('mediaFiles', videoFile);

fetch('/api/stories/enhanced', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
});
```

## File Management

### Automatic Cleanup
- **Update**: Old files are automatically deleted when new ones are uploaded
- **Delete**: All associated files are removed when posts/reels/stories are deleted
- **Soft Delete**: Posts are marked as inactive but files remain until hard delete

### File Validation
- **Type Checking**: Only allowed file types are accepted
- **Size Limits**: 50MB maximum per file
- **Count Limits**: Maximum 10 files per request
- **Sanitization**: Filenames are sanitized for security

## Database Integration

### EnhancedPost Model
- Stores all media file information
- Supports song metadata
- Tracks file locations and public URLs
- Maintains file relationships

### Notification System
- Mentions trigger notifications
- Collaboration requests send alerts
- File uploads can trigger activity feeds

## Security Features

### File Security
- **Type Validation**: Strict file type checking
- **Size Limits**: Prevents oversized uploads
- **Path Sanitization**: Prevents directory traversal
- **Public Access**: Files are publicly accessible via URLs

### Access Control
- **Authentication**: All endpoints require valid tokens
- **Authorization**: Users can only modify their own content
- **Collaboration**: Supports collaborative editing with proper permissions

## Performance Optimizations

### File Handling
- **Efficient Storage**: Files stored in organized directory structure
- **Public URLs**: Direct file access without API overhead
- **Batch Processing**: Multiple files processed in single request

### Database
- **Indexing**: Optimized queries for media retrieval
- **Pagination**: Efficient handling of large datasets
- **Caching**: Public URLs cached for faster access

## Error Handling

### Upload Errors
- **File Type**: Clear error messages for unsupported formats
- **Size Limits**: Informative messages for oversized files
- **Count Limits**: Warnings for too many files

### API Errors
- **Authentication**: Proper 401 responses for invalid tokens
- **Authorization**: 403 responses for unauthorized access
- **Validation**: Detailed error messages for invalid data

## Monitoring and Logging

### File Operations
- **Upload Success**: Logged with file details
- **Delete Operations**: Tracked for cleanup verification
- **Error Tracking**: Comprehensive error logging

### Performance Metrics
- **Upload Times**: Tracked for optimization
- **File Sizes**: Monitored for storage management
- **Usage Patterns**: Analyzed for capacity planning

## Future Enhancements

### Planned Features
- **Image Processing**: Automatic resizing and optimization
- **Video Transcoding**: Multiple quality options
- **Audio Processing**: Waveform generation
- **CDN Integration**: Global file distribution
- **Compression**: Automatic file compression

### Scalability
- **Cloud Storage**: Integration with AWS S3, Google Cloud
- **Load Balancing**: Multiple server support
- **Caching**: Redis-based file caching
- **Monitoring**: Real-time usage analytics

---

## Quick Start

1. **Directory Setup**: ✅ Complete
2. **Middleware**: ✅ Configured
3. **API Endpoints**: ✅ Implemented
4. **Database Models**: ✅ Ready
5. **File Management**: ✅ Active

**Status**: 🚀 **READY FOR PRODUCTION**

All asset upload functionality is now implemented and ready for use across posts, reels, and stories with full song support!
