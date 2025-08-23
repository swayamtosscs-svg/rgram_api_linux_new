# Media Upload API with User-Specific Folders

This API automatically creates user-specific folders in Cloudinary and organizes files by user ID. Each user gets their own folder structure to keep files organized and separate.

## 🚀 **API Endpoints**

### **1. Upload Media (POST)**
```
POST /api/media/upload
```

### **2. Get User Media (GET)**
```
GET /api/media/upload?userId={userId}
```

## ✨ **Key Features**

- 🔐 **User-Specific Folders**: Each user gets their own folder in Cloudinary
- 📁 **Automatic Folder Creation**: Cloudinary automatically creates folders if they don't exist
- 🆔 **User ID Validation**: Validates MongoDB ObjectId format
- 📊 **User Statistics**: Updates user's media count automatically
- 🚫 **Error Handling**: Comprehensive error handling with proper HTTP status codes
- 📱 **File Organization**: Files organized by type (images/videos) within user folders

## 📁 **Cloudinary Folder Structure**

```
users/
├── {userId1}/
│   ├── images/
│   │   ├── file1.jpg
│   │   └── file2.png
│   └── videos/
│       ├── video1.mp4
│       └── video2.avi
└── {userId2}/
    ├── images/
    └── videos/
```

## 📤 **POST - Upload Media**

### **Required Form Data**
- `file` - The media file to upload
- `userId` - MongoDB ObjectId of the user (24 character hex string)
- `type` - Media type: "image" or "video"

### **Optional Form Data**
- `title` - Title for the media
- `description` - Description for the media
- `tags` - JSON array of tags as string

### **Example Request (cURL)**
```bash
curl --location 'https://api-rgram1.vercel.app/api/media/upload' \
  --form 'file=@"path/to/image.jpg"' \
  --form 'userId="507f1f77bcf86cd799439011"' \
  --form 'type="image"' \
  --form 'title="My Image"' \
  --form 'description="Image description"' \
  --form 'tags="[\"tag1\",\"tag2\"]"'
```

### **Example Request (JavaScript)**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('userId', '507f1f77bcf86cd799439011');
formData.append('type', 'image');
formData.append('title', 'My Image');
formData.append('description', 'Image description');
formData.append('tags', JSON.stringify(['tag1', 'tag2']));

const response = await fetch('/api/media/upload', {
  method: 'POST',
  body: formData
});
```

### **Success Response**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "mediaId": "68a597dcc2e25cb6421e936c",
    "publicId": "507f1f77bcf86cd799439011_1703123456789",
    "secureUrl": "https://res.cloudinary.com/dtuxhmf4t/image/upload/v1755682779/users/507f1f77bcf86cd799439011/images/507f1f77bcf86cd799439011_1703123456789.jpg",
    "folderPath": "users/507f1f77bcf86cd799439011/images",
    "fileName": "507f1f77bcf86cd799439011_1703123456789.jpg",
    "fileType": "image",
    "fileSize": 1024000,
    "dimensions": {
      "width": 1920,
      "height": 1080
    },
    "duration": null,
    "uploadedBy": "507f1f77bcf86cd799439011",
    "uploadedAt": "2025-08-20T09:39:40.300Z"
  }
}
```

## 📥 **GET - Retrieve User Media**

### **Query Parameters**
- `userId` (required) - MongoDB ObjectId of the user
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)
- `type` (optional) - Filter by "image" or "video"
- `sortBy` (optional) - Sort field (default: "createdAt")
- `sortOrder` (optional) - "asc" or "desc" (default: "desc")

### **Example Request**
```bash
# Get all user media
curl 'https://api-rgram1.vercel.app/api/media/upload?userId=507f1f77bcf86cd799439011'

# Get user images with pagination
curl 'https://api-rgram1.vercel.app/api/media/upload?userId=507f1f77bcf86cd799439011&page=1&limit=10&type=image&sortBy=createdAt&sortOrder=desc'
```

