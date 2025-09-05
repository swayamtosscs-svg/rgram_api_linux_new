# Baba Pages API Documentation

This API provides comprehensive functionality for managing spiritual leader (Baba) pages where different Babas can upload and manage their content including posts, videos, and stories.

## Overview

The Baba Pages API allows spiritual leaders to:
- Create and manage their personal pages
- Upload and manage posts with images
- Upload and manage videos with thumbnails
- Create and manage stories (24-hour content)
- Track followers and engagement metrics
- Organize content by categories and tags

## File Structure

```
public/babaji-pages/
├── {babaId}/
│   ├── posts/
│   │   └── post_{timestamp}_{random}.webp
│   ├── videos/
│   │   ├── video_{timestamp}_{random}.{ext}
│   │   └── thumb_{timestamp}_{random}.webp
│   └── stories/
│       ├── story_{timestamp}_{random}.{ext}
│       └── thumb_{timestamp}_{random}.webp
```

## API Endpoints

### 1. Baba Management

#### Create Baba Page
**POST** `/api/baba`

Create a new Baba page.

**Request Body:**
```json
{
  "babaId": "baba_ramdev",
  "babaName": "Baba Ramdev",
  "spiritualName": "Swami Ramdev",
  "description": "Yoga guru and spiritual leader",
  "location": "Haridwar, India",
  "ashram": "Patanjali Yogpeeth",
  "socialLinks": {
    "website": "https://patanjaliyogpeeth.net",
    "youtube": "https://youtube.com/babarramdev"
  },
  "contactInfo": {
    "email": "contact@patanjaliyogpeeth.net",
    "phone": "+91-1234567890"
  },
  "spiritualTeachings": ["Yoga", "Meditation", "Ayurveda"],
  "languages": ["Hindi", "English", "Sanskrit"],
  "createdBy": "64f1a2b3c4d5e6f7g8h9i0j1"
}
```

#### Get Baba Pages
**GET** `/api/baba`

Retrieve all Baba pages with pagination and search.

**Query Parameters:**
- `babaId` (optional): Get specific Baba page
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search in name, description, location

#### Update Baba Page
**PUT** `/api/baba`

Update Baba page information.

#### Delete Baba Page
**DELETE** `/api/baba?babaId={babaId}`

Soft delete a Baba page.

### 2. Baba Posts

#### Create Post
**POST** `/api/baba/posts`

Upload a new post with optional image.

**Request (multipart/form-data):**
- `babaId` (required): Baba's ID
- `title` (required): Post title
- `content` (required): Post content
- `image` (optional): Image file
- `category` (optional): Post category
- `tags` (optional): JSON array of tags
- `isPublic` (optional): Public visibility

#### Get Posts
**GET** `/api/baba/posts`

Retrieve Baba's posts with pagination and filtering.

**Query Parameters:**
- `babaId` (required): Baba's ID
- `postId` (optional): Get specific post
- `page` (optional): Page number
- `limit` (optional): Items per page
- `category` (optional): Filter by category
- `search` (optional): Search in title/content

#### Delete Post
**DELETE** `/api/baba/posts?postId={postId}`

Delete a post and its associated image.

### 3. Baba Videos

#### Upload Video
**POST** `/api/baba/videos`

Upload a new video with optional thumbnail.

**Request (multipart/form-data):**
- `babaId` (required): Baba's ID
- `title` (required): Video title
- `description` (optional): Video description
- `video` (required): Video file
- `thumbnail` (optional): Thumbnail image
- `category` (optional): Video category
- `tags` (optional): JSON array of tags
- `isPublic` (optional): Public visibility

#### Get Videos
**GET** `/api/baba/videos`

Retrieve Baba's videos with pagination and filtering.

**Query Parameters:**
- `babaId` (required): Baba's ID
- `videoId` (optional): Get specific video
- `page` (optional): Page number
- `limit` (optional): Items per page
- `category` (optional): Filter by category
- `search` (optional): Search in title/description

#### Delete Video
**DELETE** `/api/baba/videos?videoId={videoId}`

Delete a video and its associated files.

### 4. Baba Stories

#### Create Story
**POST** `/api/baba/stories`

Upload a new story (image or video).

**Request (multipart/form-data):**
- `babaId` (required): Baba's ID
- `media` (required): Image or video file
- `content` (optional): Story text
- `category` (optional): Story category

#### Get Stories
**GET** `/api/baba/stories`

Retrieve Baba's active stories.

**Query Parameters:**
- `babaId` (required): Baba's ID
- `storyId` (optional): Get specific story
- `page` (optional): Page number
- `limit` (optional): Items per page
- `category` (optional): Filter by category

#### Delete Story
**DELETE** `/api/baba/stories?storyId={storyId}`

Delete a story and its associated files.

## Database Models

### Baba Model
```typescript
{
  babaId: String,           // Unique identifier
  babaName: String,         // Display name
  spiritualName: String,    // Spiritual title
  description: String,      // Bio/description
  avatar: String,           // Profile picture URL
  coverImage: String,       // Cover image URL
  location: String,         // Physical location
  ashram: String,           // Ashram/temple name
  followersCount: Number,   // Follower count
  postsCount: Number,       // Post count
  videosCount: Number,      // Video count
  storiesCount: Number,     // Story count
  isActive: Boolean,        // Active status
  isVerified: Boolean,      // Verification status
  socialLinks: Object,      // Social media links
  contactInfo: Object,      // Contact information
  spiritualTeachings: [String], // Teaching topics
  languages: [String],      // Spoken languages
  createdBy: ObjectId,      // Creator user ID
  lastActive: Date          // Last activity
}
```

