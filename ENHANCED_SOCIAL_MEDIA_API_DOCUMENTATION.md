# 🚀 Enhanced Social Media API Documentation

A comprehensive API system for managing posts, reels, stories, and admin functionality with advanced features like mentions, notifications, collaboration, and content moderation.

## 📋 **Features Overview**

### **Core Content Management**
- ✅ **Posts**: Create, read, update, delete posts with media support
- ✅ **Reels**: Video content with song/audio support and trending algorithms
- ✅ **Stories**: 24-hour auto-expiring content with mentions
- ✅ **Comments**: Nested comments with replies and mentions
- ✅ **Media**: Local file storage with public/private access

### **Social Features**
- ✅ **Mentions**: @username mentions with notifications
- ✅ **Hashtags**: #hashtag support with trending
- ✅ **Collaboration**: Request and manage content collaborations
- ✅ **Engagement**: Like, comment, share, save with real-time counts
- ✅ **Notifications**: Real-time notifications for all interactions

### **Admin Features**
- ✅ **Dashboard**: Comprehensive admin dashboard with analytics
- ✅ **User Management**: Block/unblock users (temporary/permanent)
- ✅ **Content Moderation**: Delete inappropriate content
- ✅ **Reports**: Handle user reports and take actions
- ✅ **Analytics**: Detailed statistics and insights

## 📁 **API Endpoints Structure**

```
/api/
├── posts/
│   ├── enhanced.ts              # Main posts API (CRUD)
│   └── [postId].ts             # Individual post operations
├── reels/
│   └── enhanced.ts             # Reels API with song support
├── stories/
│   └── enhanced.ts             # Stories API with 24h expiration
├── admin/
│   └── enhanced.ts             # Admin dashboard and management
├── notifications/
│   └── enhanced.ts             # Notifications management
└── reports/
    └── enhanced.ts             # Content reporting system
```

## 🔧 **Models**

### **EnhancedPost Model**
```typescript
interface IEnhancedPost {
  _id: string;
  author: ObjectId;
  content: string;
  media: IMediaFile[];
  type: 'post' | 'reel' | 'story';
  title?: string;
  description?: string;
  category: string;
  religion?: string;
  location?: string;
  
  // Social features
  mentions: ObjectId[];
  hashtags: string[];
  song?: ISong;
  collaborators: ObjectId[];
  collaborationRequests: ICollaborationRequest[];
  
  // Engagement
  likes: ObjectId[];
  likesCount: number;
  comments: IComment[];
  commentsCount: number;
  shares: ObjectId[];
  sharesCount: number;
  saves: ObjectId[];
  savesCount: number;
  views: ObjectId[];
  viewsCount: number;
  
  // Moderation
  isPublic: boolean;
  isActive: boolean;
  reported: boolean;
  expiresAt?: Date; // For stories
  
  createdAt: Date;
  updatedAt: Date;
}
```

### **Notification Model**
```typescript
interface INotification {
  _id: string;
  recipient: ObjectId;
  sender: ObjectId;
  type: 'mention' | 'like' | 'comment' | 'reply' | 'share' | 'collaboration_request' | 'collaboration_accepted' | 'collaboration_rejected' | 'follow' | 'story_view';
  content: string;
  relatedPost?: ObjectId;
  relatedComment?: ObjectId;
  relatedStory?: ObjectId;
  isRead: boolean;
  createdAt: Date;
}
```

### **Admin Model**
```typescript
interface IAdmin {
  _id: string;
  user: ObjectId;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: {
    canManageUsers: boolean;
    canDeleteContent: boolean;
    canBlockUsers: boolean;
    canViewAnalytics: boolean;
    canModerateContent: boolean;
    canManageReports: boolean;
  };
  isActive: boolean;
}
```

## 🚀 **API Endpoints**

### **1. Posts API**

