# Assets API Documentation

## 🎯 **Overview**

The Assets API provides a complete solution for managing media files (images, videos, audio, documents) in your application. All files are stored in the `public/assets` folder, making them directly accessible via URLs. This API is perfect for post uploads, media management, and content creation.

## 🚀 **API Endpoints**

### **1. Upload Assets**
```
POST /api/assets/upload
```

### **2. List/Retrieve Assets**
```
GET /api/assets/list
```

### **3. Delete Assets**
```
DELETE /api/assets/delete
```

### **4. Replace Assets**
```
PUT /api/assets/replace
```

## ✨ **Key Features**

- 📁 **Organized Storage**: Files are automatically organized by type (images, videos, audio, documents, general)
- 🔐 **User Isolation**: Each user has their own folder structure
- 🌐 **Direct Access**: Files are stored in `public/assets` for direct URL access
- 💾 **Backup Support**: Replace operations create backups
- 🗑️ **Smart Cleanup**: Automatically removes empty folders
- 📊 **Detailed Responses**: Comprehensive file information and statistics
- 🔍 **Advanced Filtering**: Filter by folder, type, search terms
- 📄 **Pagination**: Handle large numbers of files efficiently

## 📁 **Folder Structure**

```
public/assets/
└── {userId}/
    ├── images/          # Image files (jpg, png, gif, webp, avif, etc.)
    ├── videos/          # Video files (mp4, avi, mov, webm, etc.)
    ├── audio/           # Audio files (mp3, wav, aac, ogg, etc.)
    ├── documents/       # Document files (pdf, doc, docx, txt, etc.)
    └── general/         # Other file types
```

## 📤 **1. Upload Assets API**

### **Request**
```bash
curl -X POST "http://localhost:3000/api/assets/upload?userId=user123" \
  -F "file=@image.jpg"
```

### **Response**
```json
{
  "success": true,
  "message": "Successfully uploaded 1 files to assets storage",
  "data": {
    "uploadedFiles": [
      {
        "originalName": "image.jpg",
        "fileName": "user123_1703123456789_abc123def.jpg",
        "localPath": "/path/to/file.jpg",
        "publicUrl": "/assets/user123/images/user123_1703123456789_abc123def.jpg",
        "size": 1024000,
        "mimetype": "image/jpeg",
        "folder": "images",
        "uploadedAt": "2023-12-21T10:30:00.000Z",
        "uploadedBy": {
          "userId": "user123",
          "username": "user123",
          "fullName": "user123"
        }
      }
    ],
    "summary": {
      "total": 1,
      "successful": 1,
      "failed": 0
    },
    "storageInfo": {
      "type": "assets",
      "basePath": "/assets",
      "userPath": "/assets/user123"
    }
  }
}
```

## 📋 **2. List Assets API**

### **Request**
```bash
curl -X GET "http://localhost:3000/api/assets/list?userId=user123&folder=images&page=1&limit=10"
```

### **Query Parameters**
- `userId` (required): User ID
- `folder` (optional): Filter by folder (images, videos, audio, documents, general, all)
- `type` (optional): Filter by file type (image, video, audio, document, general, all)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `search` (optional): Search term
- `sortBy` (optional): Sort by (uploadedAt, fileName, size)
- `sortOrder` (optional): Sort order (asc, desc)

### **Response**
```json
{
  "success": true,
  "message": "Assets retrieved successfully",
  "data": {
    "files": [
      {
        "fileName": "user123_1703123456789_abc123def.jpg",
        "originalName": "user123_1703123456789_abc123def.jpg",
        "folder": "images",
        "fileType": "image",
        "size": 1024000,
        "publicUrl": "/assets/user123/images/user123_1703123456789_abc123def.jpg",
        "localPath": "/path/to/file.jpg",
        "uploadedAt": "2023-12-21T10:30:00.000Z",
        "modifiedAt": "2023-12-21T10:30:00.000Z",
        "uploadedBy": {
          "userId": "user123",
          "username": "user123",
          "fullName": "user123"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    },
    "filters": {
      "folder": "images",
      "type": "all",
      "search": "",
      "sortBy": "uploadedAt",
      "sortOrder": "desc"
    },
    "statistics": {
      "folderStats": {
        "images": 15,
        "videos": 5,
        "audio": 2,
        "documents": 3,
        "general": 0,
        "total": 25
      },
      "totalSize": 52428800,
      "totalSizeMB": 50.0
    },
    "storageInfo": {
      "type": "assets",
      "basePath": "/assets",
      "userPath": "/assets/user123"
    }
  }
}
```