### BabaPost Model
```typescript
{
  babaId: String,           // Baba's ID
  title: String,            // Post title
  content: String,          // Post content
  imageUrl: String,         // Image URL
  imagePath: String,        // Local file path
  publicUrl: String,        // Public access URL
  category: String,         // Post category
  tags: [String],           // Post tags
  isPublic: Boolean,        // Public visibility
  likesCount: Number,       // Like count
  commentsCount: Number,    // Comment count
  sharesCount: Number,      // Share count
  viewsCount: Number,       // View count
  featured: Boolean,        // Featured status
  publishedAt: Date         // Publication date
}
```

### BabaVideo Model
```typescript
{
  babaId: String,           // Baba's ID
  title: String,            // Video title
  description: String,      // Video description
  videoUrl: String,         // Video URL
  videoPath: String,        // Local file path
  publicUrl: String,        // Public access URL
  thumbnailUrl: String,     // Thumbnail URL
  thumbnailPath: String,    // Thumbnail file path
  duration: Number,         // Duration in seconds
  fileSize: Number,         // File size in bytes
  resolution: Object,       // Video resolution
  format: String,           // Video format
  category: String,         // Video category
  tags: [String],           // Video tags
  isPublic: Boolean,        // Public visibility
  isLive: Boolean,          // Live video status
  likesCount: Number,       // Like count
  viewsCount: Number,       // View count
  sharesCount: Number,      // Share count
  commentsCount: Number,    // Comment count
  featured: Boolean,        // Featured status
  publishedAt: Date         // Publication date
}
```

### BabaStory Model
```typescript
{
  babaId: String,           // Baba's ID
  content: String,          // Story text
  mediaType: String,        // 'image' or 'video'
  mediaUrl: String,         // Media URL
  mediaPath: String,        // Local file path
  publicUrl: String,        // Public access URL
  thumbnailUrl: String,     // Thumbnail URL (for videos)
  thumbnailPath: String,    // Thumbnail file path
  duration: Number,         // Duration in seconds (for videos)
  fileSize: Number,         // File size in bytes
  format: String,           // File format
  category: String,         // Story category
  isPublic: Boolean,        // Public visibility
  viewsCount: Number,       // View count
  likesCount: Number,       // Like count
  sharesCount: Number,      // Share count
  expiresAt: Date,          // Expiration date (24 hours)
  publishedAt: Date         // Publication date
}
```

## Features

### Image Processing
- Automatic image optimization using Sharp
- WebP conversion for better compression
- Automatic resizing for posts (1200x800) and stories (1080x1080)
- Quality optimization (85% for posts, 90% for stories)

### Video Processing
- Support for multiple video formats
- Automatic thumbnail generation
- File size validation (500MB max for videos)
- Duration tracking

### Story Management
- 24-hour expiration (automatic cleanup)
- Support for both images and videos
- Square format optimization for mobile
- Automatic thumbnail generation for videos

### Content Organization
- Category-based filtering
- Tag-based search
- Pagination support
- Search functionality
- Featured content support

## Usage Examples

### Create a Baba Page
```bash
curl -X POST http://localhost:3000/api/baba \
  -H "Content-Type: application/json" \
  -d '{
    "babaId": "baba_ramdev",
    "babaName": "Baba Ramdev",
    "spiritualName": "Swami Ramdev",
    "description": "Yoga guru and spiritual leader",
    "location": "Haridwar, India",
    "ashram": "Patanjali Yogpeeth",
    "createdBy": "64f1a2b3c4d5e6f7g8h9i0j1"
  }'
```

### Upload a Post with Image
```bash
curl -X POST http://localhost:3000/api/baba/posts \
  -F "babaId=baba_ramdev" \
  -F "title=Daily Yoga Practice" \
  -F "content=Today we will learn the benefits of Surya Namaskar" \
  -F "image=@yoga-pose.jpg" \
  -F "category=teaching" \
  -F "tags=[\"yoga\", \"health\", \"meditation\"]"
```

### Upload a Video
```bash
curl -X POST http://localhost:3000/api/baba/videos \
  -F "babaId=baba_ramdev" \
  -F "title=Morning Satsang" \
  -F "description=Today's spiritual discourse on inner peace" \
  -F "video=@satsang.mp4" \
  -F "thumbnail=@thumbnail.jpg" \
  -F "category=satsang"
```

### Create a Story
```bash
curl -X POST http://localhost:3000/api/baba/stories \
  -F "babaId=baba_ramdev" \
  -F "media=@daily-blessing.jpg" \
  -F "content=May you all be blessed with peace and prosperity" \
  -F "category=blessing"
```

### Get Baba's Content
```bash
# Get all posts
curl "http://localhost:3000/api/baba/posts?babaId=baba_ramdev&page=1&limit=10"

# Get all videos
curl "http://localhost:3000/api/baba/videos?babaId=baba_ramdev&page=1&limit=10"

# Get all stories
curl "http://localhost:3000/api/baba/stories?babaId=baba_ramdev&page=1&limit=20"
```

## Error Handling

The API provides comprehensive error handling with:
- Detailed error messages
- HTTP status codes
- Validation errors
- File system errors
- Database errors

## Security Features

- User authentication required for content creation
- File type validation
- File size limits
- Path traversal protection
- Input sanitization
- SQL injection prevention

## Performance Optimizations

- Database indexing for fast queries
- Pagination support
- Efficient file operations
- Image optimization
- Lazy loading support
- Caching strategies

## Dependencies

- `sharp`: Image processing and optimization
- `mongoose`: MongoDB ODM
- `fs/promises`: File system operations
- `path`: Path utilities

## Notes

- Stories automatically expire after 24 hours
- All images are optimized and converted to WebP
- Videos are stored as-is with generated thumbnails
- Content is organized in baba-specific folders
- All operations are logged for debugging
- Database models include proper indexing for performance
