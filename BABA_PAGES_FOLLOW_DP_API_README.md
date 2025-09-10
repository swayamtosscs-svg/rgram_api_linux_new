# Baba Pages Follow & DP API Documentation

This document describes the follow/unfollow functionality and profile picture (DP) management APIs for Baba Ji pages.

## 🚀 **Features**

### **Follow/Unfollow System**
- Follow/unfollow Baba Ji pages
- Check follow status
- Get followers list for a page
- Get pages that a user is following
- Automatic follower count updates

### **Profile Picture Management**
- Upload profile pictures to Cloudinary
- Delete profile pictures
- Automatic image optimization and resizing
- Support for JPEG, PNG, and WebP formats

## 📁 **API Endpoints**

### **1. Follow/Unfollow Page**

#### **Follow a Page**
```http
POST /api/baba-pages/[id]/follow
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully followed the page",
  "data": {
    "followId": "follow_id_here",
    "pageId": "page_id_here",
    "followerId": "user_id_here"
  }
}
```

#### **Unfollow a Page**
```http
DELETE /api/baba-pages/[id]/follow
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully unfollowed the page"
}
```

#### **Check Follow Status**
```http
GET /api/baba-pages/[id]/follow
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isFollowing": true,
    "followId": "follow_id_here"
  }
}
```

### **2. Profile Picture Management**

#### **Upload Profile Picture**
```http
POST /api/baba-pages/[id]/dp/upload
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data

Body:
- file: (image file)
```

**Response:**
```json
{
  "success": true,
  "message": "Profile picture uploaded successfully",
  "data": {
    "avatar": "https://cloudinary_url_here",
    "publicId": "baba-pages/page_id/profile_pictures/timestamp",
    "format": "jpg",
    "width": 400,
    "height": 400,
    "size": 12345
  }
}
```

#### **Delete Profile Picture**
```http
DELETE /api/baba-pages/[id]/dp/delete
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Profile picture deleted successfully",
  "data": {
    "deletedPublicId": "baba-pages/page_id/profile_pictures/timestamp",
    "cloudinaryResult": "ok"
  }
}
```

### **3. Followers Management**

#### **Get Page Followers**
```http
GET /api/baba-pages/[id]/followers?page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "followers": [
      {
        "id": "user_id_here",
        "username": "username",
        "email": "user@example.com",
        "profilePicture": "profile_pic_url",
        "firstName": "John",
        "lastName": "Doe",
        "followedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100,
      "itemsPerPage": 20
    },
    "pageInfo": {
      "pageId": "page_id_here",
      "pageName": "Page Name",
      "totalFollowers": 100
    }
  }
}
```

#### **Get User's Followed Pages**
```http
GET /api/baba-pages/following?page=1&limit=20
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pages": [
      {
        "id": "page_id_here",
        "name": "Page Name",
        "description": "Page description",
        "avatar": "avatar_url",
        "location": "Location",
        "religion": "Religion",
        "website": "website_url",
        "followersCount": 100,
        "postsCount": 50,
        "videosCount": 25,
        "storiesCount": 10,
        "followedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 50,
      "itemsPerPage": 20
    }
  }
}
```

## 🔧 **Setup Requirements**

### **Environment Variables**
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SECRET=your_jwt_secret
MONGODB_URI=your_mongodb_uri
```

### **Database Models**

#### **BabaPage Model Updates**
```typescript
interface IBabaPage {
  // ... existing fields
  followers: mongoose.Types.ObjectId[];
  followersCount: number;
  avatar?: string;
}
```

#### **BabaPageFollow Model**
```typescript
interface IBabaPageFollow {
  _id: string;
  follower: mongoose.Types.ObjectId;
  page: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected';
  requestedAt: Date;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## 📝 **Usage Examples**

### **JavaScript/TypeScript**

#### **Follow a Page**
```javascript
const followPage = async (pageId, token) => {
  const response = await fetch(`/api/baba-pages/${pageId}/follow`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return await response.json();
};
```

#### **Upload Profile Picture**
```javascript
const uploadProfilePicture = async (pageId, file, token) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`/api/baba-pages/${pageId}/dp/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  return await response.json();
};
```

#### **Get Followers**
```javascript
const getFollowers = async (pageId, page = 1, limit = 20) => {
  const response = await fetch(`/api/baba-pages/${pageId}/followers?page=${page}&limit=${limit}`);
  return await response.json();
};
```

### **cURL Examples**

#### **Follow a Page**
```bash
curl -X POST "http://localhost:3000/api/baba-pages/PAGE_ID/follow" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

#### **Upload Profile Picture**
```bash
curl -X POST "http://localhost:3000/api/baba-pages/PAGE_ID/dp/upload" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@profile_picture.jpg"
```

#### **Delete Profile Picture**
```bash
curl -X DELETE "http://localhost:3000/api/baba-pages/PAGE_ID/dp/delete" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔒 **Security Features**

- **JWT Authentication**: All endpoints require valid JWT tokens
- **File Validation**: Profile pictures are validated for type and size
- **Cloudinary Security**: Secure file upload and deletion
- **User Isolation**: Users can only manage their own data
- **Input Validation**: All inputs are validated and sanitized

## 📊 **File Upload Specifications**

### **Supported Formats**
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)

### **Size Limits**
- Maximum file size: 5MB
- Automatic resizing to 400x400 pixels
- Face detection for optimal cropping

### **Cloudinary Configuration**
- Folder structure: `baba-pages/{pageId}/profile_pictures/`
- Automatic optimization and compression
- Secure URLs for all uploaded files

## 🚨 **Error Handling**

### **Common Error Responses**

#### **Authentication Errors**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

#### **Validation Errors**
```json
{
  "success": false,
  "message": "Invalid file type. Only JPEG, PNG, and WebP are allowed"
}
```

#### **Not Found Errors**
```json
{
  "success": false,
  "message": "Baba Ji page not found"
}
```

## 🔄 **Database Updates**

When following/unfollowing a page:
1. **BabaPageFollow** collection is updated
2. **BabaPage.followersCount** is incremented/decremented
3. **BabaPage.followers** array is updated
4. **User.followingCount** is updated

When uploading/deleting profile pictures:
1. **BabaPage.avatar** field is updated
2. Old images are automatically deleted from Cloudinary
3. New images are optimized and uploaded to Cloudinary

## 📈 **Performance Considerations**

- **Indexed Queries**: All database queries use proper indexes
- **Pagination**: All list endpoints support pagination
- **Cloudinary Optimization**: Images are automatically optimized
- **Efficient Updates**: Database updates use atomic operations

## 🧪 **Testing**

### **Test Follow/Unfollow**
1. Create a test page
2. Follow the page
3. Check follow status
4. Unfollow the page
5. Verify follower count updates

### **Test Profile Picture**
1. Upload a profile picture
2. Verify image is uploaded to Cloudinary
3. Check page avatar is updated
4. Delete profile picture
5. Verify image is removed from Cloudinary

---

**Built with ❤️ using Next.js, TypeScript, MongoDB, and Cloudinary**
