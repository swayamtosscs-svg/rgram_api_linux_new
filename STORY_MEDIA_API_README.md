# Story Media API Documentation

This document describes the Story Media API endpoints for uploading, retrieving, and deleting story media to/from Cloudinary with user ID organization.

## Overview

The Story Media API provides three main endpoints:
- **Upload**: Upload story media (images/videos) to Cloudinary in user-specific folders
- **Retrieve**: Fetch stories from the database with pagination and filtering
- **Delete**: Remove stories from both Cloudinary and the database

## Cloudinary Folder Structure

All story media is organized in Cloudinary using the following folder structure:
```
users/{username}/story/{mediaType}/{filename}
```

**Examples:**
- **Images**: `users/johndoe/story/image/johndoe_story_1703123456789`
- **Videos**: `users/johndoe/story/video/johndoe_story_1703123456789`

## API Endpoints

### 1. Upload Story Media

**Endpoint:** `POST /api/story/upload`

**Description:** Uploads story media (image or video) to Cloudinary and creates a story record in the database.

**Content-Type:** `multipart/form-data`

**Form Data Parameters:**
- `file` (required): The media file (image or video)
- `userId` (required): MongoDB ObjectId of the user
- `caption` (optional): Story caption (max 200 characters)
- `mentions` (optional): JSON array of user IDs to mention
- `hashtags` (optional): JSON array of hashtag strings
- `location` (optional): Location string (max 100 characters)

