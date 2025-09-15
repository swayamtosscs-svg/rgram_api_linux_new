# Local Storage APIs - CURL Commands Reference

## Overview
Complete CURL commands for all migrated APIs that now use local storage instead of Cloudinary.

## Authentication
Most APIs require authentication. Include the Bearer token in the Authorization header:
```bash
-H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 1. Media Upload API

### Upload Image/Video
```bash
curl -X POST "http://localhost:3000/api/media/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/your/image.jpg" \
  -F "type=image" \
  -F "userId=60f7b3b3b3b3b3b3b3b3b3b3" \
  -F "title=My Image" \
  -F "description=Image description" \
  -F "tags=[\"tag1\",\"tag2\"]"
```

### Upload Video
```bash
curl -X POST "http://localhost:3000/api/media/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/your/video.mp4" \
  -F "type=video" \
  -F "userId=60f7b3b3b3b3b3b3b3b3b3b3" \
  -F "title=My Video" \
  -F "description=Video description"
```

### Get User Media List
```bash
curl -X GET "http://localhost:3000/api/media/upload?userId=60f7b3b3b3b3b3b3b3b3b3b3&page=1&limit=10&type=image&sortBy=createdAt&sortOrder=desc"
```

**Response Example:**
```json
{
  "success": true,
  "message": "File uploaded successfully to local storage",
  "data": {
    "mediaId": "60f7b3b3b3b3b3b3b3b3b3b3",
    "fileName": "60f7b3b3b3b3b3b3b3b3b3b3_1703123456789_abc123def_image.jpg",
    "publicUrl": "/uploads/users/60f7b3b3b3b3b3b3b3b3b3b3/images/filename.jpg",
    "filePath": "/absolute/path/to/file",
    "fileType": "image",
    "fileSize": 1024000,
    "mimeType": "image/jpeg",
    "dimensions": {
      "width": 1920,
      "height": 1080
    },
    "uploadedBy": "60f7b3b3b3b3b3b3b3b3b3b3",
    "username": "testuser",
    "uploadedAt": "2023-12-21T10:30:00.000Z",
    "storageType": "local"
  }
}
```

---

## 2. Media Delete API

### Delete Media by ID
```bash
curl -X DELETE "http://localhost:3000/api/media/delete?id=60f7b3b3b3b3b3b3b3b3b3b3"
```

**Response Example:**
```json
{
  "success": true,
  "message": "Media deleted successfully from local storage",
  "data": {
    "deletedMedia": {
      "mediaId": "60f7b3b3b3b3b3b3b3b3b3b3",
      "fileName": "60f7b3b3b3b3b3b3b3b3b3b3_1703123456789_abc123def_image.jpg",
      "filePath": "/absolute/path/to/file",
      "publicUrl": "/uploads/users/60f7b3b3b3b3b3b3b3b3b3b3/images/filename.jpg",
      "resourceType": "image",
      "title": "My Image",
      "uploadedBy": "60f7b3b3b3b3b3b3b3b3b3b3",
      "storageType": "local"
    },
    "deletedAt": "2023-12-21T10:35:00.000Z",
    "deletionStatus": {
      "localStorage": "success",
      "database": "success"
    }
  }
}
```

---

## 3. Profile Picture (DP) Upload API

### Upload Profile Picture
```bash
curl -X POST "http://localhost:3000/api/dp/upload-simple" \
  -H "Content-Type: multipart/form-data" \
  -F "dp=@/path/to/profile-picture.jpg" \
  -F "username=testuser"
```

**Response Example:**
```json
{
  "success": true,
  "message": "Profile picture uploaded successfully to local storage",
  "data": {
    "avatar": "/uploads/users/testuser/profile_pictures/filename.jpg",
    "fileName": "testuser_1703123456789_abc123def_profile-picture.jpg",
    "filePath": "/absolute/path/to/file",
    "width": 400,
    "height": 400,
    "format": "jpg",
    "size": 512000,
    "mimeType": "image/jpeg",
    "uploadedAt": "2023-12-21T10:30:00.000Z",
    "username": "testuser",
    "storageType": "local"
  }
}
```

---

## 4. Files Upload API (Pages API)

### Upload Multiple Files
```bash
curl -X POST "http://localhost:3000/api/files/upload" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/file1.jpg" \
  -F "file=@/path/to/file2.pdf" \
  -F "file=@/path/to/file3.mp4"