#### **Create Post**
```bash
POST /api/posts/enhanced
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "content": "This is my post content with @username mention and #hashtag",
  "type": "post",
  "title": "Post Title",
  "description": "Post description",
  "category": "general",
  "religion": "hinduism",
  "location": "Mumbai, India",
  "media": [
    {
      "file": File, // Multipart file
      "url": "https://example.com/image.jpg" // Or existing URL
    }
  ],
  "mentions": ["userId1", "userId2"],
  "hashtags": ["trending", "viral"],
  "collaborators": ["userId3"]
}
```

#### **Get Posts**
```bash
GET /api/posts/enhanced?page=1&limit=10&type=post&category=general&search=keyword
Authorization: Bearer <jwt-token>
```

#### **Update Post**
```bash
PUT /api/posts/enhanced?postId=postId
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "content": "Updated content",
  "title": "Updated title",
  "collaborators": ["userId1", "userId2"]
}
```

#### **Delete Post**
```bash
DELETE /api/posts/enhanced?postId=postId
Authorization: Bearer <jwt-token>
```

### **2. Individual Post Operations**

#### **Get Specific Post**
```bash
GET /api/posts/[postId]
Authorization: Bearer <jwt-token>
```

#### **Post Actions**
```bash
POST /api/posts/[postId]
Authorization: Bearer <jwt-token>
Content-Type: application/json

# Like Post
{
  "action": "like"
}

# Comment on Post
{
  "action": "comment",
  "content": "Great post!",
  "mentions": ["userId1"]
}

# Reply to Comment
{
  "action": "reply",
  "commentId": "commentId",
  "content": "Thanks!",
  "mentions": ["userId2"]
}

# Share Post
{
  "action": "share"
}

# Save Post
{
  "action": "save"
}

# Request Collaboration
{
  "action": "collaborate",
  "message": "Let's collaborate on this!"
}

# Respond to Collaboration Request
{
  "action": "respond_collaboration",
  "requestId": "requestId",
  "status": "accepted" // or "rejected"
}
```

### **3. Reels API**

#### **Create Reel**
```bash
POST /api/reels/enhanced
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "content": "Check out this amazing reel! @username #viral",
  "title": "Amazing Reel",
  "description": "Description of the reel",
  "category": "entertainment",
  "media": [
    {
      "file": File, // Video file
      "url": "https://example.com/video.mp4"
    }
  ],
  "song": {
    "title": "Song Title",
    "artist": "Artist Name",
    "duration": 180,
    "audioUrl": "https://example.com/audio.mp3",
    "thumbnailUrl": "https://example.com/thumbnail.jpg"
  },
  "mentions": ["userId1"],
  "hashtags": ["dance", "music"],
  "collaborators": ["userId2"]
}
```

#### **Get Reels**
```bash
GET /api/reels/enhanced?page=1&limit=10&trending=true&category=entertainment
Authorization: Bearer <jwt-token>
```

### **4. Stories API**

#### **Create Story**
```bash
POST /api/stories/enhanced
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "content": "Story content with @username mention",
  "media": [
    {
      "file": File, // Image or video file
      "url": "https://example.com/story.jpg"
    }
  ],
  "mentions": ["userId1"],
  "hashtags": ["story"],
  "location": "Mumbai, India"
}
```

#### **Get Stories**
```bash
GET /api/stories/enhanced?page=1&limit=10&author=userId
Authorization: Bearer <jwt-token>
```

### **5. Admin API**

#### **Get Dashboard Data**
```bash
GET /api/admin/enhanced?type=stats&period=7d
Authorization: Bearer <admin-jwt-token>

# Available types:
# - stats: Detailed statistics
# - users: User management
# - content: Content moderation
# - reports: Report management
# - blocks: User blocks
# - overview: General overview
```

