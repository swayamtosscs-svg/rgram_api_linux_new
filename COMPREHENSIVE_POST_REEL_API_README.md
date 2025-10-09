# Comprehensive Post & Reel API Documentation

This document provides complete documentation for the Post and Reel API system with all social media features including likes, comments, shares, saves, mentions, collaborations, and notifications.

## Table of Contents

1. [Overview](#overview)
2. [Models](#models)
3. [API Endpoints](#api-endpoints)
4. [Authentication](#authentication)
5. [Features](#features)
6. [Usage Examples](#usage-examples)
7. [Error Handling](#error-handling)
8. [File Storage](#file-storage)

## Overview

The Post & Reel API provides a complete social media platform with:
- **Posts**: Text, image, and video posts with full social features
- **Reels**: Short-form video content with song integration
- **Comments**: Nested comment system with mentions
- **Interactions**: Likes, shares, saves, views with real-time counts
- **Notifications**: Real-time notifications for all interactions
- **Local Storage**: File storage in public/assets directory
- **Privacy Controls**: Public/private posts with granular permissions

## Models

### Post Model
```typescript
interface IPost {
  _id: string;
  author: ObjectId;
  content: string;
  type: 'post' | 'reel' | 'story';
  title?: string;
  description?: string;
  category?: string;
  religion?: string;
  location?: string;
  
  // Media
  media: Array<{
    type: 'image' | 'video' | 'audio';
    url: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    dimensions?: { width: number; height: number };
    duration?: number;
    storageType: 'local' | 'cloudinary';
  }>;
  
  // Song for reels
  song?: {
    title: string;
    artist: string;
    url: string;
    fileName: string;
    filePath: string;
    duration: number;
    thumbnailUrl?: string;
    storageType: 'local' | 'cloudinary';
  };
  
  // Social features
  mentions: ObjectId[];
  hashtags: string[];
  tags: string[];
  collaborators: ObjectId[];
  
  // Interaction counts
  likes: ObjectId[];
  likesCount: number;
  comments: ObjectId[];
  commentsCount: number;
  shares: ObjectId[];
  sharesCount: number;
  saves: ObjectId[];
  savesCount: number;
  views: ObjectId[];
  viewsCount: number;
  
  // Privacy and settings
  isPublic: boolean;
  isActive: boolean;
  allowComments: boolean;
  allowLikes: boolean;
  allowShares: boolean;
  allowSaves: boolean;
  
  // Reel specific
  isReel?: boolean;
  reelDuration?: number;
  
  // Story specific
  isStory?: boolean;
  storyExpiry?: Date;
  
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;
}
```

### Comment Model
```typescript
interface IComment {
  _id: string;
  post: ObjectId;
  author: ObjectId;
  content: string;
  parentComment?: ObjectId; // For replies
  mentions: ObjectId[];
  hashtags: string[];
  
  // Interaction counts
  likes: ObjectId[];
  likesCount: number;
  replies: ObjectId[];
  repliesCount: number;
  
  // Media attachments
  media: Array<{
    type: 'image' | 'video' | 'audio';
    url: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    dimensions?: { width: number; height: number };
    duration?: number;
    storageType: 'local' | 'cloudinary';
  }>;
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## API Endpoints

### 1. Posts API

#### Create Post
```bash
POST /api/posts/comprehensive
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data

{
  "content": "This is my post content with @username mention and #hashtag",
  "type": "post",
  "title": "Post Title",
  "description": "Post description",
  "category": "general",
  "religion": "hinduism",
  "location": "Mumbai, India",
  "hashtags": ["trending", "viral"],
  "mentions": ["userId1", "userId2"],
  "collaborators": ["userId3"],
  "allowComments": true,
  "allowLikes": true,
  "allowShares": true,
  "allowSaves": true,
  "isPublic": true,
  "media": [
    {
      "file": File, // Multipart file
      "type": "image"
    }
  ]
}
```

#### Get Posts
```bash
GET /api/posts/comprehensive?page=1&limit=10&type=post&category=general&my_posts=false&following_posts=false&saved_posts=false&user_id=userId
Authorization: Bearer <jwt-token>
```

#### Update Post
```bash
PUT /api/posts/comprehensive?postId=postId
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "content": "Updated content",
  "title": "Updated title",
  "hashtags": ["updated", "tags"],
  "mentions": ["userId1", "userId2"],
  "allowComments": true,
  "allowLikes": true
}
```

#### Delete Post
```bash
DELETE /api/posts/comprehensive?postId=postId
Authorization: Bearer <jwt-token>
```

### 2. Reels API

#### Create Reel
```bash
POST /api/reels/comprehensive
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data

{
  "content": "This is my reel content",
  "title": "Reel Title",
  "description": "Reel description",
  "category": "entertainment",
  "religion": "hinduism",
  "hashtags": ["reel", "viral"],
  "mentions": ["userId1"],
  "collaborators": ["userId2"],
  "reelDuration": 60,
  "videos": [
    {
      "file": File, // Video file
      "type": "video"
    }
  ],
  "song": {
    "file": File, // Audio file
    "title": "Song Title",
    "artist": "Artist Name"
  }
}
```

#### Get Reels
```bash
GET /api/reels/comprehensive?page=1&limit=10&category=entertainment&my_reels=false&following_reels=false&saved_reels=false&user_id=userId
Authorization: Bearer <jwt-token>
```

#### Update Reel
```bash
PUT /api/reels/comprehensive?reelId=reelId
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "content": "Updated reel content",
  "title": "Updated title",
  "hashtags": ["updated", "reel"],
  "reelDuration": 90
}
```

#### Delete Reel
```bash
DELETE /api/reels/comprehensive?reelId=reelId
Authorization: Bearer <jwt-token>
```

### 3. Post Interactions API

#### Like/Unlike Post
```bash
POST /api/posts/interactions?postId=postId
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "action": "like" // or "unlike"
}
```

#### Comment on Post
```bash
POST /api/posts/interactions?postId=postId
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "action": "comment",
  "content": "Great post! @username check this out #amazing",
  "mentions": ["userId1", "userId2"],
  "parentCommentId": "commentId" // Optional, for replies
}
```

#### Share Post
```bash
POST /api/posts/interactions?postId=postId
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "action": "share"
}
```

#### Save/Unsave Post
```bash
POST /api/posts/interactions?postId=postId
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "action": "save" // or "unsave"
}
```

#### View Post
```bash
POST /api/posts/interactions?postId=postId
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "action": "view"
}
```

#### Get Post Interactions
```bash
GET /api/posts/interactions?postId=postId&type=likes
Authorization: Bearer <jwt-token>
```

### 4. Comments API

#### Create Comment
```bash
POST /api/comments/comprehensive
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data

{
  "postId": "postId",
  "content": "This is a comment with @username mention #hashtag",
  "parentCommentId": "commentId", // Optional, for replies
  "mentions": ["userId1", "userId2"],
  "media": [
    {
      "file": File, // Optional media attachment
      "type": "image"
    }
  ]
}
```

#### Get Comments
```bash
GET /api/comments/comprehensive?postId=postId&page=1&limit=20&replies=false
Authorization: Bearer <jwt-token>
```

#### Update Comment
```bash
PUT /api/comments/comprehensive?commentId=commentId
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "content": "Updated comment content",
  "mentions": ["userId1"]
}
```

#### Delete Comment
```bash
DELETE /api/comments/comprehensive?commentId=commentId
Authorization: Bearer <jwt-token>
```

### 5. Comment Interactions API

#### Like/Unlike Comment
```bash
POST /api/comments/interactions?commentId=commentId
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "action": "like" // or "unlike"
}
```

#### Get Comment Interactions
```bash
GET /api/comments/interactions?commentId=commentId&type=likes
Authorization: Bearer <jwt-token>
```

## Authentication

All API endpoints require authentication via JWT token in the Authorization header:

```bash
Authorization: Bearer <jwt-token>
```

## Features

### 1. Media Upload
- **Local Storage**: Files stored in `public/uploads/users/{userId}/{type}/`
- **Supported Types**: Images, videos, audio files
- **File Validation**: Size and type validation
- **Automatic Cleanup**: Files deleted when posts/comments are deleted

### 2. Social Features
- **Likes**: Like/unlike posts and comments
- **Comments**: Nested comment system with replies
- **Shares**: Share posts to other users
- **Saves**: Save posts for later viewing
- **Views**: Track post views with user tracking
- **Mentions**: Mention users with @username
- **Hashtags**: Support for #hashtags
- **Collaborations**: Invite users to collaborate on posts

### 3. Notifications
Real-time notifications for:
- **Mentions**: When mentioned in posts/comments
- **Likes**: When someone likes your post/comment
- **Comments**: When someone comments on your post
- **Replies**: When someone replies to your comment
- **Shares**: When someone shares your post
- **Collaborations**: When invited to collaborate

### 4. Privacy Controls
- **Public/Private Posts**: Control post visibility
- **Interaction Permissions**: Control likes, comments, shares, saves
- **User Blocking**: Block users from interacting
- **Content Moderation**: Report and moderate content

### 5. Search and Filtering
- **By Type**: Filter posts by type (post, reel, story)
- **By Category**: Filter by content category
- **By Religion**: Filter by religious content
- **By Hashtags**: Filter by hashtags
- **By User**: Get posts by specific user
- **Following**: Get posts from followed users
- **Saved**: Get saved posts

## Usage Examples

### Create a Post with Media
```javascript
const formData = new FormData();
formData.append('content', 'Check out this amazing sunset! #sunset #nature');
formData.append('type', 'post');
formData.append('category', 'general');
formData.append('hashtags', JSON.stringify(['sunset', 'nature']));
formData.append('mentions', JSON.stringify(['userId1', 'userId2']));
formData.append('media', imageFile);

