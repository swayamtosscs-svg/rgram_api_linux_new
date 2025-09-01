# 📁 File Management API - Complete Curl Commands

## 🔐 **Authentication Required**
All endpoints require a valid JWT token from Google OAuth:

```bash
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

## 🚀 **Complete API Endpoints**

### 1. **Upload Files (User ID Based)**
```bash
curl -X POST "https://api-rgram1.vercel.app/api/files/upload" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/file1.jpg" \
  -F "file=@/path/to/file2.pdf"
```

**Single file upload:**
```bash
curl -X POST "https://api-rgram1.vercel.app/api/files/upload" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/image.jpg"
```

**Files will be organized as:**
```
rgram/users/YOUR_USER_ID/images/file.jpg
rgram/users/YOUR_USER_ID/documents/file.pdf
```

### 2. **List All User Files**
```bash
curl -X GET "https://api-rgram1.vercel.app/api/files/list" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**With pagination:**
```bash
curl -X GET "https://api-rgram1.vercel.app/api/files/list?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. **List User's Images Only**
```bash
curl -X GET "https://api-rgram1.vercel.app/api/files/list?folder=images&type=image" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. **List User's Videos Only**
```bash
curl -X GET "https://api-rgram1.vercel.app/api/files/list?folder=videos&type=video" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. **Search User's Files**
```bash
curl -X GET "https://api-rgram1.vercel.app/api/files/list?search=profile&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. **Sort User's Files by Size**
```bash
curl -X GET "https://api-rgram1.vercel.app/api/files/list?sortBy=bytes&sortOrder=desc&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 7. **Get User File Statistics**
```bash
curl -X GET "https://api-rgram1.vercel.app/api/files/stats" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 8. **Delete Single File**
```bash
curl -X DELETE "https://api-rgram1.vercel.app/api/files/delete" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "publicId": "rgram/users/YOUR_USER_ID/images/file_id",
    "resourceType": "image"
  }'
```

### 9. **Bulk Delete User's Files**
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

## 🧪 **Testing with Your Actual JWT Token**

Replace `YOUR_JWT_TOKEN` with your actual token:

```bash
# Example with your actual token
curl -X GET "https://api-rgram1.vercel.app/api/files/stats" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODljNDYzZjNiNTJhYWQ3M2U4NzhkMWYiLCJpYXQiOjE3NTY1MzM3NTksImV4cCI6MTc1OTEyNTc1OX0.JYwM9v-Pk6Rk55sB6qEHehldcr-rtAb0y3zt_NNFRW8"
```

## 📱 **One-Line Commands for Quick Testing**

### Upload Files:
```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" -F "file=@/path/to/file.jpg" "https://api-rgram1.vercel.app/api/files/upload" | jq
```

### List Files:
```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" "https://api-rgram1.vercel.app/api/files/list" | jq
```

### Get Stats:
```bash
curl -s -H "Authorization: Bearer YOUR_TOKEN" "https://api-rgram1.vercel.app/api/files/stats" | jq
```

### Delete File:
```bash
curl -s -X DELETE -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d '{"publicId":"rgram/users/YOUR_USER_ID/images/file_id","resourceType":"image"}' "https://api-rgram1.vercel.app/api/files/delete" | jq
```

## 🔍 **Expected Responses**

### Upload Response:
```json
{
  "success": true,
  "message": "Successfully uploaded 2 files",
  "data": {
    "uploadedFiles": [
      {
        "originalName": "photo.jpg",
        "publicId": "rgram/users/689c463f3b52aad73e878d1f/images/user_id_timestamp_random",
        "url": "https://res.cloudinary.com/...",
        "format": "jpg",
        "size": 1024000,
        "folder": "images"
      }
    ],
    "summary": {
      "total": 2,
      "successful": 2,
      "failed": 0
    }
  }
}
```

### Stats Response:
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
      "totalSizeMB": 50.0,
      "fileTypes": {
        "image": 15,
        "video": 5,
        "document": 5
      }
    },
    "storage": {
      "usedMB": 50.0,
      "limitMB": 10240,
      "percentage": 0.5
    },
    "folderStructure": "rgram/users/689c463f3b52aad73e878d1f/"
  }
}
```

## 🚀 **Quick Test Script**

```bash
#!/bin/bash
TOKEN="YOUR_JWT_TOKEN_HERE"

echo "🧪 Testing User ID Based File APIs..."

echo "1️⃣ Testing file stats..."
curl -s -H "Authorization: Bearer $TOKEN" "https://api-rgram1.vercel.app/api/files/stats" | jq

echo "2️⃣ Testing file list..."
curl -s -H "Authorization: Bearer $TOKEN" "https://api-rgram1.vercel.app/api/files/list" | jq

echo "3️⃣ Testing file upload..."
curl -s -H "Authorization: Bearer $TOKEN" -F "file=@/path/to/test.jpg" "https://api-rgram1.vercel.app/api/files/upload" | jq
```

## 📁 **New Folder Structure**

Files are now organized by user ID:

```
rgram/
└── users/
    └── {YOUR_USER_ID}/
        ├── images/          # Your image files
        ├── videos/          # Your video files
        ├── audio/           # Your audio files
        ├── documents/       # Your PDFs, docs, text files
        └── general/         # Your other file types
```

## 🔒 **Security Features**

- ✅ **User Isolation**: Each user has their own folder
- ✅ **JWT Authentication**: Required for all endpoints
- ✅ **Ownership Verification**: Users can only access their own files
- ✅ **Folder Validation**: Files must be in user's designated folder
- ✅ **Tag Verification**: Files must have user-specific tags

## 🎯 **Key Benefits**

1. **Complete User Isolation**: Each user's files are completely separate
2. **Easy Management**: Clear folder structure for each user
3. **Security**: Users can only access their own files
4. **Scalability**: Easy to manage storage per user
5. **Organization**: Automatic categorization by file type

---

**Your user ID-based file management system is now ready! 🚀**

**Features**: ✅ User Isolation ✅ Secure ✅ Organized ✅ Scalable ✅ Cloud-Native
