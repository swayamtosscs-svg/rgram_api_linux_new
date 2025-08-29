# DP (Display Picture) API Documentation

This document describes the DP API endpoints for managing user profile pictures in the Rgram application.

## Base URL
```
/api/dp
```

## Authentication
**No authentication required** - These are open API endpoints that can be used without any authorization tokens.

## Endpoints

### 1. Upload Display Picture
**POST** `/api/dp/upload`

Uploads a new display picture using real image files.

#### Request Body
**Multipart Form Data:**
- `image`: Image file (JPEG, PNG, WebP, GIF)
- `userId`: User ID (optional, defaults to "default_user")

#### Response
```json
{
  "success": true,
  "message": "DP uploaded successfully",
  "data": {
    "avatar": "https://res.cloudinary.com/your-cloud/image/upload/v123/user/userId/dp/dp_userId_timestamp.jpg",
    "publicId": "user/userId/dp/dp_userId_timestamp",
    "width": 400,
    "height": 400,
    "format": "jpg",
    "size": 45678,
    "userId": "user123"
  }
}
```

#### Features
- Accepts real image files (no base64 conversion needed)
- Automatically resizes images to 400x400 pixels
- Uses face detection for optimal cropping
- Stores images in organized folder structure: `user/{userId}/dp/`
- Maximum file size: 10MB

---

### 2. Delete Display Picture
**DELETE** `/api/dp/delete`

Removes a display picture by publicId, imageUrl, or userId.

#### Request Body
```json
{
  "publicId": "user/userId/dp/dp_userId_timestamp",
  "imageUrl": "https://res.cloudinary.com/your-cloud/image/upload/v123/user/userId/dp/dp_userId_timestamp.jpg",
  "userId": "user123"
}
```
*Note: Only one of the above parameters is required*

#### Response
```json
{
  "success": true,
  "message": "DP deleted successfully",
  "data": {
    "deletedPublicId": "user/userId/dp/dp_userId_timestamp",
    "message": "Image removed from Cloudinary"
  }
}
```

#### Features
- Multiple ways to identify images for deletion
- Removes image from Cloudinary
- Flexible deletion options

---

### 3. Retrieve Display Picture
**GET** `/api/dp/retrieve`

Gets display picture information by userId, publicId, or imageUrl.

#### Query Parameters
- `userId`: User ID to find their DP (optional)
- `publicId`: Cloudinary public ID (optional)
- `imageUrl`: Full image URL (optional)

*Note: Only one of the above parameters is required*

#### Response
```json
{
  "success": true,
  "data": {
    "publicId": "user/userId/dp/dp_userId_timestamp",
    "url": "https://res.cloudinary.com/your-cloud/image/upload/v123/user/userId/dp/dp_userId_timestamp.jpg",
    "width": 400,
    "height": 400,
    "format": "jpg",
    "size": 45678,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "folder": "user/userId/dp",
    "resourceType": "image"
  }
}
```

#### Features
- Multiple ways to search for images
- Returns comprehensive image metadata
- No authentication required

---

### 4. API Information
**GET** `/api/dp`

Returns information about all available DP API endpoints.

#### Response
```json
{
  "message": "DP API Endpoints",
  "endpoints": {
    // Detailed endpoint information
  },
      "notes": [
      "No authentication required - open API endpoints",
      "Images are automatically resized to 400x400 with face detection",
      "Supports real image file uploads (JPEG, PNG, WebP, GIF)",
      "Images are stored in Cloudinary under user/{userId}/dp/ folder structure",
      "Maximum file size: 10MB",
      "Multiple ways to identify images: publicId, imageUrl, or userId"
    ]
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Additional error details (in development mode)"
}
```

### Common HTTP Status Codes
- `200` - Success
- `400` - Bad Request (invalid data)
- `401` - Unauthorized (invalid/missing token)
- `404` - Not Found (user not found)
- `405` - Method Not Allowed
- `500` - Internal Server Error

## Usage Examples

### JavaScript/Node.js
```javascript
// Upload DP with FormData
const uploadDP = async (imageFile, userId = 'default_user') => {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('userId', userId);
  
  const response = await fetch('/api/dp/upload', {
    method: 'POST',
    body: formData
  });
  return response.json();
};

// Delete DP
const deleteDP = async (publicId) => {
  const response = await fetch('/api/dp/delete', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ publicId })
  });
  return response.json();
};

// Get DP information
const getDP = async (userId) => {
  const response = await fetch(`/api/dp/retrieve?userId=${userId}`);
  return response.json();
};
```

### cURL
```bash
# Upload DP (real image file)
curl -X POST /api/dp/upload \
  -F "image=@/path/to/your/image.jpg" \
  -F "userId=user123"

# Delete DP by publicId
curl -X DELETE /api/dp/delete \
  -H "Content-Type: application/json" \
  -d '{"publicId": "user/user123/dp/dp_user123_timestamp"}'

# Delete DP by imageUrl
curl -X DELETE /api/dp/delete \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "https://res.cloudinary.com/your-cloud/image/upload/v123/user/user123/dp/dp_user123_timestamp.jpg"}'

# Get DP by userId
curl -X GET "/api/dp/retrieve?userId=user123"

# Get DP by publicId
curl -X GET "/api/dp/retrieve?publicId=user/user123/dp/dp_user123_timestamp"

# Get DP by imageUrl
curl -X GET "/api/dp/retrieve?imageUrl=https://res.cloudinary.com/your-cloud/image/upload/v123/user/user123/dp/dp_user123_timestamp.jpg"
```

## Technical Details

### Image Processing
- **Format Support**: JPEG, PNG, WebP, GIF
- **Size Limit**: 10MB per upload
- **Auto-resize**: 400x400 pixels with face detection
- **Quality**: Auto-optimized for web

### Cloudinary Integration
- **Folder Structure**: `user/{userId}/dp/`
- **Public ID Format**: `dp_{userId}_{timestamp}`
- **Automatic Cleanup**: Old images are deleted when new ones are uploaded

### Security Features
- File type validation (images only)
- File size limits (10MB max)
- Input validation and sanitization
- Secure file handling with temporary file cleanup

## Environment Variables Required

Make sure these environment variables are set:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Notes

- The API automatically handles image optimization and storage
- Images are processed and optimized for web use
- All operations are logged for debugging purposes
- The API follows RESTful conventions
- Error messages are user-friendly in production and detailed in development
- No authentication required - open for public use
- Supports multiple image formats and automatic conversion
