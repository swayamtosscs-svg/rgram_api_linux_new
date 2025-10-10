# DP (Profile Picture) API Implementation

This document provides a complete guide to the newly implemented DP (Profile Picture) Management APIs with Cloudinary integration.

## 🚀 Overview

The DP API system provides comprehensive profile picture management capabilities including:
- **Upload** new profile pictures
- **Retrieve** existing profile pictures
- **Delete** profile pictures
- **Replace** profile pictures with new ones
- **Automatic cleanup** of old images
- **Image optimization** and transformations

## 📁 File Structure

```
api_rgram1/
├── pages/api/dp/
│   ├── route.ts          # Main DP endpoint info
│   ├── upload.ts         # Upload profile picture
│   ├── retrieve.ts       # Retrieve profile picture
│   ├── delete.ts         # Delete profile picture
│   └── replace.ts        # Replace profile picture
├── public/
│   └── dp-api-demo.html  # Interactive demo page
├── test-dp-api.js        # Node.js test script
└── DP_API_IMPLEMENTATION_README.md  # This file
```

## 🔧 API Endpoints

### Base URL
```
/api/dp
```

### 1. API Information
**GET** `/api/dp`
- Returns information about all available DP endpoints
- No authentication required
- Useful for API discovery and documentation

### 2. Upload Profile Picture
**POST** `/api/dp/upload`
- **Purpose**: Upload a new profile picture for a user
- **Content-Type**: `multipart/form-data`
- **Body Parameters**:
  - `dp`: Image file (JPEG, PNG, GIF, etc.)
  - `userId`: User ID string
- **File Requirements**:
  - Maximum size: 5MB
  - Supported formats: All standard image formats
- **Features**:
  - Automatic deletion of old profile picture
  - Image optimization (400x400, face crop, auto quality)
  - Cloudinary storage in `users/dp` folder

**Response Example**:
```json
{
  "success": true,
  "message": "Profile picture uploaded successfully",
  "data": {
    "avatar": "https://res.cloudinary.com/.../users/dp/dp_userid_timestamp.jpg",
    "publicId": "dp_userid_timestamp"
  }
}
```

### 3. Retrieve Profile Picture
**GET** `/api/dp/retrieve?userId={userId}`
**POST** `/api/dp/retrieve`
- **Purpose**: Get a user's profile picture by their ID
- **Methods**: Both GET (query params) and POST (request body) supported
- **Parameters**: `userId` (required)
- **Features**:
  - Returns user information along with avatar
  - Handles cases where no profile picture exists

**Response Example**:
```json
{
  "success": true,
  "message": "Profile picture retrieved successfully",
  "data": {
    "avatar": "https://res.cloudinary.com/.../users/dp/dp_userid_timestamp.jpg",
    "hasAvatar": true,
    "userId": "user_id_here",
    "username": "username_here",
    "fullName": "Full Name Here"
  }
}
```

### 4. Delete Profile Picture
**DELETE** `/api/dp/delete`
- **Purpose**: Remove a user's profile picture
- **Content-Type**: `application/json`
- **Body**: `{ "userId": "user_id_here" }`
- **Features**:
  - Removes image from Cloudinary
  - Updates user profile in database
  - Graceful handling of non-existent avatars

**Response Example**:
```json
{
  "success": true,
  "message": "Profile picture deleted successfully",
  "data": {
    "deleted": true,
    "avatar": null
  }
}
```

### 5. Replace Profile Picture
**PUT** `/api/dp/replace`
- **Purpose**: Replace existing profile picture with a new one
- **Content-Type**: `multipart/form-data`
- **Body Parameters**:
  - `dp`: New image file
  - `userId`: User ID string
- **Features**:
  - Uploads new image first, then deletes old one
  - Ensures no data loss during replacement
  - Same image transformations as upload

**Response Example**:
```json
{
  "success": true,
  "message": "Profile picture replaced successfully",
  "data": {
    "avatar": "https://res.cloudinary.com/.../users/dp/dp_userid_timestamp.jpg",
    "publicId": "dp_userid_timestamp",
    "replaced": true,
    "oldPublicId": "previous_public_id"
  }
}
```

## 🛠️ Technical Implementation

### Dependencies
- **Next.js**: API framework
- **MongoDB**: Database storage
- **Cloudinary**: Image storage and optimization
- **Multer**: File upload handling
- **TypeScript**: Type safety

### Key Features
1. **No Authentication Required**: Uses User ID for identification
2. **File Validation**: Image type and size validation
3. **Automatic Cleanup**: Old images are automatically deleted
4. **Image Optimization**: Automatic resizing and quality optimization
5. **Error Handling**: Comprehensive error handling with detailed messages
6. **Database Integration**: Seamless integration with MongoDB User model

