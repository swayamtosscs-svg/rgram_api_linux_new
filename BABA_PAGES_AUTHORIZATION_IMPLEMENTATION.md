# Baba Pages Authorization Implementation

## Overview

This document describes the implementation of proper authorization for Baba Pages API, ensuring that only the creator of a Baba Page can perform destructive operations (create, update, delete) while allowing all users to view content and authenticated users to follow/unfollow pages.

## Changes Made

### 1. Database Model Updates

#### BabaPage Model (`lib/models/BabaPage.ts`)
- **Added `createdBy` field**: Tracks who created the Baba Page
- **Type**: `mongoose.Types.ObjectId` referencing the User model
- **Required**: Yes
- **Purpose**: Enables authorization checks for CRUD operations

```typescript
createdBy: {
  type: Schema.Types.ObjectId,
  ref: 'User',
  required: true
}
```

### 2. API Endpoint Authorization

#### Create Baba Page (`POST /api/baba-pages`)
- **Authentication**: Required
- **Authorization**: Any authenticated user can create a page
- **Changes**: 
  - Added authentication verification
  - Set `createdBy` field to the authenticated user's ID

#### Update Baba Page (`PUT /api/baba-pages/[id]`)
- **Authentication**: Required
- **Authorization**: Only the page creator can update
- **Changes**: 
  - Added authentication verification
  - Added creator ownership check
  - Returns 403 if user is not the creator

#### Delete Baba Page (`DELETE /api/baba-pages/[id]`)
- **Authentication**: Required
- **Authorization**: Only the page creator can delete
- **Changes**: 
  - Added authentication verification
  - Added creator ownership check
  - Returns 403 if user is not the creator

#### Posts CRUD Operations

##### Create Post (`POST /api/baba-pages/[id]/posts`)
- **Authentication**: Required
- **Authorization**: Only the page creator can create posts
- **Changes**: Added creator ownership check

##### Update Post (`PUT /api/baba-pages/[id]/posts/[postId]`)
- **Authentication**: Required
- **Authorization**: Only the page creator can update posts
- **Changes**: Added creator ownership check

##### Delete Post (`DELETE /api/baba-pages/[id]/posts/[postId]`)
- **Authentication**: Required
- **Authorization**: Only the page creator can delete posts
- **Changes**: Added creator ownership check

#### Videos CRUD Operations

##### Create Video (`POST /api/baba-pages/[id]/videos`)
- **Authentication**: Required
- **Authorization**: Only the page creator can create videos
- **Changes**: Added creator ownership check

##### Update Video (`PUT /api/baba-pages/[id]/videos/[videoId]`)
- **Authentication**: Required
- **Authorization**: Only the page creator can update videos
- **Changes**: Added creator ownership check

##### Delete Video (`DELETE /api/baba-pages/[id]/videos/[videoId]`)
- **Authentication**: Required
- **Authorization**: Only the page creator can delete videos
- **Changes**: Added creator ownership check

#### Stories CRUD Operations

##### Create Story (`POST /api/baba-pages/[id]/stories`)
- **Authentication**: Required
- **Authorization**: Only the page creator can create stories
- **Changes**: Added creator ownership check

##### Delete Story (`DELETE /api/baba-pages/[id]/stories/[storyId]`)
- **Authentication**: Required
- **Authorization**: Only the page creator can delete stories
- **Changes**: Added creator ownership check

### 3. Unchanged Operations (Working as Expected)

#### View/Read Operations (No Authentication Required)
- `GET /api/baba-pages` - List all pages
- `GET /api/baba-pages/[id]` - Get specific page
- `GET /api/baba-pages/[id]/posts` - Get page posts
- `GET /api/baba-pages/[id]/posts/[postId]` - Get specific post
- `GET /api/baba-pages/[id]/videos` - Get page videos
- `GET /api/baba-pages/[id]/videos/[videoId]` - Get specific video
- `GET /api/baba-pages/[id]/stories` - Get page stories
- `GET /api/baba-pages/[id]/stories/[storyId]` - Get specific story

#### Follow/Unfollow Operations (Authentication Required, No Creator Restriction)
- `POST /api/baba-pages/[id]/follow` - Follow a page
- `DELETE /api/baba-pages/[id]/follow` - Unfollow a page
- `POST /api/baba-pages/[id]/follow-simple` - Simple follow
- `DELETE /api/baba-pages/[id]/follow-simple` - Simple unfollow

## Authorization Flow

### For Create Operations
1. Verify authentication token
2. Extract user ID from token
3. Set `createdBy` field to user ID
4. Proceed with creation

### For Update/Delete Operations
1. Verify authentication token
2. Extract user ID from token
3. Fetch the Baba Page
4. Check if `page.createdBy` matches `user.id`
5. If match: proceed with operation
6. If no match: return 403 Forbidden

### For View Operations
1. No authentication required
2. Return public data to all users

### For Follow Operations
1. Verify authentication token
2. Allow any authenticated user to follow/unfollow
3. No creator restriction

## Error Responses

### Authentication Errors
```json
{
  "success": false,
  "message": "Authentication required"
}
```
**Status**: 401 Unauthorized

### Authorization Errors
```json
{
  "success": false,
  "message": "Only the page creator can [operation]"
}
```
**Status**: 403 Forbidden

### Invalid Token
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```
**Status**: 401 Unauthorized

## Security Benefits

1. **Data Protection**: Only page creators can modify or delete their content
2. **Prevents Abuse**: Users cannot delete or modify pages they didn't create
3. **Maintains Integrity**: Follow/unfollow functionality remains accessible to all authenticated users
4. **Public Access**: Content remains viewable by all users (authenticated and anonymous)
5. **Audit Trail**: `createdBy` field provides clear ownership tracking

## Migration Considerations

### Existing Data
- Existing Baba Pages without `createdBy` field will need to be updated
- Consider adding a migration script to set `createdBy` for existing pages
- May need to assign existing pages to a default admin user or handle gracefully

### API Compatibility
- All existing GET endpoints remain unchanged
- Follow/unfollow endpoints remain unchanged
- Only CREATE, UPDATE, DELETE operations now require proper authorization

## Testing Recommendations

1. **Test Creator Access**: Verify creators can perform all operations on their pages
2. **Test Non-Creator Access**: Verify non-creators get 403 errors for destructive operations
3. **Test Anonymous Access**: Verify anonymous users can view content but cannot perform destructive operations
4. **Test Follow Functionality**: Verify all authenticated users can follow/unfollow any page
5. **Test Token Validation**: Verify invalid/expired tokens are properly rejected

## Example Usage

### Creating a Page (Authenticated User)
```bash
curl -X POST "http://localhost:3000/api/baba-pages" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Baba Ramdev",
    "description": "Yoga guru and spiritual leader",
    "location": "Haridwar, India",
    "religion": "Hinduism"
  }'
```

### Updating a Page (Creator Only)
```bash
curl -X PUT "http://localhost:3000/api/baba-pages/PAGE_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer CREATOR_JWT_TOKEN" \
  -d '{
    "description": "Updated description"
  }'
```

### Following a Page (Any Authenticated User)
```bash
curl -X POST "http://localhost:3000/api/baba-pages/PAGE_ID/follow" \
  -H "Authorization: Bearer ANY_USER_JWT_TOKEN"
```

### Viewing Content (No Authentication Required)
```bash
curl -X GET "http://localhost:3000/api/baba-pages/PAGE_ID/posts"
```

This implementation ensures that Baba Pages are properly protected while maintaining the social media functionality that allows users to follow and view content from pages they don't own.