### **Success Response**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "john_doe",
      "fullName": "John Doe",
      "avatar": "https://example.com/avatar.jpg"
    },
    "media": [
      {
        "publicId": "507f1f77bcf86cd799439011_1703123456789",
        "url": "http://res.cloudinary.com/dtuxhmf4t/image/upload/v1755682779/users/507f1f77bcf86cd799439011/images/507f1f77bcf86cd799439011_1703123456789.jpg",
        "secureUrl": "https://res.cloudinary.com/dtuxhmf4t/image/upload/v1755682779/users/507f1f77bcf86cd799439011/images/507f1f77bcf86cd799439011_1703123456789.jpg",
        "format": "jpg",
        "resourceType": "image",
        "width": 1920,
        "height": 1080,
        "tags": ["tag1", "tag2"],
        "_id": "68a597dcc2e25cb6421e936c",
        "uploadedBy": "507f1f77bcf86cd799439011",
        "createdAt": "2025-08-20T09:39:40.300Z",
        "updatedAt": "2025-08-20T09:39:40.304Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "itemsPerPage": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

## ❌ **Error Responses**

### **400 Bad Request**
```json
{
  "error": "User ID is required"
}
```

```json
{
  "error": "Invalid user ID format"
}
```

```json
{
  "error": "No file provided"
}
```

```json
{
  "error": "Media type is required. Please provide type=image or type=video"
}
```

```json
{
  "error": "Invalid media type. Type must be either \"image\" or \"video\""
}
```

### **404 Not Found**
```json
{
  "error": "User not found"
}
```

### **413 Payload Too Large**
```json
{
  "error": "File too large",
  "details": "Maximum file size exceeded"
}
```

### **500 Internal Server Error**
```json
{
  "error": "Error uploading file",
  "details": "Specific error message"
}
```

## 🔧 **File Requirements**

### **Supported Formats**
- **Images**: JPEG, PNG, GIF, WebP, etc.
- **Videos**: MP4, AVI, MOV, etc.

### **File Size Limits**
- Maximum file size: 100MB (configurable)

### **File Validation**
- Files are validated against the specified type
- Only files with matching MIME types are accepted
- Empty files are rejected

## 🗂️ **Folder Organization**

### **Automatic Folder Creation**
- Cloudinary automatically creates the folder structure
- No need to pre-create folders
- Each user gets their own isolated space

### **File Naming Convention**
- Files are named with pattern: `{userId}_{timestamp}`
- This ensures unique file names across all users
- Example: `507f1f77bcf86cd799439011_1703123456789.jpg`

## 📊 **User Statistics Updates**

The API automatically updates user statistics when media is uploaded:
- **Images**: Increments `postsCount`
- **Videos**: Increments `videosCount`

## 🧪 **Testing**

### **Install Dependencies**
```bash
cd api_rgram1
npm install axios form-data
```

### **Run Tests**
```bash
node test-media-upload.js
```

### **Test with Postman**
1. Create a new POST request to `/api/media/upload`
2. Set body to `form-data`
3. Add all required fields (file, userId, type)
4. Send request and verify response

## 🔐 **Security Features**

- **User ID Validation**: Ensures only valid MongoDB ObjectIds are accepted
- **File Type Validation**: Prevents malicious file uploads
- **User Existence Check**: Verifies user exists before upload
- **Isolated Storage**: Each user's files are completely separate
- **Unique File Names**: Prevents file name conflicts

## 🌐 **Environment Variables**

Make sure these environment variables are set:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
MONGODB_URI=your_mongodb_connection_string
```

## 📱 **Usage Examples**

### **Frontend Integration**
```javascript
// React component example
const uploadFile = async (file, userId) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', userId);
  formData.append('type', 'image');
  
  try {
    const response = await fetch('/api/media/upload', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    if (result.success) {
      console.log('File uploaded to:', result.data.folderPath);
      console.log('Secure URL:', result.data.secureUrl);
    }
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### **Mobile App Integration**
```javascript
// React Native example
const uploadMedia = async (fileUri, userId) => {
  const formData = new FormData();
  formData.append('file', {
    uri: fileUri,
    type: 'image/jpeg',
    name: 'photo.jpg'
  });
  formData.append('userId', userId);
  formData.append('type', 'image');
  
  const response = await fetch('https://api-rgram1.vercel.app/api/media/upload', {
    method: 'POST',
    body: formData
  });
  
  return response.json();
};
```

## 🚀 **Deployment**

This API is ready for deployment on Vercel. The folder structure will be automatically created in Cloudinary for each user, ensuring complete isolation and organization of media files.

## 📞 **Support**

For any issues or questions:
1. Check the error responses for specific error messages
2. Verify your environment variables are set correctly
3. Ensure MongoDB and Cloudinary are accessible
4. Test with the provided test file first
