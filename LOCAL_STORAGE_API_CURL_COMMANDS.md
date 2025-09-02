# 📁 Local Storage API - Complete Curl Commands

## 🔐 **User ID Required**
All endpoints require a user ID. You can provide it in two ways:

**Option 1: Query Parameter**
```bash
?userId=YOUR_USER_ID
```

**Option 2: Header**
```bash
x-user-id: YOUR_USER_ID
```

## 🚀 **Complete API Endpoints**

### 1. **Upload Files to Local Storage**
```bash
curl -X POST "http://localhost:3000/api/local-storage/upload?userId=1234" \
  -F "file=@/path/to/image.jpg"
```

**Multiple files upload:**
```bash
curl -X POST "http://localhost:3000/api/local-storage/upload?userId=1234" \
  -F "file=@/path/to/image1.jpg" \
  -F "file=@/path/to/video1.mp4" \
  -F "file=@/path/to/image2.png"
```

**Using header instead of query param:**
```bash
curl -X POST "http://localhost:3000/api/local-storage/upload" \
  -H "x-user-id: 1234" \
  -F "file=@/path/to/image.jpg"
```

**Files will be stored in:**
```
public/uploads/{YOUR_USER_ID}/
├── images/          # Image files
├── videos/          # Video files  
├── audio/           # Audio files
├── documents/       # PDFs, docs, text files
└── general/         # Other file types
```

### 2. **List All User Files**
```bash
curl -X GET "http://localhost:3000/api/local-storage/list?userId=1234"
```

**With pagination:**
```bash
curl -X GET "http://localhost:3000/api/local-storage/list?userId=1234&page=1&limit=20"
```

### 3. **List User's Images Only**
```bash
curl -X GET "http://localhost:3000/api/local-storage/list?userId=1234&folder=images&type=image"
```

### 4. **List User's Videos Only**
```bash
curl -X GET "http://localhost:3000/api/local-storage/list?userId=1234&folder=videos&type=video"
```

### 5. **Search User's Files**
```bash
curl -X GET "http://localhost:3000/api/local-storage/list?userId=1234&search=profile&page=1&limit=10"
```

### 6. **Sort User's Files by Size**
```bash
curl -X GET "http://localhost:3000/api/local-storage/list?userId=1234&sortBy=size&sortOrder=desc&page=1&limit=20"
```

### 7. **Delete Single File (by file path)**
```bash
curl -X DELETE "http://localhost:3000/api/local-storage/delete?userId=1234" \
  -H "Content-Type: application/json" \
  -d '{
    "filePath": "/full/path/to/file.jpg"
  }'
```

### 8. **Delete Single File (by file name and folder)**
```bash
curl -X DELETE "http://localhost:3000/api/local-storage/delete?userId=1234" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "1234_timestamp_random.jpg",
    "folder": "images"
  }'
```

**Using header instead of query param:**
```bash
curl -X DELETE "http://localhost:3000/api/local-storage/delete" \
  -H "x-user-id: 1234" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "1234_timestamp_random.jpg",
    "folder": "images"
  }'
```

## 🧪 **Testing with Your User ID**

Replace `1234` with your actual user ID:

```bash
# Example with your actual user ID
curl -X GET "http://localhost:3000/api/local-storage/list?userId=1234"
```

## 📱 **One-Line Commands for Quick Testing**

### Upload Files:
```bash
curl -s -F "file=@/path/to/file.jpg" "http://localhost:3000/api/local-storage/upload?userId=1234" | jq
```

### List Files:
```bash
curl -s "http://localhost:3000/api/local-storage/list?userId=1234" | jq
```

### Delete File:
```bash
curl -s -X DELETE -H "Content-Type: application/json" -d '{"fileName":"filename.jpg","folder":"images"}' "http://localhost:3000/api/local-storage/delete?userId=1234" | jq
```

## 🔍 **Expected Responses**

### Upload Response:
```json
{
  "success": true,
  "message": "Successfully uploaded 2 files to local storage",
  "data": {
    "uploadedFiles": [
      {
        "originalName": "photo.jpg",
        "fileName": "user_id_timestamp_random.jpg",
        "localPath": "/full/path/to/public/uploads/user_id/images/user_id_timestamp_random.jpg",
        "publicUrl": "/uploads/user_id/images/user_id_timestamp_random.jpg",
        "size": 1024000,
        "mimetype": "image/jpeg",
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
      "total": 2,
      "successful": 2,
      "failed": 0
    },
    "storageInfo": {
      "type": "local",
      "basePath": "/uploads",
      "userPath": "/uploads/user_id"
    }
  }
}
```