const response = await fetch('/api/posts/comprehensive', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### Create a Reel with Song
```javascript
const formData = new FormData();
formData.append('content', 'Dancing to this amazing song! #dance #viral');
formData.append('type', 'reel');
formData.append('reelDuration', '60');
formData.append('videos', videoFile);
formData.append('song', audioFile);
formData.append('song.title', 'Amazing Song');
formData.append('song.artist', 'Great Artist');

const response = await fetch('/api/reels/comprehensive', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### Like a Post
```javascript
const response = await fetch('/api/posts/interactions?postId=postId', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    action: 'like'
  })
});
```

### Comment with Mention
```javascript
const response = await fetch('/api/comments/comprehensive', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    postId: 'postId',
    content: 'Great post! @username check this out #amazing',
    mentions: ['userId1', 'userId2']
  })
});
```

### Get Posts with Filters
```javascript
const response = await fetch('/api/posts/comprehensive?page=1&limit=10&type=post&category=general&following_posts=true', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `405`: Method Not Allowed
- `500`: Internal Server Error

## File Storage

### Directory Structure
```
public/
├── uploads/
│   └── users/
│       └── {userId}/
│           ├── images/
│           ├── videos/
│           ├── audio/
│           ├── posts/
│           └── stories/
```

### File Naming
Files are automatically renamed with format:
`{userId}_{timestamp}_{randomString}_{sanitizedOriginalName}.{extension}`

### Supported File Types
- **Images**: jpg, jpeg, png, gif, webp
- **Videos**: mp4, mov, avi, webm
- **Audio**: mp3, wav, m4a, aac

### File Size Limits
- **Images**: 10MB max
- **Videos**: 100MB max
- **Audio**: 50MB max

## Database Indexes

The system includes optimized indexes for:
- User queries by author
- Post queries by type, category, religion
- Interaction queries by user
- Time-based queries (createdAt, publishedAt)
- Search queries (hashtags, mentions)
- Privacy queries (isPublic, isActive)

## Performance Considerations

1. **Pagination**: All list endpoints support pagination
2. **Caching**: Consider implementing Redis for frequently accessed data
3. **CDN**: Use CDN for media file delivery
4. **Database**: Use MongoDB indexes for optimal query performance
5. **File Storage**: Consider moving to cloud storage for production

## Security Features

1. **Authentication**: JWT token validation
2. **Authorization**: User permission checks
3. **File Validation**: File type and size validation
4. **Input Sanitization**: XSS protection
5. **Rate Limiting**: Prevent abuse (implement as needed)
6. **Content Moderation**: Report and flag inappropriate content

This comprehensive API system provides all the features needed for a modern social media platform with posts, reels, and full social interaction capabilities.