## 🗑️ **3. Delete Assets API**

### **Request**
```bash
curl -X DELETE "http://localhost:3000/api/assets/delete?userId=user123" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "user123_1703123456789_abc123def.jpg",
    "folder": "images"
  }'
```

### **Request Body**
```json
{
  "fileName": "user123_1703123456789_abc123def.jpg",
  "folder": "images"
}
```

### **Response**
```json
{
  "success": true,
  "message": "Asset deleted successfully",
  "data": {
    "deletedFile": {
      "fileName": "user123_1703123456789_abc123def.jpg",
      "filePath": "/path/to/file.jpg",
      "publicUrl": "/assets/user123/images/user123_1703123456789_abc123def.jpg",
      "size": 1024000,
      "deletedAt": "2023-12-21T10:35:00.000Z",
      "deletedBy": {
        "userId": "user123",
        "username": "user123",
        "fullName": "user123"
      }
    }
  }
}
```

## 🔄 **4. Replace Assets API**

### **Request**
```bash
curl -X PUT "http://localhost:3000/api/assets/replace?userId=user123&targetFileName=old_image.jpg&targetFolder=images" \
  -F "file=@new_image.jpg"
```

### **Response**
```json
{
  "success": true,
  "message": "Asset replaced successfully",
  "data": {
    "replacedFile": {
      "oldFile": {
        "fileName": "user123_1703123456789_abc123def.jpg",
        "filePath": "/path/to/old/file.jpg",
        "publicUrl": "/assets/user123/images/old_file.jpg",
        "size": 1024000,
        "folder": "images",
        "replacedAt": "2023-12-21T10:40:00.000Z"
      },
      "newFile": {
        "originalName": "new_image.jpg",
        "fileName": "user123_1703123456790_def456ghi.jpg",
        "filePath": "/path/to/new/file.jpg",
        "publicUrl": "/assets/user123/images/new_file.jpg",
        "size": 2048000,
        "mimetype": "image/jpeg",
        "folder": "images",
        "uploadedAt": "2023-12-21T10:40:01.000Z",
        "uploadedBy": {
          "userId": "user123",
          "username": "user123",
          "fullName": "user123"
        }
      },
      "backup": {
        "backupPath": "/path/to/backup/file.jpg.backup.1703123456790",
        "backupCreated": true
      }
    },
    "storageInfo": {
      "type": "assets",
      "basePath": "/assets",
      "userPath": "/assets/user123",
      "newFolder": "images"
    }
  }
}
```

## 🔒 **Security Features**

- **User Isolation**: Users can only access their own files
- **Path Validation**: Prevents directory traversal attacks
- **File Type Validation**: Only allows supported file types
- **Size Limits**: Maximum file size of 100MB
- **Backup Creation**: Creates backups before replacement

## 📊 **Supported File Types**

### **Images**
- jpg, jpeg, png, gif, webp, svg, bmp, avif

### **Videos**
- mp4, avi, mov, wmv, flv, webm, mkv

### **Audio**
- mp3, wav, aac, ogg, flac

### **Documents**
- pdf, doc, docx, txt

### **General**
- Any other file type

## 🎯 **Use Cases**

### **Post Upload System**
```javascript
// Upload image for post
const formData = new FormData();
formData.append('file', imageFile);

const response = await fetch('/api/assets/upload?userId=user123', {
  method: 'POST',
  body: formData
});

const result = await response.json();
const imageUrl = result.data.uploadedFiles[0].publicUrl;
// Use imageUrl in your post: http://localhost:3000/assets/user123/images/filename.jpg
```

### **Media Gallery**
```javascript
// Get all user images
const response = await fetch('/api/assets/list?userId=user123&folder=images');
const result = await response.json();
const images = result.data.files;
```