**Supported File Types:**
- **Images:** jpg, jpeg, png, gif, webp, bmp, svg
- **Videos:** mp4, avi, mov, wmv, flv, webm, mkv

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/story/upload \
  -F "file=@story.jpg" \
  -F "userId=507f1f77bcf86cd799439011" \
  -F "caption=My amazing story!" \
  -F "hashtags=[\"fun\", \"life\"]" \
  -F "location=New York"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Story uploaded successfully",
  "data": {
    "storyId": "507f1f77bcf86cd799439012",
    "publicId": "johndoe_story_1703123456789",
    "secureUrl": "https://res.cloudinary.com/cloud/image/upload/v1/users/johndoe/story/johndoe_story_1703123456789.jpg",
    "folderPath": "users/johndoe/story",
    "fileName": "johndoe_story_1703123456789.jpg",
    "mediaType": "image",
    "fileSize": 1024000,
    "dimensions": {
      "width": 1920,
      "height": 1080
    },
    "duration": null,
    "author": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "fullName": "John Doe"
    },
    "caption": "My amazing story!",
    "mentions": [],
    "hashtags": ["fun", "life"],
    "location": "New York",
    "expiresAt": "2024-01-22T10:30:56.789Z",
    "createdAt": "2024-01-21T10:30:56.789Z"
  }
}
```

**Error Responses:**
- `400`: Invalid content type, missing required fields, unsupported file format
- `404`: User not found
- `413`: File too large
- `500`: Server error, Cloudinary configuration error

---

### 2. Retrieve Stories

**Endpoint:** `GET /api/story/retrieve`

**Description:** Retrieves stories based on user ID or specific story ID with pagination and filtering options.

**Query Parameters:**
- `userId` (optional): MongoDB ObjectId of the user to get stories for
- `storyId` (optional): MongoDB ObjectId of a specific story
- `type` (optional): Filter by media type (`image` or `video`)
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of items per page (default: 10)
- `sortBy` (optional): Field to sort by (default: `createdAt`)
- `sortOrder` (optional): Sort order (`asc` or `desc`, default: `desc`)
- `includeExpired` (optional): Include expired stories (`true` or `false`, default: `false`)

**Note:** Either `userId` or `storyId` must be provided.

**Example Requests:**

**Get user's stories:**
```bash
curl "http://localhost:3000/api/story/retrieve?userId=507f1f77bcf86cd799439011&page=1&limit=5&type=image"
```

**Get specific story:**
```bash
curl "http://localhost:3000/api/story/retrieve?storyId=507f1f77bcf86cd799439012"
```

**Get expired stories:**
```bash
curl "http://localhost:3000/api/story/retrieve?userId=507f1f77bcf86cd799439011&includeExpired=true"
```

**Success Response (200):**

**For specific story:**
```json
{
  "success": true,
  "data": {
    "story": {
      "id": "507f1f77bcf86cd799439012",
      "media": "https://res.cloudinary.com/cloud/image/upload/v1/users/johndoe/story/johndoe_story_1703123456789.jpg",
      "type": "image",
      "caption": "My amazing story!",
      "mentions": [],
      "hashtags": ["fun", "life"],
      "location": "New York",
      "isActive": true,
      "isExpired": false,
      "expiresAt": "2024-01-22T10:30:56.789Z",
      "views": [],
      "viewsCount": 0,
      "author": {
        "id": "507f1f77bcf86cd799439011",
        "username": "johndoe",
        "fullName": "John Doe",
        "avatar": "https://example.com/avatar.jpg"
      },
      "createdAt": "2024-01-21T10:30:56.789Z",
      "updatedAt": "2024-01-21T10:30:56.789Z"
    }
  }
}
```

**For user's stories:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe",
      "fullName": "John Doe",
      "avatar": "https://example.com/avatar.jpg"
    },
    "stories": [...],
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

**Error Responses:**
- `400`: Invalid ID format, missing required parameters
- `404`: User or story not found
- `500`: Server error

---

### 3. Delete Story

**Endpoint:** `DELETE /api/story/delete`

**Description:** Deletes a specific story from both Cloudinary and the database.

**Query Parameters:**
- `storyId` (required): MongoDB ObjectId of the story to delete
- `userId` (required): MongoDB ObjectId of the user (for authorization)
- `publicId` (optional): Cloudinary public ID (auto-extracted if not provided)

**Example Request:**
```bash
curl -X DELETE "http://localhost:3000/api/story/delete?storyId=507f1f77bcf86cd799439012&userId=507f1f77bcf86cd799439011"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Story deleted successfully",
  "data": {
    "storyId": "507f1f77bcf86cd799439012",
    "deletedFromCloudinary": true,
    "deletedFromDatabase": true,
    "mediaType": "image",
    "author": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe"
    }
  }
}
```

**Error Responses:**
- `400`: Invalid ID format, missing required parameters
- `403`: Unauthorized (user can only delete their own stories)
- `404`: User or story not found
- `500`: Server error

---

### 4. Bulk Delete Stories

**Endpoint:** `POST /api/story/delete`

**Description:** Deletes multiple stories for a user (useful for cleanup operations).

**Query Parameters:**
- `userId` (required): MongoDB ObjectId of the user
- `deleteExpired` (optional): Delete expired stories only (`true` or `false`, default: `false`)

**Example Request:**
```bash
curl -X POST "http://localhost:3000/api/story/delete?userId=507f1f77bcf86cd799439011&deleteExpired=true"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Bulk story deletion completed",
  "data": {
    "totalStories": 15,
    "deletedFromCloudinary": 14,
    "deletedFromDatabase": 15,
    "author": {
      "id": "507f1f77bcf86cd799439011",
      "username": "johndoe"
    }
  }
}
```

---

### 5. Add Story View

**Endpoint:** `POST /api/story/retrieve`

**Description:** Adds a view to a specific story (increment view count).

**Query Parameters:**
- `storyId` (required): MongoDB ObjectId of the story
- `userId` (required): MongoDB ObjectId of the user viewing the story

**Example Request:**
```bash
curl -X POST "http://localhost:3000/api/story/retrieve?storyId=507f1f77bcf86cd799439012&userId=507f1f77bcf86cd799439011"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "View added successfully",
  "data": {
    "storyId": "507f1f77bcf86cd799439012",
    "viewsCount": 5,
    "hasViewed": true
  }
}
```

---

## Story Model Schema

```typescript
interface IStory {
  _id: string;
  author: mongoose.Types.ObjectId;        // Reference to User
  media: string;                          // Cloudinary URL
  type: 'image' | 'video';               // Media type
  caption?: string;                       // Story caption (max 200 chars)
  mentions: mongoose.Types.ObjectId[];    // Array of mentioned user IDs
  hashtags: string[];                     // Array of hashtags
  location?: string;                      // Location (max 100 chars)
  isActive: boolean;                      // Story active status
  expiresAt: Date;                        // Expiration date (24 hours from creation)
  views: mongoose.Types.ObjectId[];       // Array of user IDs who viewed
  viewsCount: number;                     // Total view count
  createdAt: Date;                        // Creation timestamp
  updatedAt: Date;                        // Last update timestamp
}
```

## Story Expiration & Auto-Cleanup

- Stories automatically expire after 24 hours from creation
- Expired stories are filtered out by default in retrieval queries
- Use `includeExpired=true` to include expired stories
- Expired stories can be bulk deleted using the bulk delete endpoint
- **Automatic cleanup**: Expired stories are automatically deleted every hour

### Auto-Cleanup Scripts

**Manual cleanup:**
```bash
npm run cleanup-stories
```

**Scheduled cleanup (runs every hour):**
```bash
npm run cleanup-scheduled
```

**Note:** The scheduled cleanup service runs continuously and automatically removes expired stories every hour.

## Error Handling

The API provides comprehensive error handling with:
- HTTP status codes
- Descriptive error messages
- Detailed error information in development mode
- Graceful fallbacks for Cloudinary operations

## Rate Limiting

Consider implementing rate limiting for production use:
- Upload: Limit per user per hour
- Retrieve: Limit per IP per minute
- Delete: Limit per user per hour

## Security Considerations

- User authentication required for all operations
- Users can only delete their own stories
- File type validation prevents malicious uploads
- File size limits should be configured in your web server

## Environment Variables

Ensure these environment variables are set:
```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
MONGODB_URI=your_mongodb_connection_string
```

## Testing

Use the provided test files or create your own using tools like:
- Postman
- cURL
- Thunder Client (VS Code extension)
- Insomnia

## Support

For issues or questions, please refer to the main project documentation or create an issue in the repository.
