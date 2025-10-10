# Like API Documentation

This API allows users to like and unlike various types of content including posts, videos, reels, stories, and user assets.

## API Endpoints

### 1. Like Content
**POST** `/api/likes/like`

Like a specific piece of content.

**Headers:**
- `Authorization: Bearer <token>` (required)
- `Content-Type: application/json`

**Request Body:**
```json
{
  "contentType": "post|video|reel|story|userAsset",
  "contentId": "content_id_here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Content liked successfully",
  "data": {
    "likeId": "like_id",
    "contentType": "post",
    "contentId": "content_id",
    "userId": "user_id",
    "likesCount": 15
  }
}
```

### 2. Unlike Content
**DELETE** `/api/likes/unlike`

Unlike a specific piece of content.

**Headers:**
- `Authorization: Bearer <token>` (required)
- `Content-Type: application/json`

**Request Body:**
```json
{
  "contentType": "post|video|reel|story|userAsset",
  "contentId": "content_id_here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Content unliked successfully",
  "data": {
    "contentType": "post",
    "contentId": "content_id",
    "userId": "user_id",
    "likesCount": 14
  }
}
```

### 3. Get Like Count
**GET** `/api/likes/count`

Get the like count and recent likes for a specific piece of content.

**Query Parameters:**
- `contentType`: post|video|reel|story|userAsset (required)
- `contentId`: content_id_here (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "contentType": "post",
    "contentId": "content_id",
    "likesCount": 15,
    "recentLikes": [
      {
        "userId": {
          "username": "user1",
          "fullName": "User One",
          "avatar": "avatar_url"
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "contentLikesCount": 15
  }
}
```

### 4. Check Like Status
**GET** `/api/likes/status`

Check if the current user has liked a specific piece of content.

**Headers:**
- `Authorization: Bearer <token>` (required)

**Query Parameters:**
- `contentType`: post|video|reel|story|userAsset (required)
- `contentId`: content_id_here (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "contentType": "post",
    "contentId": "content_id",
    "userId": "user_id",
    "isLiked": true,
    "likeId": "like_id",
    "likedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 5. Bulk Like Content
**POST** `/api/likes/bulk-like`

Like multiple pieces of content at once (maximum 50 items).

**Headers:**
- `Authorization: Bearer <token>` (required)
- `Content-Type: application/json`

**Request Body:**
```json
{
  "contentType": "post|video|reel|story|userAsset",
  "contentIds": ["content_id_1", "content_id_2", "content_id_3"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully liked 3 content items",
  "data": {
    "contentType": "post",
    "totalRequested": 3,
    "newlyLiked": 3,
    "alreadyLiked": 0,
    "newlyLikedIds": ["content_id_1", "content_id_2", "content_id_3"],
    "alreadyLikedIds": []
  }
}
```

## Content Types

The API supports the following content types:

- **post**: BabaPost content
- **video**: BabaVideo content (regular videos)
- **reel**: BabaVideo content (reels)
- **story**: BabaStory content
- **userAsset**: UserAssets content

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common error codes:
- `400`: Bad Request (invalid parameters)
- `401`: Unauthorized (invalid or missing token)
- `404`: Not Found (content or user not found)
- `405`: Method Not Allowed (wrong HTTP method)
- `500`: Internal Server Error

## Authentication

All endpoints except `/api/likes/count` require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Database Schema

The Like model stores the following information:

```typescript
{
  userId: ObjectId,        // Reference to User
  contentType: String,     // post|video|reel|story|userAsset
  contentId: ObjectId,     // Reference to the content
  createdAt: Date,        // When the like was created
  updatedAt: Date         // When the like was last updated
}
```

## Usage Examples

### Like a Post
```bash
curl -X POST http://localhost:3000/api/likes/like \
  -H "Authorization: Bearer your_token" \
  -H "Content-Type: application/json" \
  -d '{"contentType": "post", "contentId": "post_id_here"}'
```

### Get Like Count for a Video
```bash
curl "http://localhost:3000/api/likes/count?contentType=video&contentId=video_id_here"
```

### Check if User Liked a Story
```bash
curl -H "Authorization: Bearer your_token" \
  "http://localhost:3000/api/likes/status?contentType=story&contentId=story_id_here"
```

## Testing

Use the provided Postman collection (`like-api-postman-collection.json`) to test all endpoints. Make sure to:

1. Set the `base_url` variable to your API URL
2. Set the `auth_token` variable with a valid JWT token
3. Set the `content_id` variables with valid content IDs

## Notes

- Users can only like each piece of content once
- Like counts are automatically updated in the content documents
- The API prevents duplicate likes and handles unlike operations gracefully
- Bulk operations are limited to 50 items per request for performance reasons
- All timestamps are in UTC format
