# Local Storage Replace API Documentation

## 🔄 File Replace API

This API allows you to replace an existing file in local storage with a new file while maintaining the same file structure and organization.

## 🚀 **API Endpoint**

```
PUT /api/local-storage/replace
```

## ✨ **Key Features**

- 🔄 **File Replacement**: Replace existing files with new ones
- 📁 **Automatic Folder Management**: Automatically moves files to correct folders based on type
- 💾 **Backup Creation**: Creates backup of original file before replacement
- 🗑️ **Cleanup**: Removes old files and empty folders
- 🔐 **User Isolation**: Each user can only replace their own files
- 📊 **Detailed Response**: Returns information about both old and new files

## 📋 **Request Parameters**

### **Query Parameters**
- `userId` (required): User ID for file ownership validation
- `targetFilePath` (optional): Full path to the file to be replaced
- `targetFileName` (optional): Name of the file to be replaced
- `targetFolder` (optional): Folder containing the file (required if using targetFileName)

### **Headers**
- `x-user-id` (optional): Alternative way to provide user ID

### **Form Data (multipart/form-data)**
- `file` (required): The new file to replace the existing one

## 📤 **Example Requests**

### **Using cURL**
```bash
# Replace file by full path
curl -X PUT "http://localhost:3000/api/local-storage/replace?userId=user123&targetFilePath=/uploads/user123/images/old_image.jpg" \
  -F "file=@new_image.jpg"

# Replace file by name and folder
curl -X PUT "http://localhost:3000/api/local-storage/replace?userId=user123&targetFileName=old_image.jpg&targetFolder=images" \
  -F "file=@new_image.jpg"

# Using header for user ID
curl -X PUT "http://localhost:3000/api/local-storage/replace?targetFileName=old_image.jpg&targetFolder=images" \
  -H "x-user-id: user123" \
  -F "file=@new_image.jpg"
```

### **Using JavaScript/Fetch**
```javascript
const formData = new FormData();
formData.append('file', newFile);

const response = await fetch('/api/local-storage/replace?userId=user123&targetFileName=old_image.jpg&targetFolder=images', {
  method: 'PUT',
  body: formData
});

const result = await response.json();
console.log(result);
```

### **Using Axios**
```javascript
const formData = new FormData();
formData.append('file', newFile);

const response = await axios.put('/api/local-storage/replace', formData, {
  params: {
    userId: 'user123',
    targetFileName: 'old_image.jpg',
    targetFolder: 'images'
  },
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});
```

## 📥 **Response Format**

### **Success Response (200)**
```json
{
  "success": true,
  "message": "File replaced successfully",
  "data": {
    "replacedFile": {
      "oldFile": {
        "fileName": "user123_1703123456789_abc123def.jpg",
        "filePath": "/path/to/old/file.jpg",
        "publicUrl": "/uploads/user123/images/old_file.jpg",
        "size": 1024000,
        "folder": "images",
        "replacedAt": "2023-12-21T10:30:00.000Z"
      },
      "newFile": {
        "originalName": "new_image.jpg",
        "fileName": "user123_1703123456790_def456ghi.jpg",
        "filePath": "/path/to/new/file.jpg",
        "publicUrl": "/uploads/user123/images/new_file.jpg",
        "size": 2048000,
        "mimetype": "image/jpeg",
        "folder": "images",
        "uploadedAt": "2023-12-21T10:30:01.000Z",
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
      "type": "local",
      "basePath": "/uploads",
      "userPath": "/uploads/user123",
      "newFolder": "images"
    }
  }
}
```

### **Error Responses**

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
  "message": "Target file not found"
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
  "message": "File replacement failed",
  "error": "Detailed error message (development only)"
}
```

## 🔧 **How It Works**

1. **Validation**: Validates user ID and target file parameters
2. **File Check**: Verifies that the target file exists and belongs to the user
3. **Backup**: Creates a backup of the original file
4. **Folder Detection**: Determines the correct folder for the new file based on its type
5. **File Upload**: Uploads the new file to the appropriate location
6. **Cleanup**: Deletes the old file and removes empty folders
7. **Response**: Returns detailed information about the replacement

## 📁 **Folder Structure**

Files are automatically organized into folders based on their type:

```
uploads/
└── {userId}/
    ├── images/          # Image files (jpg, png, gif, etc.)
    ├── videos/          # Video files (mp4, avi, mov, etc.)
    ├── audio/           # Audio files (mp3, wav, aac, etc.)
    ├── documents/       # Document files (pdf, doc, txt, etc.)
    └── general/         # Other file types
```

## 🔒 **Security Features**

- **User Isolation**: Users can only replace their own files
- **Path Validation**: Prevents directory traversal attacks
- **File Type Validation**: Only allows supported file types
- **Size Limits**: Maximum file size of 100MB
- **Backup Creation**: Creates backups before replacement

## 📊 **Supported File Types**

- **Images**: jpg, jpeg, png, gif, webp, svg, bmp
- **Videos**: mp4, avi, mov, wmv, flv, webm, mkv
- **Audio**: mp3, wav, aac, ogg, flac
- **Documents**: pdf, doc, docx, txt
- **General**: Any other file type

## 🚨 **Important Notes**

1. **Backup Files**: Backup files are created with timestamp suffix
2. **Folder Changes**: If file type changes, the file will be moved to the appropriate folder
3. **Empty Folders**: Empty folders are automatically removed after file operations
4. **File Naming**: New files get unique names with timestamp and random string
5. **Atomic Operation**: If replacement fails, the original file is preserved

## 🔍 **Testing the API**

### **Test with Postman**
1. Set method to `PUT`
2. URL: `http://localhost:3000/api/local-storage/replace?userId=testuser&targetFileName=test.jpg&targetFolder=images`
3. Body: Form-data with key `file` and select a file
4. Send request

### **Test with cURL**
```bash
# Create a test file first
echo "test content" > test.txt

# Replace the file
curl -X PUT "http://localhost:3000/api/local-storage/replace?userId=testuser&targetFileName=test.txt&targetFolder=general" \
  -F "file=@test.txt"
```

## 🎯 **Use Cases**

- **Image Updates**: Replace profile pictures, product images
- **Document Updates**: Update PDFs, documents with new versions
- **Media Management**: Replace videos, audio files with better quality versions
- **Content Management**: Update files in content management systems
- **Backup and Restore**: Replace files with backup versions

## 📞 **Support**

If you encounter issues:

1. Check that the target file exists and belongs to the user
2. Verify file type is supported
3. Ensure file size is under 100MB
4. Check user ID format and permissions
5. Review server logs for detailed error messages