### **Profile Picture Update**
```javascript
// Replace profile picture
const formData = new FormData();
formData.append('file', newProfilePic);

const response = await fetch('/api/assets/replace?userId=user123&targetFileName=old_profile.jpg&targetFolder=images', {
  method: 'PUT',
  body: formData
});
```

## 🔍 **Testing Examples**

### **Upload Test**
```bash
# Upload an image
curl -X POST "http://localhost:3000/api/assets/upload?userId=testuser" \
  -F "file=@test-image.jpg"

# Upload multiple files
curl -X POST "http://localhost:3000/api/assets/upload?userId=testuser" \
  -F "file=@image1.jpg" \
  -F "file=@video1.mp4" \
  -F "file=@document1.pdf"
```

### **List Test**
```bash
# Get all files
curl -X GET "http://localhost:3000/api/assets/list?userId=testuser"

# Get only images
curl -X GET "http://localhost:3000/api/assets/list?userId=testuser&folder=images"

# Search files
curl -X GET "http://localhost:3000/api/assets/list?userId=testuser&search=profile"
```

### **Delete Test**
```bash
curl -X DELETE "http://localhost:3000/api/assets/delete?userId=testuser" \
  -H "Content-Type: application/json" \
  -d '{"fileName": "testuser_1703123456789_abc123def.jpg", "folder": "images"}'
```

### **Replace Test**
```bash
curl -X PUT "http://localhost:3000/api/assets/replace?userId=testuser&targetFileName=old_image.jpg&targetFolder=images" \
  -F "file=@new_image.jpg"
```

## 📞 **Error Handling**

### **Common Error Responses**

#### **400 - Bad Request**
```json
{
  "success": false,
  "message": "User ID is required. Provide userId in query params or x-user-id header"
}
```

#### **403 - Forbidden**
```json
{
  "success": false,
  "message": "Access denied: File does not belong to user"
}
```

#### **404 - Not Found**
```json
{
  "success": false,
  "message": "File not found"
}
```

#### **405 - Method Not Allowed**
```json
{
  "success": false,
  "message": "Method not allowed"
}
```

#### **500 - Internal Server Error**
```json
{
  "success": false,
  "message": "Assets file upload failed",
  "error": "Detailed error message (development only)"
}
```

## 🚨 **Important Notes**

1. **Direct URL Access**: Files are accessible via `http://localhost:3000/assets/{userId}/{folder}/{filename}`
2. **Unique Filenames**: All files get unique names with timestamp and random string
3. **Automatic Cleanup**: Empty folders are automatically removed
4. **Backup Files**: Replace operations create timestamped backups
5. **File Size Limit**: Maximum 100MB per file
6. **User Isolation**: Each user can only access their own files

## 🔧 **Integration Examples**

### **React Component**
```jsx
import React, { useState } from 'react';

const MediaUpload = ({ userId }) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`/api/assets/upload?userId=${userId}`, {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      if (result.success) {
        const fileUrl = result.data.uploadedFiles[0].publicUrl;
        console.log('File uploaded:', fileUrl);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        onChange={(e) => handleUpload(e.target.files[0])}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
    </div>
  );
};
```

### **Next.js API Route Usage**
```javascript
// pages/api/posts/create.js
export default async function handler(req, res) {
  // Upload media first
  const mediaResponse = await fetch(`${process.env.BASE_URL}/api/assets/upload?userId=${req.body.userId}`, {
    method: 'POST',
    body: req.body.mediaFormData
  });
  
  const mediaResult = await mediaResponse.json();
  const mediaUrl = mediaResult.data.uploadedFiles[0].publicUrl;
  
  // Create post with media URL
  const post = {
    content: req.body.content,
    mediaUrl: mediaUrl,
    userId: req.body.userId
  };
  
  // Save post to database...
}
```

## 📞 **Support**

If you encounter issues:

1. Check that the user ID is valid and provided
2. Verify file type is supported
3. Ensure file size is under 100MB
4. Check file permissions and folder structure
5. Review server logs for detailed error messages
6. Ensure the `public/assets` folder exists and is writable
