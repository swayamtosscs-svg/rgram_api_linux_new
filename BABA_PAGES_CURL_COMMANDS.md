# Baba Ji Pages API - cURL Commands

This document contains all the cURL commands for testing the Baba Ji Pages API.

## Base URL
```bash
BASE_URL="http://localhost:3000"
```

## 1. Baba Ji Pages Management

### Create a new Baba Ji page
```bash
curl -X POST "${BASE_URL}/api/baba-pages" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Baba Ramdev",
    "description": "Yoga guru and spiritual leader",
    "location": "Haridwar, India",
    "religion": "Hinduism",
    "website": "https://baba-ramdev.com"
  }'
```

### Get all Baba Ji pages
```bash
# Get all pages
curl -X GET "${BASE_URL}/api/baba-pages"

# Get pages with pagination
curl -X GET "${BASE_URL}/api/baba-pages?page=1&limit=10"

# Search pages
curl -X GET "${BASE_URL}/api/baba-pages?search=ramdev&page=1&limit=10"

# Filter by religion
curl -X GET "${BASE_URL}/api/baba-pages?religion=hinduism&page=1&limit=10"

# Combined search and filter
curl -X GET "${BASE_URL}/api/baba-pages?search=yoga&religion=hinduism&page=1&limit=10"
```

### Get specific Baba Ji page
```bash
curl -X GET "${BASE_URL}/api/baba-pages/PAGE_ID_HERE"
```

### Update Baba Ji page
```bash
curl -X PUT "${BASE_URL}/api/baba-pages/PAGE_ID_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Baba Ramdev",
    "description": "Updated description",
    "location": "Updated Location"
  }'
```

### Delete Baba Ji page
```bash
curl -X DELETE "${BASE_URL}/api/baba-pages/PAGE_ID_HERE"
```

## 2. Posts Management

### Create a new post
```bash
# Post with text only
curl -X POST "${BASE_URL}/api/baba-pages/PAGE_ID_HERE/posts" \
  -F "content=This is a spiritual post about yoga and meditation"

# Post with single image
curl -X POST "${BASE_URL}/api/baba-pages/PAGE_ID_HERE/posts" \
  -F "content=This is a spiritual post with an image" \
  -F "media=@/path/to/image.jpg"

# Post with multiple media files
curl -X POST "${BASE_URL}/api/baba-pages/PAGE_ID_HERE/posts" \
  -F "content=This is a post with multiple media files" \
  -F "media=@/path/to/image1.jpg" \
  -F "media=@/path/to/video1.mp4" \
  -F "media=@/path/to/image2.jpg"
```

### Get all posts for a page
```bash
# Get all posts
curl -X GET "${BASE_URL}/api/baba-pages/PAGE_ID_HERE/posts"

# Get posts with pagination
curl -X GET "${BASE_URL}/api/baba-pages/PAGE_ID_HERE/posts?page=1&limit=10"
```

### Get specific post
```bash
curl -X GET "${BASE_URL}/api/baba-pages/PAGE_ID_HERE/posts/POST_ID_HERE"
```

### Update post
```bash
curl -X PUT "${BASE_URL}/api/baba-pages/PAGE_ID_HERE/posts/POST_ID_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Updated post content"
  }'
```

### Delete post
```bash
curl -X DELETE "${BASE_URL}/api/baba-pages/PAGE_ID_HERE/posts/POST_ID_HERE"
```

## 3. Videos/Reels Management

### Create a new video
```bash
# Video without thumbnail
curl -X POST "${BASE_URL}/api/baba-pages/PAGE_ID_HERE/videos" \
  -F "title=Yoga Session - Morning Practice" \
  -F "description=Daily yoga practice for spiritual growth" \
  -F "category=video" \
  -F "video=@/path/to/video.mp4"

# Video with thumbnail
curl -X POST "${BASE_URL}/api/baba-pages/PAGE_ID_HERE/videos" \
  -F "title=Yoga Session - Morning Practice" \
  -F "description=Daily yoga practice for spiritual growth" \
  -F "category=video" \
  -F "video=@/path/to/video.mp4" \
  -F "thumbnail=@/path/to/thumbnail.jpg"

# Create a reel
curl -X POST "${BASE_URL}/api/baba-pages/PAGE_ID_HERE/videos" \
  -F "title=Quick Meditation" \
  -F "description=Short meditation session" \
  -F "category=reel" \
  -F "video=@/path/to/reel.mp4" \
  -F "thumbnail=@/path/to/thumbnail.jpg"
```

### Get all videos for a page
```bash
# Get all videos
curl -X GET "${BASE_URL}/api/baba-pages/PAGE_ID_HERE/videos"

# Get videos with pagination
curl -X GET "${BASE_URL}/api/baba-pages/PAGE_ID_HERE/videos?page=1&limit=10"

# Filter by category
curl -X GET "${BASE_URL}/api/baba-pages/PAGE_ID_HERE/videos?category=reel&page=1&limit=10"

# Get only videos (not reels)
curl -X GET "${BASE_URL}/api/baba-pages/PAGE_ID_HERE/videos?category=video&page=1&limit=10"
```

### Get specific video
```bash
curl -X GET "${BASE_URL}/api/baba-pages/PAGE_ID_HERE/videos/VIDEO_ID_HERE"
```

### Update video
```bash
curl -X PUT "${BASE_URL}/api/baba-pages/PAGE_ID_HERE/videos/VIDEO_ID_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated video title",
    "description": "Updated video description"
  }'
```

### Delete video
```bash
curl -X DELETE "${BASE_URL}/api/baba-pages/PAGE_ID_HERE/videos/VIDEO_ID_HERE"
```

