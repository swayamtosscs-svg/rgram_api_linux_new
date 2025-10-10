# Baba Pages Cloudinary Integration

This document describes the Cloudinary integration for the Baba Pages API, which handles posts, videos, and stories with cloud-based media storage.

## Overview

The Baba Pages API now uses Cloudinary for all media storage operations, providing:
- **Upload**: Media files are uploaded to Cloudinary with organized folder structure
- **Retrieve**: Media URLs are served directly from Cloudinary CDN
- **Delete**: Media files are properly cleaned up from Cloudinary when deleted

## Folder Structure

Cloudinary uses the following folder structure for baba pages content:

```
baba-pages/
├── {pageId}/
│   ├── posts/
│   │   └── {filename}
│   ├── videos/
│   │   ├── {video_filename}
│   │   └── thumbnails/
│   │       └── {thumbnail_filename}
│   └── stories/
│       └── {filename}
```

## API Endpoints

### Posts API

#### Create Post
- **Endpoint**: `POST /api/baba-pages/{id}/posts`
- **Content-Type**: `multipart/form-data` or `application/json`
- **Body**:
  - `content` (string, required): Post content
  - `media` (File[], optional): Media files (images/videos)

#### Get Posts
- **Endpoint**: `GET /api/baba-pages/{id}/posts`
- **Query Parameters**:
  - `page` (number, default: 1): Page number
  - `limit` (number, default: 10): Items per page

#### Get Individual Post
- **Endpoint**: `GET /api/baba-pages/{id}/posts/{postId}`

#### Update Post
- **Endpoint**: `PUT /api/baba-pages/{id}/posts/{postId}`
- **Body**:
  - `content` (string): Updated content

#### Delete Post
- **Endpoint**: `DELETE /api/baba-pages/{id}/posts/{postId}`
- **Note**: Automatically deletes associated media from Cloudinary

### Videos API

#### Create Video
- **Endpoint**: `POST /api/baba-pages/{id}/videos`
- **Content-Type**: `multipart/form-data` or `application/json`
- **Body**:
  - `title` (string, required): Video title
  - `description` (string, optional): Video description
  - `category` (string, required): "reel" or "video"
  - `video` (File, optional): Video file
  - `thumbnail` (File, optional): Thumbnail image

#### Get Videos
- **Endpoint**: `GET /api/baba-pages/{id}/videos`
- **Query Parameters**:
  - `page` (number, default: 1): Page number
  - `limit` (number, default: 10): Items per page
  - `category` (string, optional): Filter by "reel" or "video"

#### Get Individual Video
- **Endpoint**: `GET /api/baba-pages/{id}/videos/{videoId}`
- **Note**: Automatically increments view count

#### Update Video
- **Endpoint**: `PUT /api/baba-pages/{id}/videos/{videoId}`
- **Body**:
  - `title` (string): Updated title
  - `description` (string): Updated description

#### Delete Video
- **Endpoint**: `DELETE /api/baba-pages/{id}/videos/{videoId}`
- **Note**: Automatically deletes video and thumbnail from Cloudinary

### Stories API

#### Create Story
- **Endpoint**: `POST /api/baba-pages/{id}/stories`
- **Content-Type**: `multipart/form-data` or `application/json`
- **Body**:
  - `content` (string, optional): Story text
  - `media` (File, optional): Media file (image/video)
- **Note**: Stories auto-expire after 24 hours

#### Get Stories
- **Endpoint**: `GET /api/baba-pages/{id}/stories`
- **Note**: Only returns active, non-expired stories

#### Get Individual Story
- **Endpoint**: `GET /api/baba-pages/{id}/stories/{storyId}`
- **Note**: Automatically increments view count

#### Delete Story
- **Endpoint**: `DELETE /api/baba-pages/{id}/stories/{storyId}`
- **Note**: Automatically deletes associated media from Cloudinary

## Cloudinary Configuration

### Environment Variables

