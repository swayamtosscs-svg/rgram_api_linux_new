# DP (Profile Picture) Management API

This document describes the APIs for managing user profile pictures (DP) with Cloudinary integration. All images are stored in the `users/dp` folder on Cloudinary.

## Base URL
```
/api/dp
```

## Authentication
**No authentication required** - APIs now use User ID for identification instead of session cookies.

## API Endpoints

### 1. Upload Profile Picture
**POST** `/api/dp/upload`

Upload a new profile picture for a specific user.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: Form data with:
  - `dp`: Image file
  - `userId`: User ID string

**File Requirements:**
- Type: Image files only (JPEG, PNG, GIF, etc.)
- Size: Maximum 5MB
- Format: Any standard image format

**Response:**
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

**Features:**
- Automatically deletes old profile picture if exists
- Applies image transformations (400x400, face crop, auto quality)
- Stores in `users/dp` folder on Cloudinary

---

### 2. Retrieve Profile Picture
**GET** `/api/dp/retrieve?userId={userId}`

Get a specific user's profile picture by their ID.

**Request:**
- Method: `GET`
- Query Parameters: `userId` (required)

**Response:**
```json
{
  "success": true,
  "message": "Profile picture retrieved successfully",
  "data": {
    "avatar": "https://res.cloudinary.com/.../users/dp/dp_userid_timestamp.jpg",
    "hasAvatar": true,
    "userId": "user_id_here",
    "username": "username_here"
  }
}
```

**No Avatar Response:**
```json
{
  "success": true,
  "message": "No profile picture found",
  "data": {
    "avatar": null,
    "hasAvatar": false
  }
}
```

---

### 3. Retrieve Profile Picture by User ID (POST)
**POST** `/api/dp/retrieve`

Get a specific user's profile picture by their ID (alternative method).

**Request:**
- Method: `POST`
- Content-Type: `application/json`
- Body: `{ "userId": "user_id_here" }`

**Response:**
```json
{
  "success": true,
  "message": "Profile picture retrieved successfully",
  "data": {
    "avatar": "https://res.cloudinary.com/.../users/dp/dp_userid_timestamp.jpg",
    "hasAvatar": true,
    "username": "username_here",
    "fullName": "Full Name Here"
  }
}
```

---

### 4. Delete Profile Picture
**DELETE** `/api/dp/delete`

Remove a specific user's profile picture.

**Request:**
- Method: `DELETE`
- Content-Type: `application/json`
- Body: `{ "userId": "user_id_here" }`

**Response:**
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

**No Avatar Response:**
```json
{
  "success": true,
  "message": "No profile picture to delete",
  "data": {
    "deleted": false,
    "reason": "No profile picture exists"
  }
}
```

**Features:**
- Removes image from Cloudinary
- Updates user profile in database
- Gracefully handles cases where no avatar exists

---

### 5. Replace Profile Picture
**PUT** `/api/dp/replace`

Replace a specific user's profile picture with a new one.

**Request:**
- Method: `PUT`
- Content-Type: `multipart/form-data`
- Body: Form data with:
  - `dp`: New image file
  - `userId`: User ID string

**File Requirements:**
- Type: Image files only
- Size: Maximum 5MB
- Format: Any standard image format

**Response:**
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

**Features:**
- Uploads new image first, then deletes old one
- Ensures no data loss during replacement
- Applies same image transformations as upload

---

## Error Responses

### Bad Request (400)
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

### Not Found (404)
```json
{
  "error": "User not found"
}
```

### Internal Server Error (500)
```json
{
  "error": "Internal server error"
}
```

---

## Image Transformations

All uploaded images are automatically processed with the following transformations:
- **Size**: 400x400 pixels
- **Crop**: Fill with face detection
- **Quality**: Automatic optimization
- **Folder**: `users/dp` on Cloudinary

---

## Usage Examples

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

---

## Environment Variables Required

Make sure these environment variables are set in your `.env.local` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## Notes

1. **No Authentication**: APIs now use User ID instead of session cookies
2. **User ID Required**: All endpoints require a valid User ID
3. **File Validation**: Only image files are accepted with size limit of 5MB
4. **Automatic Cleanup**: Old profile pictures are automatically deleted when replaced
5. **Error Handling**: Graceful error handling with detailed error messages
6. **Image Optimization**: Automatic image resizing and quality optimization
7. **Cloudinary Integration**: Seamless integration with Cloudinary for image storage and management

## ⚠️ Security Note

**This API setup removes authentication requirements for easier testing. In production, you should implement proper authentication and authorization mechanisms to secure these endpoints.**