## 4. Stories Management

### Create a new story
```bash
# Story with image
curl -X POST "${BASE_URL}/api/baba-pages/PAGE_ID_HERE/stories" \
  -F "content=Daily spiritual wisdom" \
  -F "media=@/path/to/story_image.jpg"

# Story with video
curl -X POST "${BASE_URL}/api/baba-pages/PAGE_ID_HERE/stories" \
  -F "content=Quick meditation session" \
  -F "media=@/path/to/story_video.mp4"

# Story without text content
curl -X POST "${BASE_URL}/api/baba-pages/PAGE_ID_HERE/stories" \
  -F "media=@/path/to/image.jpg"
```

### Get all active stories for a page
```bash
curl -X GET "${BASE_URL}/api/baba-pages/PAGE_ID_HERE/stories"
```

### Get specific story
```bash
curl -X GET "${BASE_URL}/api/baba-pages/PAGE_ID_HERE/stories/STORY_ID_HERE"
```

### Delete story (manual deletion)
```bash
curl -X DELETE "${BASE_URL}/api/baba-pages/PAGE_ID_HERE/stories/STORY_ID_HERE"
```

## 5. Complete Workflow Examples

### Example 1: Create a complete Baba Ji page with content

```bash
# Step 1: Create the page
PAGE_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/baba-pages" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Baba Ramdev",
    "description": "Yoga guru and spiritual leader",
    "location": "Haridwar, India",
    "religion": "Hinduism",
    "website": "https://baba-ramdev.com"
  }')

# Extract page ID from response (you'll need to parse this)
echo "Page created: $PAGE_RESPONSE"
# Note: Extract the _id from the response and use it as PAGE_ID

# Step 2: Create a post
curl -X POST "${BASE_URL}/api/baba-pages/PAGE_ID_HERE/posts" \
  -F "content=Welcome to our spiritual journey" \
  -F "media=@/path/to/welcome_image.jpg"

# Step 3: Create a video
curl -X POST "${BASE_URL}/api/baba-pages/PAGE_ID_HERE/videos" \
  -F "title=Morning Yoga Session" \
  -F "description=Start your day with this peaceful yoga session" \
  -F "category=video" \
  -F "video=@/path/to/yoga_video.mp4" \
  -F "thumbnail=@/path/to/yoga_thumbnail.jpg"

# Step 4: Create a story
curl -X POST "${BASE_URL}/api/baba-pages/PAGE_ID_HERE/stories" \
  -F "content=Daily wisdom: Practice makes perfect" \
  -F "media=@/path/to/wisdom_image.jpg"
```

### Example 2: Get all content for a page

```bash
# Get page info
curl -X GET "${BASE_URL}/api/baba-pages/PAGE_ID_HERE"

# Get all posts
curl -X GET "${BASE_URL}/api/baba-pages/PAGE_ID_HERE/posts?page=1&limit=5"

# Get all videos
curl -X GET "${BASE_URL}/api/baba-pages/PAGE_ID_HERE/videos?page=1&limit=5"

# Get all stories
curl -X GET "${BASE_URL}/api/baba-pages/PAGE_ID_HERE/stories"
```

## 6. Testing with Sample Data

### Create multiple Baba Ji pages
```bash
# Baba Ramdev
curl -X POST "${BASE_URL}/api/baba-pages" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Baba Ramdev",
    "description": "Yoga guru and spiritual leader",
    "location": "Haridwar, India",
    "religion": "Hinduism"
  }'

# Baba Nityananda
curl -X POST "${BASE_URL}/api/baba-pages" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Baba Nityananda",
    "description": "Spiritual teacher and healer",
    "location": "Bangalore, India",
    "religion": "Hinduism"
  }'

# Baba Amte
curl -X POST "${BASE_URL}/api/baba-pages" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Baba Amte",
    "description": "Social worker and activist",
    "location": "Maharashtra, India",
    "religion": "Hinduism"
  }'
```

## 7. Error Handling Examples

### Test with invalid data
```bash
# Create page without required name
curl -X POST "${BASE_URL}/api/baba-pages" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "This will fail"
  }'

# Get non-existent page
curl -X GET "${BASE_URL}/api/baba-pages/invalid_id"

# Create post for non-existent page
curl -X POST "${BASE_URL}/api/baba-pages/invalid_id/posts" \
  -F "content=This will fail"
```

## 8. Response Examples

### Successful page creation response:
```json
{
  "success": true,
  "message": "Baba Ji page created successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "Baba Ramdev",
    "description": "Yoga guru and spiritual leader",
    "location": "Haridwar, India",
    "religion": "Hinduism",
    "website": "https://baba-ramdev.com",
    "followersCount": 0,
    "postsCount": 0,
    "videosCount": 0,
    "storiesCount": 0,
    "isActive": true,
    "createdAt": "2023-09-06T10:30:00.000Z",
    "updatedAt": "2023-09-06T10:30:00.000Z"
  }
}
```

### Error response:
```json
{
  "success": false,
  "message": "Name is required and must be at least 2 characters"
}
```

## Notes:
- Replace `PAGE_ID_HERE`, `POST_ID_HERE`, `VIDEO_ID_HERE`, `STORY_ID_HERE` with actual IDs from your responses
- Replace `/path/to/file` with actual file paths on your system
- All media files are stored in `public/assets/baba-pages/[pageId]/` directory
- Stories automatically expire after 24 hours
- Use the cleanup script to remove expired stories: `node scripts/cleanup-expired-baba-stories.js`
