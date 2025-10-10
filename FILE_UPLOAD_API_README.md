# 📁 File Upload API Documentation

Complete file management system with Cloudinary integration for RGram API.

## 🚀 **API Endpoints**

### 1. **Upload Files**
```
POST /api/files/upload
Authorization: Bearer JWT_TOKEN
Content-Type: multipart/form-data
```

**Features:**
- ✅ Multiple file upload support
- ✅ Automatic file type detection and folder organization
- ✅ 100MB max file size per file
- ✅ Secure authentication required
- ✅ Cloudinary integration with organized folders

**Supported File Types:**
- **Images**: jpg, jpeg, png, gif, webp, svg
- **Videos**: mp4, avi, mov, wmv, flv, webm
- **Audio**: mp3, wav, aac, ogg, flac
- **Documents**: pdf, doc, docx, txt
- **Other**: Any file type supported by Cloudinary

**Request Body:**
```form-data
file: [file1, file2, file3, ...]
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully uploaded 3 files",
  "data": {
    "uploadedFiles": [
      {
        "originalName": "photo.jpg",
        "fileName": "generated_name.jpg",
        "publicId": "rgram/images/user_id_timestamp_random",
        "url": "https://res.cloudinary.com/...",
        "format": "jpg",
        "size": 1024000,
        "width": 1920,
        "height": 1080,
        "resourceType": "image",
        "folder": "images",
        "uploadedAt": "2025-01-29T...",
        "uploadedBy": {
          "userId": "user_id",
          "username": "username",
          "fullName": "Full Name"
        }
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

### 2. **List/Retrieve Files**
```
GET /api/files/list
Authorization: Bearer JWT_TOKEN
```

**Query Parameters:**
- `folder` (optional): Filter by folder (images, videos, audio, documents, general, all)
- `type` (optional): Filter by resource type (image, video, audio, raw, all)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `search` (optional): Search in file context/metadata
- `sortBy` (optional): Sort field (created_at, public_id, bytes, width, height)
- `sortOrder` (optional): Sort direction (asc, desc)

**Example Requests:**
```bash
# Get all files
GET /api/files/list

# Get only images
GET /api/files/list?folder=images&type=image

# Search for specific files
GET /api/files/list?search=profile&page=1&limit=10

# Sort by size descending
GET /api/files/list?sortBy=bytes&sortOrder=desc
```

**Response:**
```json
{
  "success": true,
  "message": "Files retrieved successfully",
  "data": {
    "files": [
      {
        "id": "rgram/images/user_id_timestamp_random",
        "url": "https://res.cloudinary.com/...",
        "format": "jpg",
        "size": 1024000,
        "width": 1920,
        "height": 1080,
        "duration": null,
        "resourceType": "image",
        "folder": "rgram/images",
        "uploadedAt": "2025-01-29T...",
        "tags": ["rgram", "user_id"],
        "context": {
          "uploaded_by": "user_id",
          "username": "username",
          "upload_date": "2025-01-29T..."
        },
        "thumbnail": "https://res.cloudinary.com/...",
        "preview": "https://res.cloudinary.com/..."
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8,
      "hasNext": true,
      "hasPrev": false
    },
    "filters": {
      "folder": "all",
      "type": "all",
      "search": "",
      "sortBy": "created_at",
      "sortOrder": "desc"
    }
  }
}
```

### 3. **Delete Single File**
```
DELETE /api/files/delete
Authorization: Bearer JWT_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "publicId": "rgram/images/user_id_timestamp_random",
  "resourceType": "image"
}
```

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully",
  "data": {
    "deletedFile": {
      "publicId": "rgram/images/user_id_timestamp_random",
      "resourceType": "image",
      "deletedAt": "2025-01-29T...",
      "deletedBy": {
        "userId": "user_id",
        "username": "username",
        "fullName": "Full Name"
      }
    },
    "cloudinaryResult": {
      "result": "ok"
    }
  }
}
```

### 4. **Bulk Delete Files**
```
DELETE /api/files/bulk-delete
Authorization: Bearer JWT_TOKEN
Content-Type: application/json
```

### 5. **Get User File Statistics**
```
GET /api/files/stats
Authorization: Bearer JWT_TOKEN
```