```

**Response Example:**
```json
{
  "success": true,
  "message": "Successfully uploaded 3 files",
  "data": {
    "uploadedFiles": [
      {
        "originalName": "file1.jpg",
        "fileName": "60f7b3b3b3b3b3b3b3b3b3b3_1703123456789_abc123def_file1.jpg",
        "filePath": "/absolute/path/to/file1.jpg",
        "publicUrl": "/uploads/users/60f7b3b3b3b3b3b3b3b3b3b3/images/filename.jpg",
        "format": "jpg",
        "size": 1024000,
        "width": 1920,
        "height": 1080,
        "duration": null,
        "mimeType": "image/jpeg",
        "folder": "images",
        "uploadedAt": "2023-12-21T10:30:00.000Z",
        "uploadedBy": {
          "userId": "60f7b3b3b3b3b3b3b3b3b3b3",
          "username": "testuser",
          "fullName": "Test User"
        },
        "storageType": "local"
      }
    ],
    "summary": {
      "total": 3,
      "successful": 3,
      "failed": 0
    }
  }
}
```

---

## 5. Files Delete API (Pages API)

### Delete File by Public URL
```bash
curl -X DELETE "http://localhost:3000/api/files/delete" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "publicUrl": "/uploads/users/60f7b3b3b3b3b3b3b3b3b3b3/images/filename.jpg"
  }'
```

**Response Example:**
```json
{
  "success": true,
  "message": "File deleted successfully from local storage",
  "data": {
    "deletedFile": {
      "publicUrl": "/uploads/users/60f7b3b3b3b3b3b3b3b3b3b3/images/filename.jpg",
      "deletedAt": "2023-12-21T10:35:00.000Z",
      "deletedBy": {
        "userId": "60f7b3b3b3b3b3b3b3b3b3b3",
        "username": "testuser",
        "fullName": "Test User"
      }
    },
    "storageType": "local"
  }
}
```

---

## 6. File Access Examples

### Access Uploaded Files Directly
```bash
# Access image file
curl -X GET "http://localhost:3000/uploads/users/60f7b3b3b3b3b3b3b3b3b3b3/images/filename.jpg"

# Access video file
curl -X GET "http://localhost:3000/uploads/users/60f7b3b3b3b3b3b3b3b3b3b3/videos/filename.mp4"

# Access profile picture
curl -X GET "http://localhost:3000/uploads/users/testuser/profile_pictures/filename.jpg"

# Access document
curl -X GET "http://localhost:3000/uploads/users/60f7b3b3b3b3b3b3b3b3b3b3/documents/filename.pdf"
```

---

## 7. Error Handling Examples

### File Too Large
```bash
curl -X POST "http://localhost:3000/api/media/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/large-file.jpg" \
  -F "type=image" \
  -F "userId=60f7b3b3b3b3b3b3b3b3b3b3"
```

**Error Response:**
```json
{
  "error": "File size too large. Maximum size is 100MB"
}
```

### Invalid File Type
```bash
curl -X POST "http://localhost:3000/api/media/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/file.txt" \
  -F "type=image" \
  -F "userId=60f7b3b3b3b3b3b3b3b3b3b3"
```

**Error Response:**
```json
{
  "error": "Invalid file type for image. Allowed types: image/jpeg, image/jpg, image/png, image/gif, image/webp, image/bmp, image/svg+xml"
}
```

### File Not Found (Delete)
```bash
curl -X DELETE "http://localhost:3000/api/media/delete?id=nonexistent-id"
```

**Error Response:**
```json
{
  "success": false,
  "error": "Media not found",
  "message": "The specified media does not exist"
}
```

---

## 8. Batch Operations

### Upload Multiple Images
```bash
curl -X POST "http://localhost:3000/api/media/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/image1.jpg" \
  -F "file=@/path/to/image2.jpg" \
  -F "file=@/path/to/image3.jpg" \
  -F "type=image" \
  -F "userId=60f7b3b3b3b3b3b3b3b3b3b3"