### Image Transformations
All uploaded images are automatically processed with:
- **Size**: 400x400 pixels
- **Crop**: Fill with face detection
- **Quality**: Automatic optimization
- **Folder**: `users/dp` on Cloudinary

## 🧪 Testing

### 1. Interactive Demo
Open `public/dp-api-demo.html` in your browser to test all endpoints with a user-friendly interface.

### 2. Node.js Test Script
Run the test script to verify API functionality:
```bash
node test-dp-api.js
```

### 3. Manual Testing
Use tools like Postman, cURL, or any HTTP client to test the endpoints.

## 📱 Usage Examples

### JavaScript/TypeScript
```typescript
// Upload DP
const formData = new FormData();
formData.append('dp', fileInput.files[0]);
formData.append('userId', 'user_id_here');

const response = await fetch('/api/dp/upload', {
  method: 'POST',
  body: formData
});

// Retrieve DP
const response = await fetch('/api/dp/retrieve?userId=user_id_here');

// Delete DP
const response = await fetch('/api/dp/delete', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: 'user_id_here' })
});

// Replace DP
const formData = new FormData();
formData.append('dp', newFileInput.files[0]);
formData.append('userId', 'user_id_here');

const response = await fetch('/api/dp/replace', {
  method: 'PUT',
  body: formData
});
```

### cURL
```bash
# Upload DP
curl -X POST /api/dp/upload \
  -F "dp=@profile.jpg" \
  -F "userId=user_id_here"

# Retrieve DP
curl -X GET "/api/dp/retrieve?userId=user_id_here"

# Delete DP
curl -X DELETE /api/dp/delete \
  -H "Content-Type: application/json" \
  -d '{"userId": "user_id_here"}'

# Replace DP
curl -X PUT /api/dp/replace \
  -F "dp=@new_profile.jpg" \
  -F "userId=user_id_here"
```

## 🔒 Security Considerations

### Current Implementation
- **No Authentication**: APIs use User ID for identification
- **File Validation**: Image type and size restrictions
- **Input Sanitization**: User ID validation

### Production Recommendations
1. **Implement Authentication**: Add JWT or session-based authentication
2. **Rate Limiting**: Prevent abuse with rate limiting
3. **File Scanning**: Add virus/malware scanning for uploaded files
4. **User Authorization**: Verify user permissions before operations
5. **Input Validation**: Enhanced input validation and sanitization

## 🚨 Error Handling

### Common Error Responses

#### Bad Request (400)
```json
{
  "error": "User ID is required in form data"
}
```
```json
{
  "error": "No file provided"
}
```
```json
{
  "error": "Only image files are allowed"
}
```
```json
{
  "error": "File size must be less than 5MB"
}
```

#### Not Found (404)
```json
{
  "error": "User not found"
}
```

#### Method Not Allowed (405)
```json
{
  "error": "Method not allowed"
}
```

#### Internal Server Error (500)
```json
{
  "error": "Internal server error"
}
```

## 🔧 Environment Variables

Ensure these environment variables are set in your `.env.local` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
MONGODB_URI=your_mongodb_connection_string
```

## 📊 Database Schema

The APIs work with the existing User model:

```typescript
interface User {
  _id: string;
  username: string;
  fullName: string;
  avatar?: string;  // Cloudinary URL
  // ... other fields
}
```

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install multer @types/multer
```

### 2. Set Environment Variables
Configure Cloudinary and MongoDB credentials

### 3. Start Development Server
```bash
npm run dev
```

### 4. Test APIs
- Open `http://localhost:3000/dp-api-demo.html` for interactive testing
- Use the test script: `node test-dp-api.js`
- Test individual endpoints with your preferred HTTP client

## 🔄 API Workflow

### Typical Usage Flow
1. **Upload**: User uploads initial profile picture
2. **Retrieve**: Display profile picture in UI
3. **Replace**: User updates profile picture (optional)
4. **Delete**: User removes profile picture (optional)

### Data Flow
1. **Client** → **API** → **File Validation**
2. **API** → **Cloudinary** → **Image Upload & Optimization**
3. **API** → **MongoDB** → **User Profile Update**
4. **API** → **Client** → **Response with Image URL**

## 🎯 Future Enhancements

### Potential Improvements
1. **Multiple Image Support**: Allow multiple profile pictures
2. **Image Cropping**: Client-side image cropping before upload
3. **CDN Integration**: Additional CDN for faster image delivery
4. **Image Analytics**: Track image usage and performance
5. **Batch Operations**: Support for bulk operations
6. **Webhook Support**: Notifications for image processing events

## 📞 Support

For issues or questions:
1. Check the error logs in your console
2. Verify environment variables are correctly set
3. Ensure MongoDB is running and accessible
4. Verify Cloudinary credentials are valid

## 📝 License

This implementation is part of the api_rgram1 project.

---

**Built with ❤️ using Next.js, TypeScript, MongoDB, Cloudinary, and Multer**