#### **Admin Actions**
```bash
POST /api/admin/enhanced
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

# Block User
{
  "action": "block_user",
  "targetId": "userId",
  "reason": "Inappropriate behavior",
  "type": "temporary", // or "permanent"
  "duration": 24 // hours for temporary blocks
}

# Unblock User
{
  "action": "unblock_user",
  "targetId": "userId"
}

# Delete Content
{
  "action": "delete_content",
  "targetId": "contentId",
  "reason": "Violates community guidelines"
}

# Review Report
{
  "action": "review_report",
  "targetId": "reportId",
  "reason": "Action taken"
}

# Create Admin
{
  "action": "create_admin",
  "targetId": "userId"
}
```

### **6. Notifications API**

#### **Get Notifications**
```bash
GET /api/notifications/enhanced?page=1&limit=20&unreadOnly=true
Authorization: Bearer <jwt-token>
```

#### **Mark as Read**
```bash
PUT /api/notifications/enhanced
Authorization: Bearer <jwt-token>
Content-Type: application/json

# Mark specific notifications
{
  "notificationIds": ["id1", "id2"]
}

# Mark all as read
{
  "markAll": true
}
```

#### **Delete Notification**
```bash
DELETE /api/notifications/enhanced?notificationId=notificationId
Authorization: Bearer <jwt-token>
```

### **7. Reports API**

#### **Create Report**
```bash
POST /api/reports/enhanced
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "contentId": "contentId",
  "contentType": "post", // or "reel", "story", "comment"
  "reason": "Inappropriate content",
  "description": "Detailed description of the issue"
}
```

#### **Get User Reports**
```bash
GET /api/reports/enhanced?page=1&limit=10&status=pending
Authorization: Bearer <jwt-token>
```

## 🔐 **Authentication**

All endpoints require JWT authentication:
```bash
Authorization: Bearer <jwt-token>
```

## 📊 **Response Format**

All API responses follow this format:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  },
  "error": "Error message (only in development)"
}
```

## 🗂️ **File Storage**

Files are stored locally in the following structure:
```
public/
├── uploads/
│   ├── users/
│   │   └── {userId}/
│   │       ├── posts/
│   │       ├── reels/
│   │       ├── stories/
│   │       └── profile_pictures/
│   └── assets/
│       ├── public/
│       └── private/
```

## ⚡ **Features**

### **Mentions System**
- Extract @username mentions from content
- Send notifications to mentioned users
- Support mentions in posts, comments, and replies

### **Hashtag System**
- Extract #hashtag from content
- Support trending hashtags
- Search by hashtags

### **Collaboration System**
- Request collaboration on posts/reels
- Accept/reject collaboration requests
- Manage collaborators

### **Story Expiration**
- Stories automatically expire after 24 hours
- MongoDB TTL index for automatic cleanup
- Soft delete for immediate removal

### **Admin Dashboard**
- Real-time statistics
- User management (block/unblock)
- Content moderation
- Report handling
- Analytics and insights

### **Notification System**
- Real-time notifications for all interactions
- Mark as read functionality
- Notification history

### **Content Reporting**
- Report inappropriate content
- Admin review and action
- Report status tracking

## 🚀 **Getting Started**

1. **Install Dependencies**
```bash
npm install mongoose bcryptjs jsonwebtoken multer
```

2. **Environment Variables**
```bash
MONGODB_URI=mongodb://localhost:27017/socialmedia
JWT_SECRET=your-jwt-secret
```

3. **Database Setup**
```bash
# The models will be created automatically when first used
```

4. **API Usage**
```bash
# Start your Next.js server
npm run dev

# Test the APIs using the endpoints above
```

## 📝 **Notes**

- All file uploads use local storage
- Stories automatically expire after 24 hours
- Admin permissions are role-based
- Notifications are sent for all social interactions
- Content can be reported and moderated
- Users can be blocked temporarily or permanently
- Collaboration requests can be sent and managed
- All APIs include proper error handling and validation

## 🔧 **Customization**

You can customize:
- File storage location and structure
- Story expiration time
- Admin permissions
- Notification types
- Content categories
- Report reasons
- Block durations

This comprehensive API system provides all the features requested for a modern social media platform with advanced admin capabilities.