**Request Body:**
```json
{
  "files": [
    {
      "publicId": "rgram/images/file1",
      "resourceType": "image"
    },
    {
      "publicId": "rgram/videos/file2",
      "resourceType": "video"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk deletion completed. 2 successful, 0 failed.",
  "data": {
    "summary": {
      "total": 2,
      "successful": 2,
      "failed": 0
    },
    "successful": [
      {
        "publicId": "rgram/images/file1",
        "resourceType": "image",
        "deletedAt": "2025-01-29T...",
        "cloudinaryResult": { "result": "ok" }
      }
    ],
    "deletedBy": {
      "userId": "user_id",
      "username": "username",
      "fullName": "Full Name"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "User file statistics retrieved successfully",
  "data": {
    "user": {
      "userId": "689c463f3b52aad73e878d1f",
      "username": "username",
      "fullName": "Full Name"
    },
    "statistics": {
      "totalFiles": 25,
      "totalSize": 52428800,
      "totalSizeMB": 50.0,
      "fileTypes": {
        "image": 15,
        "video": 5,
        "document": 5
      },
      "folders": {
        "images": 15,
        "videos": 5,
        "documents": 5
      }
    },
    "storage": {
      "used": 52428800,
      "usedMB": 50.0,
      "limit": 10737418240,
      "limitMB": 10240,
      "percentage": 0.5
    },
    "recentUploads": [
      {
        "id": "rgram/users/689c463f3b52aad73e878d1f/images/file1",
        "url": "https://res.cloudinary.com/...",
        "format": "jpg",
        "size": 1024000,
        "folder": "images",
        "uploadedAt": "2025-01-29T..."
      }
    ],
    "folderStructure": "rgram/users/689c463f3b52aad73e878d1f/"
  }
}
```

## 🔐 **Authentication**

All endpoints require a valid JWT token in the Authorization header:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📁 **Folder Structure**

Files are automatically organized in Cloudinary by user ID:

```
rgram/
└── users/
    └── {USER_ID}/
        ├── images/          # User's image files
        ├── videos/          # User's video files
        ├── audio/           # User's audio files
        ├── documents/       # User's PDFs, docs, text files
        └── general/         # User's other file types
```

**Example for user ID `689c463f3b52aad73e878d1f`:**
```
rgram/users/689c463f3b52aad73e878d1f/
├── images/
│   ├── profile.jpg
│   └── cover.png
├── videos/
│   └── intro.mp4
└── documents/
    └── resume.pdf
```

## 🧪 **Testing with Curl**

### Upload Files:
```bash
curl -X POST "https://api-rgram1.vercel.app/api/files/upload" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/file1.jpg" \
  -F "file=@/path/to/file2.pdf"
```

### List Files:
```bash
curl -X GET "https://api-rgram1.vercel.app/api/files/list?folder=images&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Delete File:
```bash
curl -X DELETE "https://api-rgram1.vercel.app/api/files/delete" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "publicId": "rgram/images/file_id",
    "resourceType": "image"
  }'
```

### Bulk Delete:
```bash
curl -X DELETE "https://api-rgram1.vercel.app/api/files/bulk-delete" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "files": [
      {"publicId": "rgram/users/YOUR_USER_ID/images/file1", "resourceType": "image"},
      {"publicId": "rgram/users/YOUR_USER_ID/videos/file2", "resourceType": "video"}
    ]
  }'
```

### Get User File Statistics:
```bash
curl -X GET "https://api-rgram1.vercel.app/api/files/stats" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔧 **Environment Variables Required**

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 📱 **Frontend Integration Examples**

### React Hook for File Upload:
```tsx
const useFileUpload = (token: string) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFiles = async (files: File[]) => {
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    files.forEach(file => formData.append('file', file));

    try {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();
      return result;
    } catch (error) {
      throw error;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return { uploadFiles, uploading, progress };
};
```

### React Hook for File List:
```tsx
const useFileList = (token: string, filters = {}) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});

  const fetchFiles = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        ...filters
      });

      const response = await fetch(`/api/files/list?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setFiles(data.data.files);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  return { files, loading, pagination, fetchFiles };
};
```

## 🚨 **Error Handling**

### Common Error Responses:

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "You can only delete your own files"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "File not found"
}
```

**413 Payload Too Large:**
```json
{
  "success": false,
  "message": "File size exceeds limit"
}
```

## 💡 **Best Practices**

1. **File Size Limits**: Keep files under 100MB for optimal performance
2. **File Types**: Use appropriate file formats for your use case
3. **Bulk Operations**: Use bulk delete for multiple files (max 50 at once)
4. **Pagination**: Always implement pagination for large file lists
5. **Error Handling**: Implement proper error handling for failed uploads
6. **Security**: Always verify file ownership before deletion

## 🔗 **Quick Links**

- **Base URL**: https://api-rgram1.vercel.app
- **Upload**: `/api/files/upload`
- **List**: `/api/files/list`
- **Stats**: `/api/files/stats`
- **Delete**: `/api/files/delete`
- **Bulk Delete**: `/api/files/bulk-delete`

---

**Your file management system is now complete with Cloudinary integration! 🎉**