```

### Delete Multiple Files
```bash
# Delete multiple files by their IDs
curl -X DELETE "http://localhost:3000/api/media/delete?id=60f7b3b3b3b3b3b3b3b3b3b3" && \
curl -X DELETE "http://localhost:3000/api/media/delete?id=60f7b3b3b3b3b3b3b3b3b3b4" && \
curl -X DELETE "http://localhost:3000/api/media/delete?id=60f7b3b3b3b3b3b3b3b3b3b5"
```

---

## 9. Testing Commands

### Test File Upload with Different Types
```bash
# Test image upload
curl -X POST "http://localhost:3000/api/media/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test-image.jpg" \
  -F "type=image" \
  -F "userId=60f7b3b3b3b3b3b3b3b3b3b3"

# Test video upload
curl -X POST "http://localhost:3000/api/media/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test-video.mp4" \
  -F "type=video" \
  -F "userId=60f7b3b3b3b3b3b3b3b3b3b3"

# Test profile picture upload
curl -X POST "http://localhost:3000/api/dp/upload-simple" \
  -H "Content-Type: multipart/form-data" \
  -F "dp=@profile-pic.jpg" \
  -F "username=testuser"
```

### Test File Access
```bash
# Test direct file access
curl -I "http://localhost:3000/uploads/users/60f7b3b3b3b3b3b3b3b3b3b3/images/test-image.jpg"

# Test file deletion
curl -X DELETE "http://localhost:3000/api/media/delete?id=MEDIA_ID_FROM_UPLOAD_RESPONSE"
```

---

## 10. Environment Setup

### Required Environment Variables
```bash
# MongoDB connection (still required)
export MONGODB_URI="mongodb://localhost:27017/your-database"

# JWT Secret (for authentication)
export JWT_SECRET="your-jwt-secret"

# No Cloudinary variables needed anymore!
```

### Optional Environment Variables
```bash
# Server port
export PORT=3000

# Node environment
export NODE_ENV="development"
```

---

## 11. File Size Limits

| API | File Type | Max Size |
|-----|-----------|----------|
| Media Upload | Images/Videos | 100MB |
| DP Upload | Images only | 5MB |
| Files Upload | All types | 100MB |

---

## 12. Supported File Types

### Images
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)
- BMP (.bmp)
- SVG (.svg)

### Videos
- MP4 (.mp4)
- AVI (.avi)
- MOV (.mov)
- WMV (.wmv)
- FLV (.flv)
- WebM (.webm)
- MKV (.mkv)

### Documents
- PDF (.pdf)
- Word (.doc, .docx)
- Text (.txt)

### Audio
- MP3 (.mp3)
- WAV (.wav)
- OGG (.ogg)

---

## 13. Directory Structure

```
public/uploads/users/{userId}/
├── images/          # Image files
├── videos/          # Video files
├── profile_pictures/ # Profile pictures
├── documents/       # PDF, Word, Text files
└── audio/          # Audio files
```

---

## 14. Security Notes

- Users can only access files in their own directory
- File paths are validated to prevent directory traversal
- File types are strictly validated
- File sizes are limited to prevent abuse
- Authentication required for most operations

---

## 15. Performance Tips

- Files are served directly by Next.js (no external API calls)
- Local storage provides faster access than cloud storage
- No bandwidth costs for file serving
- Files are organized by user and type for efficient access

---

## Quick Reference

### Most Common Commands

```bash
# Upload image
curl -X POST "http://localhost:3000/api/media/upload" \
  -F "file=@image.jpg" \
  -F "type=image" \
  -F "userId=USER_ID"

# Upload profile picture
curl -X POST "http://localhost:3000/api/dp/upload-simple" \
  -F "dp=@profile.jpg" \
  -F "username=USERNAME"

# Delete media
curl -X DELETE "http://localhost:3000/api/media/delete?id=MEDIA_ID"

# Access file
curl "http://localhost:3000/uploads/users/USER_ID/images/FILENAME"
```

This comprehensive CURL reference covers all the migrated local storage APIs with examples, error handling, and best practices.

