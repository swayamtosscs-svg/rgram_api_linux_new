# Asset Upload API - cURL Commands

## Authentication
First, get your authentication token by logging in:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

## Posts API - Asset Upload

### 1. Create Post with Image
```bash
curl -X POST http://localhost:3000/api/posts/enhanced \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "content=Check out this amazing photo!" \
  -F "type=post" \
  -F "category=general" \
  -F "mediaFiles=@/path/to/your/image.jpg"
```

### 2. Create Post with Multiple Images
```bash
curl -X POST http://localhost:3000/api/posts/enhanced \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "content=Multiple photos from my trip!" \
  -F "type=post" \
  -F "category=lifestyle" \
  -F "mediaFiles=@/path/to/image1.jpg" \
  -F "mediaFiles=@/path/to/image2.jpg" \
  -F "mediaFiles=@/path/to/image3.jpg"
```

### 3. Create Post with Video
```bash
curl -X POST http://localhost:3000/api/posts/enhanced \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "content=Amazing video content!" \
  -F "type=post" \
  -F "category=entertainment" \
  -F "mediaFiles=@/path/to/your/video.mp4"
```

### 4. Create Post with Song (Audio + Thumbnail)
```bash
curl -X POST http://localhost:3000/api/posts/enhanced \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "content=Listen to this amazing song!" \
  -F "type=post" \
  -F "category=music" \
  -F "songTitle=Amazing Song" \
  -F "songArtist=Cool Artist" \
  -F "songDuration=180" \
  -F "audioFile=@/path/to/song.mp3" \
  -F "thumbnailFile=@/path/to/album-cover.jpg"
```

### 5. Create Post with Mixed Media (Images + Video + Song)
```bash
curl -X POST http://localhost:3000/api/posts/enhanced \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "content=Complete multimedia experience!" \
  -F "type=post" \
  -F "category=entertainment" \
  -F "songTitle=Background Music" \
  -F "songArtist=Music Artist" \
  -F "songDuration=240" \
  -F "mediaFiles=@/path/to/image.jpg" \
  -F "mediaFiles=@/path/to/video.mp4" \
  -F "audioFile=@/path/to/background-music.mp3" \
  -F "thumbnailFile=@/path/to/music-thumbnail.jpg"
```

### 6. Get Posts
```bash
curl -X GET "http://localhost:3000/api/posts/enhanced?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 7. Get Posts by Type
```bash
curl -X GET "http://localhost:3000/api/posts/enhanced?type=post&category=music" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 8. Update Post (Change Media)
```bash
curl -X PUT "http://localhost:3000/api/posts/enhanced?postId=POST_ID_HERE" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "content=Updated content with new media!" \
  -F "mediaFiles=@/path/to/new-image.jpg"
```

### 9. Update Post (Change Song)
```bash
curl -X PUT "http://localhost:3000/api/posts/enhanced?postId=POST_ID_HERE" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "songTitle=New Song Title" \
  -F "songArtist=New Artist" \
  -F "songDuration=200" \
  -F "audioFile=@/path/to/new-song.mp3" \
  -F "thumbnailFile=@/path/to/new-thumbnail.jpg"
```

### 10. Delete Post
```bash
curl -X DELETE "http://localhost:3000/api/posts/enhanced?postId=POST_ID_HERE" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Reels API - Asset Upload

### 1. Create Reel with Video
```bash
curl -X POST http://localhost:3000/api/reels/enhanced \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "content=Check out this amazing reel!" \
  -F "title=My Awesome Reel" \
  -F "description=Short video content" \
  -F "category=entertainment" \
  -F "mediaFiles=@/path/to/reel-video.mp4"
```

### 2. Create Reel with Song
```bash
curl -X POST http://localhost:3000/api/reels/enhanced \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "content=Dancing to this awesome track!" \
  -F "title=Dance Reel" \
  -F "category=entertainment" \
  -F "songTitle=Dance Track" \
  -F "songArtist=Dance Artist" \
  -F "songDuration=30" \
  -F "mediaFiles=@/path/to/dance-video.mp4" \
  -F "audioFile=@/path/to/dance-music.mp3" \
  -F "thumbnailFile=@/path/to/dance-thumbnail.jpg"
```

### 3. Get Reels
```bash
curl -X GET "http://localhost:3000/api/reels/enhanced?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Get Trending Reels
```bash
curl -X GET "http://localhost:3000/api/reels/enhanced?trending=true&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Update Reel
```bash
curl -X PUT "http://localhost:3000/api/reels/enhanced?reelId=REEL_ID_HERE" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "content=Updated reel content!" \
  -F "title=Updated Reel Title" \
  -F "mediaFiles=@/path/to/new-reel-video.mp4"
```

### 6. Delete Reel
```bash
curl -X DELETE "http://localhost:3000/api/reels/enhanced?reelId=REEL_ID_HERE" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Stories API - Asset Upload

### 1. Create Story with Image
```bash
curl -X POST http://localhost:3000/api/stories/enhanced \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "content=My day in pictures!" \
  -F "mediaFiles=@/path/to/story-image.jpg"
```

### 2. Create Story with Video
```bash
curl -X POST http://localhost:3000/api/stories/enhanced \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "content=Quick video update!" \
  -F "mediaFiles=@/path/to/story-video.mp4"
```

