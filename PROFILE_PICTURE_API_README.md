# Profile Picture API - Instagram-like Social Media Platform

A comprehensive API system for managing user profile pictures in a social media platform, built with Next.js, TypeScript, MongoDB, and Cloudinary.

## 🚀 **Features**

### **Profile Picture Management APIs**

* **Upload Profile Picture**: Upload real image files directly to Cloudinary with automatic optimization
* **Retrieve Profile Picture**: Get profile picture information for any user
* **Delete Profile Picture**: Remove profile pictures from Cloudinary and database
* **Authentication Required**: Secure JWT-based authentication
* **Privacy Aware**: Respects user privacy settings
* **Automatic Cleanup**: Removes old images when updating

### **Image Processing**

* **Real File Uploads**: No base64 conversion needed - upload files directly
* **Automatic Optimization**: Cloudinary transforms images to 400x400 with face detection
* **Quality Optimization**: Automatic quality adjustment for optimal file size
* **Format Support**: Supports all major image formats (JPEG, PNG, GIF, WebP)
* **Size Validation**: Maximum file size limit of 5MB
* **File Type Validation**: Only allows image files

## 📁 **API Endpoints**

### **1. Upload Profile Picture**

**Endpoint:** `POST /api/user/upload-profile-picture`

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
```

**Request Body:** `multipart/form-data`
- `image`: Image file (JPEG, PNG, GIF, WebP)

**Response:**
```json
{
  "success": true,
  "message": "Profile picture uploaded successfully",
  "data": {
    "avatar": "https://res.cloudinary.com/cloud_name/image/upload/v123/profile-pictures/user_123_1234567890.jpg",
    "cloudinaryId": "user_123_1234567890",
    "url": "https://res.cloudinary.com/cloud_name/image/upload/v123/profile-pictures/user_123_1234567890.jpg",
    "originalName": "profile.jpg",
    "fileSize": 1024000,
    "mimeType": "image/jpeg"
  }
}
```

**Features:**
- Accepts real image files directly (no base64 needed)
- Automatically deletes old profile picture from Cloudinary
- Optimizes image to 400x400 with face detection
- Updates user record in database
- Returns comprehensive file information

### **2. Get Profile Picture**

**Endpoint:** `GET /api/user/get-profile-picture`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `userId` (optional): Get profile picture for specific user. If not provided, returns authenticated user's profile picture.

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user_id_here",
    "username": "username_here",
    "fullName": "Full Name Here",
    "avatar": "https://res.cloudinary.com/cloud_name/image/upload/v123/profile-pictures/user_123_1234567890.jpg",
    "hasProfilePicture": true,
    "isPrivate": false
  }
}
```

**Features:**
- Respects user privacy settings
- Returns comprehensive user information
- Indicates if user has a profile picture

### **3. Delete Profile Picture**

**Endpoint:** `DELETE /api/user/delete-profile-picture`

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Profile picture deleted successfully",
  "data": {
    "userId": "user_id_here",
    "username": "username_here",
    "avatar": null,
    "hasProfilePicture": false
  }
}
```

**Features:**
- Removes image from Cloudinary
- Updates user record in database
- Cleans up storage resources

## 🛠️ **Setup Instructions**

### **Prerequisites**

* Node.js 16+
* MongoDB
* Cloudinary account
* npm or yarn

### **Installation**

```bash
# Install dependencies
npm install multer @types/multer

# Start development server
npm run dev
```

### **Environment Variables**

Add these to your `.env.local` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here

# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# JWT Secret
JWT_SECRET=your_jwt_secret_key
```

## 🧪 **Testing the APIs**

### **1. Get JWT Token**

First, login to get a JWT token:

```bash
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "your_email", "password": "your_password"}'
```

### **2. Upload Profile Picture (File Upload)**

```bash
# Upload an image file directly
curl -X POST "http://localhost:3000/api/user/upload-profile-picture" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/your/image.jpg"
```

### **3. Get Profile Picture**

```bash
# Get your own profile picture
curl -X GET "http://localhost:3000/api/user/get-profile-picture" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get another user's profile picture
curl -X GET "http://localhost:3000/api/user/get-profile-picture?userId=OTHER_USER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **4. Delete Profile Picture**

```bash
curl -X DELETE "http://localhost:3000/api/user/delete-profile-picture" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📱 **Frontend Integration Examples**

