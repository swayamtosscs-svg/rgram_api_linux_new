# User Assets API Documentation

This API provides comprehensive functionality for managing user assets (images and videos) with local file storage in the `public/assets` directory.

## Overview

The User Assets API allows users to:
- Upload images and videos to their personal asset folders
- Retrieve their assets with pagination and filtering
- Delete individual or multiple assets
- Update asset metadata (title, description, tags)
- Get storage statistics and overview

## File Structure

```
public/assets/
├── {username}/
│   ├── images/
│   │   └── {username}_{timestamp}_{random}.{ext}
│   └── videos/
│       └── {username}_{timestamp}_{random}.{ext}
```

## API Endpoints

### 1. Upload Asset
**POST** `/api/user-assets/upload`

Upload an image or video file to the user's asset folder.

#### Request
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `file` (required): The file to upload
  - `userId` (required): User's MongoDB ObjectId
  - `title` (optional): Asset title
  - `description` (optional): Asset description
  - `tags` (optional): JSON array of tags
  - `isPublic` (optional): Boolean, defaults to true

#### Supported File Types
- **Images**: JPG, JPEG, PNG, GIF, WebP, BMP, SVG, AVIF
- **Videos**: MP4, AVI, MOV, WMV, FLV, WebM, MKV, M4V

#### File Size Limits
- **Images**: 50MB maximum
- **Videos**: 200MB maximum

#### Response
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "assetId": "64f1a2b3c4d5e6f7g8h9i0j1",
    "fileName": "username_1757056023956_abc123.webp",
    "originalName": "photo.jpg",
    "publicUrl": "/assets/username/images/username_1757056023956_abc123.webp",
    "fileType": "image",
    "fileSize": 1024000,
    "dimensions": {
      "width": 1920,
      "height": 1080
    },
    "duration": null,
    "uploadedBy": {
      "userId": "64f1a2b3c4d5e6f7g8h9i0j1",
      "username": "username",
      "fullName": "Full Name"
    },
    "uploadedAt": "2024-01-05T10:30:00.000Z",
    "isPublic": true
  }
}
```

### 2. Retrieve Assets
**GET** `/api/user-assets/retrieve`

Retrieve user assets with pagination and filtering options.

#### Query Parameters
- `userId` (required): User's MongoDB ObjectId
- `assetId` (optional): Specific asset ID for single asset retrieval
- `type` (optional): Filter by file type (`image` or `video`)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sortBy` (optional): Sort field (`uploadedAt`, `lastAccessed`, `fileSize`, `originalName`)
- `sortOrder` (optional): Sort order (`asc` or `desc`, default: `desc`)
- `search` (optional): Search in title, description, or filename
- `tags` (optional): Comma-separated tags to filter by

#### Response
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "username": "username",
      "fullName": "Full Name",
      "avatar": "avatar_url"
    },
    "assets": [
      {
        "id": "64f1a2b3c4d5e6f7g8h9i0j1",
        "fileName": "username_1757056023956_abc123.webp",
        "originalName": "photo.jpg",
        "publicUrl": "/assets/username/images/username_1757056023956_abc123.webp",
        "fileType": "image",
        "mimeType": "image/webp",
        "fileSize": 1024000,
        "dimensions": {
          "width": 1920,
          "height": 1080
        },
        "duration": null,
        "title": "My Photo",
        "description": "A beautiful sunset",
        "tags": ["sunset", "nature"],
        "isPublic": true,
        "uploadedAt": "2024-01-05T10:30:00.000Z",
        "lastAccessed": "2024-01-05T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "summary": {
      "totalAssets": 50,
      "imageCount": 30,
      "videoCount": 20,
      "totalSize": 1048576000
    }
  }
}
```

### 3. Delete Asset
**DELETE** `/api/user-assets/delete`

Delete a single asset or multiple assets.

#### Query Parameters (Single Delete)
- `assetId` (required): Asset ID to delete
- `userId` (optional): User ID for ownership verification

#### Request Body (Bulk Delete)
```json
{
  "assetIds": ["64f1a2b3c4d5e6f7g8h9i0j1", "64f1a2b3c4d5e6f7g8h9i0j2"],
  "userId": "64f1a2b3c4d5e6f7g8h9i0j1"
}
```

#### Response
```json
{
  "success": true,
  "message": "Asset deleted successfully",
  "data": {
    "deletedAsset": {
      "assetId": "64f1a2b3c4d5e6f7g8h9i0j1",
      "fileName": "username_1757056023956_abc123.webp",
      "originalName": "photo.jpg",
      "publicUrl": "/assets/username/images/username_1757056023956_abc123.webp",
      "fileType": "image",
      "fileSize": 1024000,
      "title": "My Photo",
      "uploadedBy": {
        "id": "64f1a2b3c4d5e6f7g8h9i0j1",
        "username": "username",
        "fullName": "Full Name"
      }
    },
    "deletedAt": "2024-01-05T10:30:00.000Z",
    "deletionStatus": {
      "filesystem": "success",
      "database": "success"
    }
  }
}
```

### 4. Get User Assets Overview
**GET** `/api/user-assets`

Get comprehensive overview of user's assets including statistics.

#### Query Parameters
- `userId` (required): User's MongoDB ObjectId

#### Response
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "username": "username",
      "fullName": "Full Name",
      "avatar": "avatar_url"
    },
    "statistics": {
      "totalAssets": 50,
      "imageCount": 30,
      "videoCount": 20,
      "totalSize": 1048576000,
      "storageBreakdown": {
        "images": {
          "count": 30,
          "size": 524288000,
          "percentage": 50
        },
        "videos": {
          "count": 20,
          "size": 524288000,
          "percentage": 50
        }
      }
    },
    "recentAssets": [
      {
        "id": "64f1a2b3c4d5e6f7g8h9i0j1",
        "fileName": "username_1757056023956_abc123.webp",
        "originalName": "photo.jpg",
        "fileType": "image",
        "publicUrl": "/assets/username/images/username_1757056023956_abc123.webp",
        "fileSize": 1024000,
        "uploadedAt": "2024-01-05T10:30:00.000Z"
      }
    ],
    "apiEndpoints": {
      "upload": "/api/user-assets/upload",
      "retrieve": "/api/user-assets/retrieve",
      "delete": "/api/user-assets/delete",
      "overview": "/api/user-assets"
    }
  }
}
```

