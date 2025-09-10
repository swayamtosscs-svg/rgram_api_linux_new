# Test Posts Cloudinary Integration

## Complete Test Workflow

### 1. Create Post with Image (Shows Cloudinary URL)
```bash
curl -X POST "http://localhost:3000/api/baba-pages/64a1b2c3d4e5f6789012345/posts" \
  -F "content=Test post with Cloudinary image upload" \
  -F "media=@/path/to/test-image.jpg" \
  -v
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "_id": "64a1b2c3d4e5f6789012346",
    "babaPageId": "64a1b2c3d4e5f6789012345",
    "content": "Test post with Cloudinary image upload",
    "media": [
      {
        "type": "image",
        "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/baba-pages/64a1b2c3d4e5f6789012345/posts/posts_1234567890_abc123.jpg",
        "filename": "posts_1234567890_abc123.jpg",
        "size": 1024000,
        "mimeType": "image/jpeg",
        "publicId": "baba-pages/64a1b2c3d4e5f6789012345/posts/posts_1234567890_abc123"
      }
    ],
    "likesCount": 0,
    "commentsCount": 0,
    "sharesCount": 0,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Create Post with Video (Shows Cloudinary URL)
```bash
curl -X POST "http://localhost:3000/api/baba-pages/64a1b2c3d4e5f6789012345/posts" \
  -F "content=Test post with Cloudinary video upload" \
  -F "media=@/path/to/test-video.mp4" \
  -v
```

### 3. Create Post with Multiple Images (Shows All Cloudinary URLs)
```bash
curl -X POST "http://localhost:3000/api/baba-pages/64a1b2c3d4e5f6789012345/posts" \
  -F "content=Test post with multiple Cloudinary images" \
  -F "media=@/path/to/image1.jpg" \
  -F "media=@/path/to/image2.jpg" \
  -F "media=@/path/to/image3.jpg" \
  -v
```

### 4. Get All Posts (Shows Cloudinary URLs)
```bash
curl -X GET "http://localhost:3000/api/baba-pages/64a1b2c3d4e5f6789012345/posts" \
  -v
```

### 5. Get Specific Post (Shows Cloudinary URLs)
```bash
curl -X GET "http://localhost:3000/api/baba-pages/64a1b2c3d4e5f6789012345/posts/64a1b2c3d4e5f6789012346" \
  -v
```

### 6. Delete Post (Deletes from Cloudinary)
```bash
curl -X DELETE "http://localhost:3000/api/baba-pages/64a1b2c3d4e5f6789012345/posts/64a1b2c3d4e5f6789012346" \
  -v
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

## Complete Test Script

```bash
#!/bin/bash

# Set your page ID here
PAGE_ID="64a1b2c3d4e5f6789012345"
BASE_URL="http://localhost:3000/api/baba-pages"

echo "=== Testing Posts Cloudinary Integration ==="

# 1. Create post with image
echo "1. Creating post with image..."
POST_RESPONSE=$(curl -s -X POST "$BASE_URL/$PAGE_ID/posts" \
  -F "content=Test post with Cloudinary image" \
  -F "media=@/path/to/test-image.jpg")

echo "Post created response:"
echo $POST_RESPONSE | jq '.'

# Extract post ID
POST_ID=$(echo $POST_RESPONSE | jq -r '.data._id')
echo "Created post ID: $POST_ID"

# 2. Get the post to verify Cloudinary URL
echo -e "\n2. Getting post to verify Cloudinary URL..."
curl -s -X GET "$BASE_URL/$PAGE_ID/posts/$POST_ID" | jq '.'

# 3. Get all posts
echo -e "\n3. Getting all posts..."
curl -s -X GET "$BASE_URL/$PAGE_ID/posts" | jq '.'

# 4. Delete the post (this should delete from Cloudinary)
echo -e "\n4. Deleting post (should delete from Cloudinary)..."
DELETE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/$PAGE_ID/posts/$POST_ID")
echo "Delete response:"
echo $DELETE_RESPONSE | jq '.'

# 5. Verify post is deleted
echo -e "\n5. Verifying post is deleted..."
curl -s -X GET "$BASE_URL/$PAGE_ID/posts/$POST_ID" | jq '.'

echo -e "\n=== Test Complete ==="
```

## Verification Steps

### 1. Check Cloudinary Console
After creating posts, check your Cloudinary console to verify:
- Files are uploaded to: `baba-pages/{pageId}/posts/`
- URLs are accessible
- Files have proper naming convention

### 2. Check Cloudinary After Deletion
After deleting posts, verify in Cloudinary console:
- Files are removed from the folder
- No orphaned files remain

### 3. Test Different File Types
```bash
# Test JPG
curl -X POST "http://localhost:3000/api/baba-pages/$PAGE_ID/posts" \
  -F "content=JPG test" \
  -F "media=@/path/to/image.jpg"

# Test PNG
curl -X POST "http://localhost:3000/api/baba-pages/$PAGE_ID/posts" \
  -F "content=PNG test" \
  -F "media=@/path/to/image.png"

# Test MP4
curl -X POST "http://localhost:3000/api/baba-pages/$PAGE_ID/posts" \
  -F "content=MP4 test" \
  -F "media=@/path/to/video.mp4"
```

## Expected Cloudinary URLs

All media URLs should follow this pattern:
```
https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/baba-pages/{pageId}/posts/{filename}
```

Example:
```
https://res.cloudinary.com/mycloud/image/upload/v1756191446/baba-pages/64a1b2c3d4e5f6789012345/posts/posts_1756191446123_abc123.jpg
```

## Troubleshooting

### If Cloudinary URLs are not showing:
1. Check environment variables
2. Verify Cloudinary configuration
3. Check server logs for upload errors

### If deletion is not working:
1. Check Cloudinary console for remaining files
2. Verify publicId extraction
3. Check server logs for deletion errors

### If files are not uploading:
1. Check file size limits
2. Verify file format support
3. Check Cloudinary account limits

