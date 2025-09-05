# Images API - Local Storage Implementation

A comprehensive image upload, delete, and retrieve API that stores images locally in the `public/assets` folder, organized by username. This API is designed to work with both local development and Ubuntu server deployment.

## 🚀 Features

- **Local Storage**: Images stored in `public/assets/{username}/images/` directory
- **Username-based Organization**: Each user has their own folder structure
- **MongoDB Integration**: Image metadata stored in MongoDB
- **Ubuntu Server Compatible**: Works with IP `103.14.120.163`
- **File Validation**: Image type and size validation
- **Pagination Support**: Efficient data retrieval with pagination
- **Search & Filter**: Advanced search capabilities
- **Error Handling**: Comprehensive error handling and logging

## 📁 Directory Structure

```
public/
└── assets/
    └── {username}/
        └── images/
            ├── username_timestamp_random.jpg
            ├── username_timestamp_random.png
            └── ...
```

## 🔧 API Endpoints

### 1. Upload Image
**POST** `/api/images/upload`

Upload an image file for a specific user.

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `file`: Image file (required)
  - `username`: Username (required)
  - `title`: Image title (optional)
  - `description`: Image description (optional)
  - `tags`: JSON string array of tags (optional)

**Response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "imageId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "fileName": "john_1757051425821_abc123.jpg",
    "originalName": "my-photo.jpg",
    "filePath": "/assets/john/images/john_1757051425821_abc123.jpg",
    "fullUrl": "http://103.14.120.163:3000/assets/john/images/john_1757051425821_abc123.jpg",
    "fileSize": 1024000,
    "mimeType": "image/jpeg",
    "uploadedBy": "64f8a1b2c3d4e5f6a7b8c9d1",
    "username": "john",
    "title": "My Photo",
    "description": "A beautiful sunset",
    "tags": ["sunset", "nature"],
    "uploadedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Retrieve Images
**GET** `/api/images/retrieve`

Get images for a specific user or all images.

**Query Parameters:**
- `username`: Username to get images for
- `id`: Specific image ID
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sortBy`: Sort field (default: createdAt)
- `sortOrder`: Sort order - asc/desc (default: desc)

**Examples:**
```
GET /api/images/retrieve?username=john
GET /api/images/retrieve?username=john&page=2&limit=5
GET /api/images/retrieve?id=64f8a1b2c3d4e5f6a7b8c9d0
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "64f8a1b2c3d4e5f6a7b8c9d1",
      "username": "john",
      "fullName": "John Doe",
      "avatar": "",
      "postsCount": 15
    },
    "images": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
        "fileName": "john_1757051425821_abc123.jpg",
        "originalName": "my-photo.jpg",
        "filePath": "/assets/john/images/john_1757051425821_abc123.jpg",
        "fullUrl": "http://103.14.120.163:3000/assets/john/images/john_1757051425821_abc123.jpg",
        "fileSize": 1024000,
        "mimeType": "image/jpeg",
        "username": "john",
        "title": "My Photo",
        "description": "A beautiful sunset",
        "tags": ["sunset", "nature"],
        "createdAt": "2024-01-15T10:30:00.000Z"
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

### 3. Delete Image
**DELETE** `/api/images/delete`

Delete a specific image.

**Query Parameters:**
- `id`: Image ID (required)
- `username`: Username for ownership verification (optional)

**Example:**
```
DELETE /api/images/delete?id=64f8a1b2c3d4e5f6a7b8c9d0&username=john
```

**Response:**
```json
{
  "success": true,
  "message": "Image deleted successfully",
  "data": {
    "deletedImage": {
      "imageId": "64f8a1b2c3d4e5f6a7b8c9d0",
      "fileName": "john_1757051425821_abc123.jpg",
      "originalName": "my-photo.jpg",
      "filePath": "/assets/john/images/john_1757051425821_abc123.jpg",
      "fullUrl": "http://103.14.120.163:3000/assets/john/images/john_1757051425821_abc123.jpg",
      "username": "john",
      "uploadedBy": "64f8a1b2c3d4e5f6a7b8c9d1"
    },
    "deletedAt": "2024-01-15T11:00:00.000Z",
    "deletionStatus": {
      "storage": "success",
      "database": "success"
    }
  }
}
```

### 4. Advanced Search
**POST** `/api/images/retrieve`

Search images with advanced filters.

**Request Body:**
```json
{
  "username": "john",
  "tags": ["sunset", "nature"],
  "mimeType": "image/jpeg",
  "minSize": 100000,
  "maxSize": 5000000,
  "dateFrom": "2024-01-01",
  "dateTo": "2024-01-31",
  "page": 1,
  "limit": 10,
  "sortBy": "createdAt",
  "sortOrder": "desc"
}
```

