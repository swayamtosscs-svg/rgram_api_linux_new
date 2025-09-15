# MongoDB Delete Operations - Baba Pages API

This document describes the complete MongoDB delete operations for Baba Pages, ensuring that all data is properly removed from the database when delete operations are performed.

## Overview

All delete operations now **actually remove data from MongoDB** instead of using soft delete. This ensures:
- ✅ Data is completely removed from the database
- ✅ No orphaned records remain
- ✅ Storage space is freed up
- ✅ Database queries are more efficient
- ✅ All associated media files are also deleted

## Delete Operations

### 1. Delete Baba Page

**Endpoint:** `DELETE /api/baba-pages/[id]`

**What gets deleted:**
- ✅ The Baba Page document itself
- ✅ All associated posts and their media files
- ✅ All associated videos and their media files
- ✅ All associated stories and their media files
- ✅ Page avatar and cover image files
- ✅ All local storage files

**MongoDB Operations:**
```javascript
// Delete all posts
await BabaPost.deleteMany({ babaPageId: id });

// Delete all videos
await BabaVideo.deleteMany({ babaPageId: id });

// Delete all stories
await BabaStory.deleteMany({ babaPageId: id });

// Delete the page
await BabaPage.findByIdAndDelete(id);
```

**Response:**
```json
{
  "success": true,
  "message": "Baba Ji page deleted successfully from MongoDB",
  "data": {
    "deletedPage": {
      "id": "page_id",
      "name": "Page Name",
      "postsCount": 5,
      "videosCount": 3,
      "storiesCount": 2
    },
    "deletedAt": "2025-01-15T10:30:00.000Z",
    "message": "Baba Ji page and all associated data deleted from MongoDB"
  }
}
```

### 2. Delete Post

**Endpoint:** `DELETE /api/baba-pages/[id]/posts/[postId]`

**What gets deleted:**
- ✅ The Post document from MongoDB
- ✅ All associated media files from local storage
- ✅ Updates page posts count

**MongoDB Operations:**
```javascript
// Delete post media files
for (const media of post.media) {
  if (media.url && media.url.startsWith('/uploads/')) {
    await deleteBabaPageFileByUrl(media.url);
  }
}

// Delete post from MongoDB
await BabaPost.findByIdAndDelete(postId);

// Update page posts count
await BabaPage.findByIdAndUpdate(id, { $inc: { postsCount: -1 } });
```

**Response:**
```json
{
  "success": true,
  "message": "Post deleted successfully from MongoDB and local storage",
  "data": {
    "deletedPost": {
      "id": "post_id",
      "content": "Post content",
      "mediaCount": 3
    },
    "deletedMedia": [...],
    "deletedAt": "2025-01-15T10:30:00.000Z",
    "deletionStatus": {
      "localStorage": "success",
      "database": "success"
    }
  }
}
```

### 3. Delete Video

**Endpoint:** `DELETE /api/baba-pages/[id]/videos/[videoId]`

**What gets deleted:**
- ✅ The Video document from MongoDB
- ✅ Video file from local storage
- ✅ Thumbnail file from local storage
- ✅ Updates page videos count

**MongoDB Operations:**
```javascript
// Delete video file
if (video.video?.url && video.video.url.startsWith('/uploads/')) {
  await deleteBabaPageFileByUrl(video.video.url);
}

// Delete thumbnail file
if (video.thumbnail?.url && video.thumbnail.url.startsWith('/uploads/')) {
  await deleteBabaPageFileByUrl(video.thumbnail.url);
}

// Delete video from MongoDB
await BabaVideo.findByIdAndDelete(videoId);

// Update page videos count
await BabaPage.findByIdAndUpdate(id, { $inc: { videosCount: -1 } });
```

**Response:**
```json
{
  "success": true,
  "message": "Video deleted successfully from MongoDB and local storage",
  "data": {
    "deletedVideo": {
      "id": "video_id",
      "title": "Video Title",
      "category": "reel"
    },
    "deletedFiles": {
      "video": {
        "url": "/uploads/...",
        "success": true
      },
      "thumbnail": {
        "url": "/uploads/...",
        "success": true
      }
    },
    "deletedAt": "2025-01-15T10:30:00.000Z",
    "deletionStatus": {
      "localStorage": "success",
      "database": "success"
    }
  }
}
```

