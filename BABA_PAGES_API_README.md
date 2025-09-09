# Baba Ji Pages API Documentation

This API provides comprehensive functionality for creating and managing Baba Ji pages with posts, videos/reels, and stories. All media files are stored locally in the `public/assets/baba-pages/` directory.

## Features

- ✅ Create Baba Ji pages with auto-generated IDs
- ✅ Upload and manage posts with media
- ✅ Upload and manage videos/reels with thumbnails
- ✅ Upload and manage stories with 24-hour auto-deletion
- ✅ Local storage for all media files
- ✅ Automatic cleanup of expired stories
- ✅ Full CRUD operations for all content types

## API Endpoints

### 1. Baba Ji Pages Management

#### Create a new Baba Ji page
```
POST /api/baba-pages
Content-Type: application/json

{
  "name": "Baba Ramdev",
  "description": "Spiritual leader and yoga guru",
  "location": "Haridwar, India",
  "religion": "Hinduism",
  "website": "https://baba-ramdev.com"
}
```

#### Get all Baba Ji pages
```
GET /api/baba-pages?page=1&limit=10&search=ramdev&religion=hinduism
```

#### Get specific Baba Ji page
```
GET /api/baba-pages/[id]
```

#### Update Baba Ji page
```
PUT /api/baba-pages/[id]
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description"
}
```

#### Delete Baba Ji page
```
DELETE /api/baba-pages/[id]
```

### 2. Posts Management

#### Create a new post
```
POST /api/baba-pages/[id]/posts
Content-Type: multipart/form-data

{
  "content": "This is a spiritual post",
  "media": [file1, file2] // Optional image/video files
}
```

#### Get all posts for a page
```
GET /api/baba-pages/[id]/posts?page=1&limit=10
```

#### Get specific post
```
GET /api/baba-pages/[id]/posts/[postId]
```

#### Update post
```
PUT /api/baba-pages/[id]/posts/[postId]
Content-Type: application/json

{
  "content": "Updated post content"
}
```

#### Delete post
```
DELETE /api/baba-pages/[id]/posts/[postId]
```

### 3. Videos/Reels Management

#### Create a new video/reel
```
POST /api/baba-pages/[id]/videos
Content-Type: multipart/form-data

{
  "title": "Spiritual Video",
  "description": "Video description",
  "category": "reel", // or "video"
  "video": videoFile,
  "thumbnail": thumbnailFile // Optional
}
```

#### Get all videos for a page
```
GET /api/baba-pages/[id]/videos?page=1&limit=10&category=reel
```

#### Get specific video
```
GET /api/baba-pages/[id]/videos/[videoId]
```

#### Update video
```
PUT /api/baba-pages/[id]/videos/[videoId]
Content-Type: application/json

{
  "title": "Updated title",
  "description": "Updated description"
}
```

#### Delete video
```
DELETE /api/baba-pages/[id]/videos/[videoId]
```

### 4. Stories Management

#### Create a new story
```
POST /api/baba-pages/[id]/stories
Content-Type: multipart/form-data

{
  "content": "Story content", // Optional
  "media": mediaFile // Required image/video file
}
```

#### Get all active stories for a page
```
GET /api/baba-pages/[id]/stories
```

#### Get specific story
```
GET /api/baba-pages/[id]/stories/[storyId]
```

#### Delete story (manual deletion)
```
DELETE /api/baba-pages/[id]/stories/[storyId]
```

## File Storage Structure

All media files are stored in the following structure:

```
public/assets/baba-pages/
├── [pageId]/
│   ├── posts/
│   │   ├── post_[timestamp]_[random].jpg
│   │   └── post_[timestamp]_[random].mp4
│   ├── videos/
│   │   ├── video_[timestamp]_[random].mp4
│   │   └── thumb_[timestamp]_[random].jpg
│   └── stories/
│       ├── story_[timestamp]_[random].jpg
│       └── story_[timestamp]_[random].mp4
```

## Database Models

### BabaPage
- `_id`: Auto-generated page ID
- `name`: Page name (required)
- `description`: Page description
- `avatar`: Avatar image URL
- `coverImage`: Cover image URL
- `location`: Location
- `religion`: Religion
- `website`: Website URL
- `followersCount`: Number of followers
- `postsCount`: Number of posts
- `videosCount`: Number of videos
- `storiesCount`: Number of stories
- `isActive`: Active status
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### BabaPost
- `_id`: Auto-generated post ID
- `babaPageId`: Reference to BabaPage
- `content`: Post content
- `media`: Array of media objects
- `likesCount`: Number of likes
- `commentsCount`: Number of comments
- `sharesCount`: Number of shares
- `isActive`: Active status
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### BabaVideo
- `_id`: Auto-generated video ID
- `babaPageId`: Reference to BabaPage
- `title`: Video title
- `description`: Video description
- `video`: Video file object
- `thumbnail`: Thumbnail file object
- `category`: 'reel' or 'video'
- `viewsCount`: Number of views
- `likesCount`: Number of likes
- `commentsCount`: Number of comments
- `sharesCount`: Number of shares
- `isActive`: Active status
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### BabaStory
- `_id`: Auto-generated story ID
- `babaPageId`: Reference to BabaPage
- `content`: Story content
- `media`: Media file object
- `viewsCount`: Number of views
- `likesCount`: Number of likes
- `isActive`: Active status
- `expiresAt`: Auto-expiration timestamp (24 hours)
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

## Auto-Cleanup for Stories

Stories automatically expire after 24 hours. To run the cleanup script:

```bash
node scripts/cleanup-expired-baba-stories.js
```

You can also set up a cron job to run this script periodically:

```bash
# Run every hour
0 * * * * cd /path/to/project && node scripts/cleanup-expired-baba-stories.js
```

## Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

## Error Codes

- `400`: Bad Request - Invalid input data
- `404`: Not Found - Resource not found
- `409`: Conflict - Resource already exists
- `500`: Internal Server Error - Server error

## Usage Examples

### Creating a complete Baba Ji page with content

1. **Create the page:**
```bash
curl -X POST http://localhost:3000/api/baba-pages \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Baba Ramdev",
    "description": "Yoga guru and spiritual leader",
    "location": "Haridwar",
    "religion": "Hinduism"
  }'
```

2. **Upload a post:**
```bash
curl -X POST http://localhost:3000/api/baba-pages/[pageId]/posts \
  -F "content=This is a spiritual message" \
  -F "media=@image.jpg"
```

3. **Upload a video:**
```bash
curl -X POST http://localhost:3000/api/baba-pages/[pageId]/videos \
  -F "title=Yoga Session" \
  -F "description=Daily yoga practice" \
  -F "category=video" \
  -F "video=@yoga_video.mp4" \
  -F "thumbnail=@thumbnail.jpg"
```

4. **Upload a story:**
```bash
curl -X POST http://localhost:3000/api/baba-pages/[pageId]/stories \
  -F "content=Daily wisdom" \
  -F "media=@story_image.jpg"
```

## Notes

- All media files are stored locally in the `public/assets/baba-pages/` directory
- Stories automatically expire after 24 hours and are cleaned up by the cleanup script
- File uploads support both images and videos
- All timestamps are in UTC
- Pagination is available for list endpoints
- Search functionality is available for pages
- All operations are logged for debugging purposes