### 3. Create Story with Song
```bash
curl -X POST http://localhost:3000/api/stories/enhanced \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "content=Sharing my favorite song!" \
  -F "songTitle=My Favorite Song" \
  -F "songArtist=My Favorite Artist" \
  -F "songDuration=60" \
  -F "mediaFiles=@/path/to/story-image.jpg" \
  -F "audioFile=@/path/to/favorite-song.mp3" \
  -F "thumbnailFile=@/path/to/song-thumbnail.jpg"
```

### 4. Create Story with Multiple Media
```bash
curl -X POST http://localhost:3000/api/stories/enhanced \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "content=Multiple updates in one story!" \
  -F "mediaFiles=@/path/to/image1.jpg" \
  -F "mediaFiles=@/path/to/image2.jpg" \
  -F "mediaFiles=@/path/to/video.mp4"
```

### 5. Get Stories
```bash
curl -X GET "http://localhost:3000/api/stories/enhanced?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 6. Get Stories by Author
```bash
curl -X GET "http://localhost:3000/api/stories/enhanced?author=USER_ID_HERE" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 7. Delete Story
```bash
curl -X DELETE "http://localhost:3000/api/stories/enhanced?storyId=STORY_ID_HERE" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Advanced Examples

### 1. Create Post with Mentions and Hashtags
```bash
curl -X POST http://localhost:3000/api/posts/enhanced \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "content=Check out @username and #amazing #content!" \
  -F "type=post" \
  -F "category=general" \
  -F "mediaFiles=@/path/to/image.jpg"
```

### 2. Create Post with Location
```bash
curl -X POST http://localhost:3000/api/posts/enhanced \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "content=Beautiful sunset at the beach!" \
  -F "type=post" \
  -F "category=lifestyle" \
  -F "location=Miami Beach, FL" \
  -F "mediaFiles=@/path/to/sunset.jpg"
```

### 3. Create Post with Religion Category
```bash
curl -X POST http://localhost:3000/api/posts/enhanced \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "content=Peaceful morning meditation" \
  -F "type=post" \
  -F "category=spiritual" \
  -F "religion=Hindu" \
  -F "mediaFiles=@/path/to/temple.jpg"
```

### 4. Create Post with Collaborators
```bash
curl -X POST http://localhost:3000/api/posts/enhanced \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "content=Collaborative project with friends!" \
  -F "type=post" \
  -F "category=general" \
  -F "collaborators=USER_ID_1,USER_ID_2" \
  -F "mediaFiles=@/path/to/collaboration-image.jpg"
```

## File Access URLs

After upload, files are accessible via these URLs:
- **Images**: `http://localhost:3000/assets/images/filename.jpg`
- **Videos**: `http://localhost:3000/assets/videos/filename.mp4`
- **Audio**: `http://localhost:3000/assets/audio/filename.mp3`

## Error Handling Examples

### 1. Test File Type Validation
```bash
# This should fail - unsupported file type
curl -X POST http://localhost:3000/api/posts/enhanced \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "content=Test upload" \
  -F "mediaFiles=@/path/to/document.pdf"
```

### 2. Test File Size Validation
```bash
# This should fail - file too large (if > 50MB)
curl -X POST http://localhost:3000/api/posts/enhanced \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "content=Large file test" \
  -F "mediaFiles=@/path/to/large-file.mp4"
```

### 3. Test Authentication
```bash
# This should fail - no token
curl -X POST http://localhost:3000/api/posts/enhanced \
  -F "content=Unauthorized test" \
  -F "mediaFiles=@/path/to/image.jpg"
```

## Testing Checklist

### ✅ Basic Upload Tests
- [ ] Upload single image
- [ ] Upload multiple images
- [ ] Upload video file
- [ ] Upload audio file
- [ ] Upload song with thumbnail

### ✅ Mixed Media Tests
- [ ] Post with image + song
- [ ] Post with video + song
- [ ] Post with multiple media types
- [ ] Reel with video + song
- [ ] Story with image + song

### ✅ CRUD Operations
- [ ] Create post/reel/story
- [ ] Read/retrieve content
- [ ] Update media files
- [ ] Update song files
- [ ] Delete content and files

### ✅ File Management
- [ ] Verify files saved to correct folders
- [ ] Check public URL accessibility
- [ ] Test file deletion on content delete
- [ ] Test file replacement on update

---

## Quick Test Script

Save this as `test-uploads.sh` and run:

```bash
#!/bin/bash

# Set your token here
TOKEN="YOUR_TOKEN_HERE"
BASE_URL="http://localhost:3000"

echo "Testing Asset Upload API..."

# Test 1: Upload image post
echo "1. Testing image upload..."
curl -X POST $BASE_URL/api/posts/enhanced \
  -H "Authorization: Bearer $TOKEN" \
  -F "content=Test image upload" \
  -F "type=post" \
  -F "mediaFiles=@test-image.jpg"

echo -e "\n2. Testing video upload..."
curl -X POST $BASE_URL/api/reels/enhanced \
  -H "Authorization: Bearer $TOKEN" \
  -F "content=Test video upload" \
  -F "mediaFiles=@test-video.mp4"

echo -e "\n3. Testing song upload..."
curl -X POST $BASE_URL/api/posts/enhanced \
  -H "Authorization: Bearer $TOKEN" \
  -F "content=Test song upload" \
  -F "songTitle=Test Song" \
  -F "songArtist=Test Artist" \
  -F "songDuration=120" \
  -F "audioFile=@test-song.mp3" \
  -F "thumbnailFile=@test-thumbnail.jpg"

echo -e "\nTesting complete!"
```

Make sure to replace `YOUR_TOKEN_HERE` with your actual authentication token and adjust file paths as needed!