### 4. Delete Story

**Endpoint:** `DELETE /api/baba-pages/[id]/stories/[storyId]`

**What gets deleted:**
- ✅ The Story document from MongoDB
- ✅ Story media file from local storage
- ✅ Updates page stories count

**MongoDB Operations:**
```javascript
// Delete story media file
if (story.media?.url && story.media.url.startsWith('/uploads/')) {
  await deleteBabaPageFileByUrl(story.media.url);
}

// Delete story from MongoDB
await BabaStory.findByIdAndDelete(storyId);

// Update page stories count
await BabaPage.findByIdAndUpdate(id, { $inc: { storiesCount: -1 } });
```

**Response:**
```json
{
  "success": true,
  "message": "Story deleted successfully from MongoDB and local storage",
  "data": {
    "deletedStory": {
      "id": "story_id",
      "content": "Story content",
      "mediaType": "image"
    },
    "deletedMedia": {
      "url": "/uploads/...",
      "success": true
    },
    "deletedAt": "2025-01-15T10:30:00.000Z",
    "deletionStatus": {
      "localStorage": "success",
      "database": "success"
    }
  }
}
```

## Key Changes Made

### Before (Soft Delete)
```javascript
// Old implementation - soft delete
post.isActive = false;
await post.save();
```

### After (Hard Delete)
```javascript
// New implementation - hard delete
await BabaPost.findByIdAndDelete(postId);
```

## Benefits of Hard Delete

1. **Complete Data Removal**: Data is actually removed from MongoDB
2. **Storage Efficiency**: No orphaned records consuming space
3. **Query Performance**: Faster queries without filtering inactive records
4. **Data Integrity**: No confusion about active vs inactive records
5. **Clean Database**: Database stays clean and organized

## Testing

Use the provided test script to verify all delete operations:

```bash
node test-mongodb-delete-operations.js
```

The test script will:
1. Create test data (page, post, video, story)
2. Verify data exists in MongoDB
3. Delete each item individually
4. Verify data is removed from MongoDB
5. Delete the page (cascading delete)
6. Verify all data is removed

## cURL Examples

### Delete Post
```bash
curl -X DELETE http://localhost:3000/api/baba-pages/PAGE_ID/posts/POST_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Delete Video
```bash
curl -X DELETE http://localhost:3000/api/baba-pages/PAGE_ID/videos/VIDEO_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Delete Story
```bash
curl -X DELETE http://localhost:3000/api/baba-pages/PAGE_ID/stories/STORY_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Delete Page (Cascading Delete)
```bash
curl -X DELETE http://localhost:3000/api/baba-pages/PAGE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Verification

After each delete operation, you can verify that data is removed by:

1. **Checking the response**: Look for success message
2. **Querying the database**: Data should not exist
3. **Checking file system**: Media files should be deleted
4. **Running the test script**: Automated verification

## Error Handling

All delete operations include proper error handling:
- ✅ Invalid IDs are caught and reported
- ✅ Missing records are handled gracefully
- ✅ File deletion errors are logged but don't stop the process
- ✅ Database errors are properly reported
- ✅ Rollback is not needed since we're doing hard deletes

## Summary

All Baba Pages delete operations now properly remove data from MongoDB:
- ✅ **Page Delete**: Removes page and all associated data
- ✅ **Post Delete**: Removes post and media files
- ✅ **Video Delete**: Removes video, thumbnail, and media files
- ✅ **Story Delete**: Removes story and media files
- ✅ **Complete Cleanup**: All data is actually removed from the database
- ✅ **File Cleanup**: Associated media files are also deleted
- ✅ **Count Updates**: Page counts are properly updated

The system now ensures that when you delete something, it's completely removed from both MongoDB and local storage, providing a clean and efficient database.