### **React Component Example**

```tsx
import React, { useState } from 'react';

const ProfilePictureUpload = () => {
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!image) return;

    setLoading(true);
    try {
      // Create FormData and append the file
      const formData = new FormData();
      formData.append('image', image);
      
      const response = await fetch('/api/user/upload-profile-picture', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
          // Don't set Content-Type for FormData
        },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        console.log('Profile picture uploaded:', data.data.url);
        // Update UI or redirect
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      <button onClick={handleUpload} disabled={!image || loading}>
        {loading ? 'Uploading...' : 'Upload Profile Picture'}
      </button>
    </div>
  );
};

export default ProfilePictureUpload;
```

### **JavaScript Example**

```javascript
// Upload profile picture
async function uploadProfilePicture(imageFile) {
  try {
    // Create FormData and append the file
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await fetch('/api/user/upload-profile-picture', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });
    
    const data = await response.json();
    if (data.success) {
      console.log('Profile picture uploaded successfully!');
      console.log('File info:', {
        name: data.data.originalName,
        size: data.data.fileSize,
        type: data.data.mimeType
      });
      // Update UI
      document.getElementById('profile-pic').src = data.data.url;
    }
  } catch (error) {
    console.error('Upload failed:', error);
  }
}

// Get profile picture
async function getProfilePicture(userId = null) {
  try {
    const url = userId 
      ? `/api/user/get-profile-picture?userId=${userId}`
      : '/api/user/get-profile-picture';
      
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    const data = await response.json();
    if (data.success) {
      return data.data;
    }
  } catch (error) {
    console.error('Failed to get profile picture:', error);
  }
}

// Delete profile picture
async function deleteProfilePicture() {
  try {
    const response = await fetch('/api/user/delete-profile-picture', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    const data = await response.json();
    if (data.success) {
      console.log('Profile picture deleted successfully!');
      // Update UI
      document.getElementById('profile-pic').src = '/default-avatar.png';
    }
  } catch (error) {
    console.error('Deletion failed:', error);
  }
}
```

## 🔒 **Security Features**

* **JWT Authentication**: All endpoints require valid JWT tokens
* **User Isolation**: Users can only modify their own profile pictures
* **File Type Validation**: Only allows image files (JPEG, PNG, GIF, WebP)
* **File Size Limits**: Maximum 5MB file size
* **Privacy Respect**: Respects user privacy settings
* **Automatic Cleanup**: Removes old images to prevent storage bloat

## 📊 **Error Handling**

### **Common Error Responses**

```json
// Unauthorized
{
  "error": "No token provided"
}

// No file provided
{
  "error": "No image file provided"
}

// Invalid file type
{
  "error": "Invalid file type. Only images are allowed."
}

// File too large
{
  "error": "File size too large. Maximum size is 5MB"
}

// User not found
{
  "error": "User not found"
}

// No profile picture to delete
{
  "error": "No profile picture to delete"
}
```

## 🚀 **Deployment**

### **Vercel (Recommended)**

```bash
npm install -g vercel
vercel
```

### **Environment Variables in Production**

Make sure to set all required environment variables in your production environment:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `MONGODB_URI`
- `JWT_SECRET`

## 🔄 **Changelog**

### **Version 2.0.0**

* ✅ **Real file uploads** - No more base64 conversion needed
* ✅ **Multer integration** for efficient file handling
* ✅ **File type validation** - Only allows image files
* ✅ **File size validation** - 5MB limit with proper error handling
* ✅ **FormData support** for modern file uploads
* ✅ **Enhanced file information** in responses

### **Version 1.0.0**

* ✅ Profile picture upload with Cloudinary integration
* ✅ Automatic image optimization and transformation
* ✅ Profile picture retrieval with privacy support
* ✅ Profile picture deletion with Cloudinary cleanup
* ✅ Comprehensive error handling and validation
* ✅ JWT-based authentication
* ✅ Automatic old image cleanup

---

**Built with ❤️ using Next.js, TypeScript, MongoDB, Cloudinary, and Multer**