Make sure these environment variables are set:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Utility Functions

The integration includes several utility functions in `utils/babaPagesCloudinary.ts`:

#### `uploadBabaPageMedia(file, pageId, mediaType, subFolder?)`
Uploads a media file to Cloudinary with proper folder structure.

#### `deleteBabaPageMedia(publicId)`
Deletes a media file from Cloudinary using its public ID.

#### `extractPublicIdFromBabaPageUrl(url)`
Extracts the public ID from a Cloudinary URL for deletion operations.

#### `listBabaPageMedia(pageId, mediaType)`
Lists all media files for a specific baba page and media type.

#### `cleanupUnusedBabaPageMedia(pageId, mediaType, currentFileUrls)`
Cleans up unused media files from Cloudinary.

#### `getBabaPageMediaStats(pageId)`
Gets media statistics for a baba page.

## Data Models

### Updated Models

All models now include a `publicId` field for better Cloudinary integration:

#### BabaPost
```typescript
media: {
  type: 'image' | 'video';
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  publicId?: string; // New field for Cloudinary
}[]
```

#### BabaVideo
```typescript
video?: {
  url: string;
  filename: string;
  size: number;
  duration: number;
  mimeType: string;
  publicId?: string; // New field for Cloudinary
};
thumbnail?: {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  publicId?: string; // New field for Cloudinary
};
```

#### BabaStory
```typescript
media?: {
  type: 'image' | 'video';
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  publicId?: string; // New field for Cloudinary
};
```

## Error Handling

The API includes comprehensive error handling for Cloudinary operations:

- **Upload Failures**: Returns 500 status with error message
- **Delete Failures**: Logs errors but continues with database operations
- **Invalid Files**: Returns 400 status with validation message
- **Missing Files**: Returns 400 status when required files are missing

## Migration Notes

### Backward Compatibility

The API maintains backward compatibility with existing data:
- Old media URLs without `publicId` are handled by extracting the public ID from the URL
- Both old local file paths and new Cloudinary URLs are supported
- Gradual migration is possible without breaking existing functionality

### File Cleanup

When migrating from local storage to Cloudinary:
1. Existing local files remain accessible
2. New uploads go to Cloudinary
3. Old files can be cleaned up manually or through the cleanup utilities

## Usage Examples

### Upload a Post with Media

```javascript
const formData = new FormData();
formData.append('content', 'This is a test post');
formData.append('media', imageFile);

const response = await fetch('/api/baba-pages/64a1b2c3d4e5f6789012345/posts', {
  method: 'POST',
  body: formData
});
```

### Upload a Video with Thumbnail

```javascript
const formData = new FormData();
formData.append('title', 'My Video');
formData.append('description', 'Video description');
formData.append('category', 'video');
formData.append('video', videoFile);
formData.append('thumbnail', thumbnailFile);

const response = await fetch('/api/baba-pages/64a1b2c3d4e5f6789012345/videos', {
  method: 'POST',
  body: formData
});
```

### Delete a Post

```javascript
const response = await fetch('/api/baba-pages/64a1b2c3d4e5f6789012345/posts/64a1b2c3d4e5f6789012346', {
  method: 'DELETE'
});
```

## Performance Benefits

- **CDN Delivery**: Media files are served from Cloudinary's global CDN
- **Automatic Optimization**: Images and videos are automatically optimized
- **Scalable Storage**: No local storage limitations
- **Backup & Recovery**: Cloudinary provides automatic backups
- **Transformations**: On-the-fly image/video transformations available

## Security

- **Access Control**: Media files are only accessible through the API
- **Validation**: File types and sizes are validated before upload
- **Cleanup**: Deleted content is properly removed from Cloudinary
- **Organized Structure**: Clear folder hierarchy prevents conflicts

## Monitoring

The integration includes comprehensive logging for:
- Upload success/failure
- Delete operations
- Error conditions
- Performance metrics

Check the server logs for detailed information about Cloudinary operations.


