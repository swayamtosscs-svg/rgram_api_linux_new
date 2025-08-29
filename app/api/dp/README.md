# Profile Picture (DP) Management API

This API provides complete profile picture management functionality with Cloudinary integration. All images are stored in username-based folders: `users/{username}/profile_pictures/`.

## Base URL
```
http://localhost:3000/api/dp
```

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## API Endpoints

### 1. Upload Profile Picture
**POST** `/api/dp/upload`

Uploads a new profile picture for the authenticated user or a specified user.

**Request:**
- Content-Type: `multipart/form-data`
- Body: Form data with:
  - `dp`: Image file (required)
  - `username`: Target username (optional - defaults to authenticated user)

**Supported Formats:**
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)

**File Size Limit:** 5MB

**Response:**
```json
{
  "success": true,
  "message": "Profile picture uploaded successfully",
  "data": {
    "avatar": "https://res.cloudinary.com/...",
    "publicId": "users/john_doe/profile_pictures/dp_1234567890",
    "width": 400,
    "height": 400,
    "format": "jpg",
    "size": 102400,
    "uploadedAt": "2025-08-28T10:10:00.000Z",
    "username": "john_doe",
    "uploadedBy": "admin_user",
    "isSelfUpload": false
  }
}
```

**cURL Examples:**
```bash
# Upload for current user
curl -X POST "http://localhost:3000/api/dp/upload" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "dp=@/path/to/image.jpg"

# Upload for specific user by username
curl -X POST "http://localhost:3000/api/dp/upload" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "dp=@/path/to/image.jpg" \
  -F "username=john_doe"
```

---

### 2. Retrieve Profile Picture
**GET** `/api/dp/retrieve`

Retrieves the current profile picture for a user.

**Query Parameters:**
- `username` (optional): Target username (defaults to authenticated user)
- `includeHistory` (optional): Set to "true" to include upload history

**Response (Current DP only):**
```json
{
  "success": true,
  "message": "Profile picture retrieved successfully",
  "data": {
    "avatar": "https://res.cloudinary.com/...",
    "publicId": "users/john_doe/profile_pictures/dp_1234567890",
    "username": "john_doe",
    "hasProfilePicture": true,
    "uploadedAt": "2025-08-28T10:10:00.000Z"
  }
}
```

**Response (With History):**
```json
{
  "success": true,
  "message": "Profile picture retrieved successfully",
  "data": {
    "current": { ... },
    "history": [
      {
        "publicId": "users/john_doe/profile_pictures/dp_1234567890",
        "url": "https://res.cloudinary.com/...",
        "format": "jpg",
        "width": 400,
        "height": 400,
        "size": 102400,
        "uploadedAt": "2025-08-28T10:10:00.000Z",
        "isCurrent": true
      }
    ],
    "totalCount": 1
  }
}
```

**cURL Examples:**
```bash
# Get current user's DP
curl -X GET "http://localhost:3000/api/dp/retrieve" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get specific user's DP by username
curl -X GET "http://localhost:3000/api/dp/retrieve?username=john_doe" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get DP with history
curl -X GET "http://localhost:3000/api/dp/retrieve?includeHistory=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 3. Delete Profile Picture
**DELETE** `/api/dp/delete`

Deletes a profile picture from both Cloudinary and the database.

**Request Body:**
```json
{
  "publicId": "users/john_doe/profile_pictures/dp_1234567890",
  "deleteFromCloudinary": true
}
```

**Parameters:**
- `publicId` (optional): Specific public ID to delete (defaults to current user's DP)
- `deleteFromCloudinary` (optional): Whether to delete from Cloudinary (default: true)

**Response:**
```json
{
  "success": true,
  "message": "Profile picture deleted successfully",
  "data": {
    "deletedPublicId": "users/john_doe/profile_pictures/dp_1234567890",
    "deletedFromCloudinary": true,
    "cloudinaryResult": { "result": "ok" },
    "userUpdated": true,
    "deletedAt": "2025-08-28T10:10:00.000Z"
  }
}
```

**cURL Examples:**
```bash
# Delete current profile picture
curl -X DELETE "http://localhost:3000/api/dp/delete" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"deleteFromCloudinary": true}'

# Delete specific profile picture
curl -X DELETE "http://localhost:3000/api/dp/delete" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "publicId": "users/john_doe/profile_pictures/dp_1234567890",
    "deleteFromCloudinary": true
  }'
```

---

### 4. Replace Profile Picture
**PUT** `/api/dp/replace`

Replaces the current profile picture with a new one.

**Request:**
- Content-Type: `multipart/form-data`
- Body: Form data with:
  - `dp`: New image file
  - `keepOldImage`: Set to "true" to preserve old image

**Response:**
```json
{
  "success": true,
  "message": "Profile picture replaced successfully",
  "data": {
    "newProfilePicture": {
      "avatar": "https://res.cloudinary.com/...",
      "publicId": "users/john_doe/profile_pictures/dp_1234567890",
      "width": 400,
      "height": 400,
      "format": "jpg",
      "size": 102400,
      "uploadedAt": "2025-08-28T10:10:00.000Z"
    },
    "oldProfilePicture": {
      "publicId": "users/john_doe/profile_pictures/dp_0987654321",
      "wasDeleted": true,
      "deleteResult": { "result": "ok" }
    },
    "userUpdated": true,
    "replacedAt": "2025-08-28T10:10:00.000Z"
  }
}
```

**cURL Example:**
```bash
curl -X PUT "http://localhost:3000/api/dp/replace" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "dp=@/path/to/new_image.jpg"
```

---

## Error Responses

All endpoints return consistent error responses:

**Authentication Error (401):**
```json
{
  "error": "Authentication required"
}
```

**Validation Error (400):**
```json
{
  "error": "Profile picture file is required"
}
```

**Not Found Error (404):**
```json
{
  "error": "User not found"
}
```

**Server Error (500):**
```json
{
  "error": "Internal server error",
      "details": "Error message details"
}
```

---

## Features

- **Username-Based Folders**: Each user's images are stored in `users/{username}/profile_pictures/`
- **Multi-User Upload**: Upload profile pictures for any user (with proper permissions)
- **Image Processing**: Automatic resizing to 400x400px with face detection
- **Format Optimization**: Automatic quality and format optimization
- **File Validation**: Type and size validation (max 5MB)
- **History Tracking**: Optional upload history retrieval
- **Flexible Deletion**: Choose whether to delete from Cloudinary
- **Image Preservation**: Option to keep old images when replacing
- **Audit Trail**: Track who uploaded what for whom

---

## Environment Variables Required

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## Dependencies

- Next.js 13+ (App Router)
- Cloudinary SDK
- MongoDB (via your existing connection)
- JWT authentication middleware