### 5. Statistics
**GET** `/api/images?stats=true`

Get overall statistics about images.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalImages": 150,
    "totalUsers": 25,
    "recentUploads": 12,
    "imagesByType": [
      { "_id": "image/jpeg", "count": 100 },
      { "_id": "image/png", "count": 30 },
      { "_id": "image/webp", "count": 20 }
    ],
    "topUsers": [
      { "_id": "john", "imageCount": 25 },
      { "_id": "jane", "imageCount": 20 }
    ]
  }
}
```

## 🛠️ Setup Instructions

### 1. Environment Variables
Make sure you have the following environment variables set:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
NEXT_PUBLIC_BASE_URL=http://103.14.120.163:3000
```

### 2. MongoDB Configuration
- Use MongoDB Atlas with IP whitelist `0.0.0.0/0` for Ubuntu server access
- Ensure your cluster allows connections from your Ubuntu server IP

### 3. Ubuntu Server Setup
- Ensure the `public/assets` directory is writable
- Set proper permissions: `chmod 755 public/assets`
- Make sure Next.js can create subdirectories

### 4. File Permissions
```bash
# Create assets directory
mkdir -p public/assets
chmod 755 public/assets

# Ensure Next.js can write to it
chown -R www-data:www-data public/assets
```

## 📝 Usage Examples

### Upload Image with cURL
```bash
curl -X POST http://103.14.120.163:3000/api/images/upload \
  -F "file=@/path/to/image.jpg" \
  -F "username=john" \
  -F "title=My Photo" \
  -F "description=A beautiful sunset" \
  -F "tags=[\"sunset\", \"nature\"]"
```

### Upload Image with JavaScript
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('username', 'john');
formData.append('title', 'My Photo');
formData.append('description', 'A beautiful sunset');
formData.append('tags', JSON.stringify(['sunset', 'nature']));

const response = await fetch('http://103.14.120.163:3000/api/images/upload', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result);
```

### Retrieve Images
```javascript
const response = await fetch('http://103.14.120.163:3000/api/images/retrieve?username=john&page=1&limit=10');
const result = await response.json();
console.log(result.data.images);
```

### Delete Image
```javascript
const response = await fetch('http://103.14.120.163:3000/api/images/delete?id=IMAGE_ID&username=john', {
  method: 'DELETE'
});
const result = await response.json();
console.log(result);
```

## 🔒 Security Features

- **File Type Validation**: Only image files are allowed
- **File Size Limits**: Maximum 10MB per file
- **Username Verification**: Users can only access their own images
- **Path Sanitization**: Prevents directory traversal attacks
- **MongoDB Injection Protection**: Uses parameterized queries

## 🚨 Error Handling

The API provides comprehensive error handling:

- **400 Bad Request**: Invalid input data
- **403 Forbidden**: Unauthorized access
- **404 Not Found**: User or image not found
- **413 Payload Too Large**: File size exceeds limit
- **500 Internal Server Error**: Server-side errors

## 📊 Performance Considerations

- **Pagination**: All list endpoints support pagination
- **Indexing**: MongoDB indexes on username and createdAt
- **File Organization**: Username-based folder structure
- **Efficient Queries**: Optimized database queries

## 🔧 Troubleshooting

### Common Issues

1. **Permission Denied**: Check file permissions on `public/assets`
2. **MongoDB Connection**: Verify `MONGODB_URI` and IP whitelist
3. **File Not Found**: Ensure the file exists before deletion
4. **Large Files**: Check file size limits and server memory

### Debug Mode

Set `NODE_ENV=development` to see detailed error messages and stack traces.

## 📈 Monitoring

The API includes comprehensive logging:
- Upload progress and file details
- Database operations
- Error tracking with stack traces
- Performance metrics

## 🚀 Deployment

### Ubuntu Server Deployment
1. Clone the repository
2. Install dependencies: `npm install`
3. Set environment variables
4. Build the application: `npm run build`
5. Start the server: `npm start`
6. Configure reverse proxy (nginx) if needed

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name 103.14.120.163;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /assets/ {
        alias /path/to/your/app/public/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 📞 Support

For issues or questions:
1. Check the error logs
2. Verify environment variables
3. Test MongoDB connection
4. Check file permissions

---

**Note**: This API is designed to work seamlessly with your Ubuntu server at IP `103.14.120.163` and MongoDB cluster with `0.0.0.0/0` access. All file paths and URLs are configured for production deployment.