### 5. Update Asset Metadata
**PUT** `/api/user-assets`

Update asset metadata (title, description, tags, visibility).

#### Request Body
```json
{
  "assetId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "userId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "title": "Updated Title",
  "description": "Updated description",
  "tags": ["tag1", "tag2", "tag3"],
  "isPublic": true
}
```

#### Response
```json
{
  "success": true,
  "message": "Asset metadata updated successfully",
  "data": {
    "asset": {
      "id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "fileName": "username_1757056023956_abc123.webp",
      "originalName": "photo.jpg",
      "publicUrl": "/assets/username/images/username_1757056023956_abc123.webp",
      "fileType": "image",
      "title": "Updated Title",
      "description": "Updated description",
      "tags": ["tag1", "tag2", "tag3"],
      "isPublic": true,
      "updatedAt": "2024-01-05T10:30:00.000Z"
    }
  }
}
```

## Database Schema

### UserAssets Model
```typescript
{
  userId: ObjectId,           // Reference to User
  fileName: String,           // Generated filename
  originalName: String,       // Original filename
  filePath: String,           // Full file path
  publicUrl: String,          // Public URL for access
  fileType: String,           // 'image' or 'video'
  mimeType: String,           // MIME type
  fileSize: Number,           // File size in bytes
  width: Number,              // Image/video width
  height: Number,             // Image/video height
  duration: Number,           // Video duration (seconds)
  title: String,              // User-defined title
  description: String,        // User-defined description
  tags: [String],             // User-defined tags
  isPublic: Boolean,          // Public visibility
  uploadedAt: Date,           // Upload timestamp
  lastAccessed: Date          // Last access timestamp
}
```

## Features

### Image Processing
- Automatic image optimization using Sharp
- WebP conversion for better compression
- Automatic resizing (max 1920x1080)
- Quality optimization (85% quality)

### File Organization
- User-specific folder structure
- Automatic folder creation
- Unique filename generation
- Organized by file type (images/videos)

### Security
- User ownership verification
- File type validation
- File size limits
- Path traversal protection

### Performance
- Database indexing for fast queries
- Pagination support
- Efficient file operations
- Metadata caching

## Error Handling

The API provides comprehensive error handling with:
- Detailed error messages
- HTTP status codes
- Validation errors
- File system errors
- Database errors

## Usage Examples

### Upload an Image
```bash
curl -X POST http://localhost:3000/api/user-assets/upload \
  -F "file=@photo.jpg" \
  -F "userId=64f1a2b3c4d5e6f7g8h9i0j1" \
  -F "title=My Photo" \
  -F "description=A beautiful sunset" \
  -F "tags=[\"sunset\", \"nature\"]"
```

### Retrieve User's Images
```bash
curl "http://localhost:3000/api/user-assets/retrieve?userId=64f1a2b3c4d5e6f7g8h9i0j1&type=image&page=1&limit=10"
```

### Delete an Asset
```bash
curl -X DELETE "http://localhost:3000/api/user-assets/delete?assetId=64f1a2b3c4d5e6f7g8h9i0j1&userId=64f1a2b3c4d5e6f7g8h9i0j1"
```

### Get User Overview
```bash
curl "http://localhost:3000/api/user-assets?userId=64f1a2b3c4d5e6f7g8h9i0j1"
```

## Dependencies

- `sharp`: Image processing and optimization
- `mongoose`: MongoDB ODM
- `fs/promises`: File system operations
- `path`: Path utilities

## Environment Variables

No additional environment variables are required beyond the standard MongoDB connection string.

## Notes

- Files are stored in the `public/assets` directory
- Images are automatically optimized and converted to WebP
- User asset counts are automatically updated
- File paths are unique to prevent conflicts
- All operations are logged for debugging