### List Response:
```json
{
  "success": true,
  "message": "Files retrieved successfully",
  "data": {
    "files": [
      {
        "fileName": "user_id_timestamp_random.jpg",
        "originalName": "user_id_timestamp_random.jpg",
        "folder": "images",
        "fileType": "image",
        "size": 1024000,
        "publicUrl": "/uploads/user_id/images/user_id_timestamp_random.jpg",
        "localPath": "/full/path/to/file.jpg",
        "uploadedAt": "2025-01-29T...",
        "modifiedAt": "2025-01-29T...",
        "uploadedBy": {
          "userId": "user_id",
          "username": "username",
          "fullName": "Full Name"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25,
      "totalPages": 2,
      "hasNext": true,
      "hasPrev": false
    },
    "filters": {
      "folder": "all",
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
      "type": "local",
      "basePath": "/uploads",
      "userPath": "/uploads/user_id"
    }
  }
}
```

### Delete Response:
```json
{
  "success": true,
  "message": "File deleted successfully",
  "data": {
    "deletedFile": {
      "fileName": "user_id_timestamp_random.jpg",
      "filePath": "/full/path/to/file.jpg",
      "publicUrl": "/uploads/user_id/images/user_id_timestamp_random.jpg",
      "size": 1024000,
      "deletedAt": "2025-01-29T...",
      "deletedBy": {
        "userId": "user_id",
        "username": "username",
        "fullName": "Full Name"
      }
    }
  }
}
```

## 🚀 **Quick Test Script**

```bash
#!/bin/bash
USER_ID="1234"

echo "🧪 Testing Local Storage APIs..."

echo "1️⃣ Testing file upload..."
curl -s -F "file=@/path/to/test.jpg" "http://localhost:3000/api/local-storage/upload?userId=$USER_ID" | jq

echo "2️⃣ Testing file list..."
curl -s "http://localhost:3000/api/local-storage/list?userId=$USER_ID" | jq

echo "3️⃣ Testing file delete..."
curl -s -X DELETE -H "Content-Type: application/json" -d '{"fileName":"test.jpg","folder":"images"}' "http://localhost:3000/api/local-storage/delete?userId=$USER_ID" | jq
```

## 📁 **Local Storage Structure**

Files are stored locally in your project's public folder:

```
public/
└── uploads/
    └── {YOUR_USER_ID}/
        ├── images/          # Image files (jpg, png, gif, etc.)
        ├── videos/          # Video files (mp4, avi, mov, etc.)
        ├── audio/           # Audio files (mp3, wav, aac, etc.)
        ├── documents/       # PDFs, docs, text files
        └── general/         # Other file types
```

## 🔧 **Supported File Types**
- **Images**: jpg, jpeg, png, gif, webp, svg, bmp
- **Videos**: mp4, avi, mov, wmv, flv, webm, mkv
- **Audio**: mp3, wav, aac, ogg, flac
- **Documents**: pdf, doc, docx, txt

## 🔒 **Security Features**

- ✅ **User Isolation**: Each user has their own folder
- ✅ **User ID Validation**: Required for all endpoints
- ✅ **Ownership Verification**: Users can only access their own files
- ✅ **Path Validation**: Files must be in user's designated folder
- ✅ **Local Storage**: Files stored on your server, not external services

## 🎯 **Key Benefits**

1. **Complete Local Control**: Files stored on your server
2. **No External Dependencies**: No need for Cloudinary or other services
3. **User Isolation**: Each user's files are completely separate
4. **Easy Management**: Clear folder structure for each user
5. **Cost Effective**: No external storage costs
6. **Fast Access**: Direct file serving from your server

## 📝 **Query Parameters for List API**

- `folder` (optional): Filter by folder (images, videos, audio, documents, general, all)
- `type` (optional): Filter by file type (image, video, audio, document, general, all)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `search` (optional): Search term for file names
- `sortBy` (optional): Sort field (uploadedAt, size, fileName)
- `sortOrder` (optional): Sort order (asc, desc)

---

**Your local storage file management system is now ready! 🚀**

**Features**: ✅ Local Storage ✅ User Isolation ✅ Secure ✅ Organized ✅ Cost Effective ✅ No External Dependencies
