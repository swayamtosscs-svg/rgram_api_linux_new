# Comprehensive Post & Reel API Usage Examples

## 1. Create a Post with Media

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

## 2. Create a Reel with Song

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

## 3. Like a Post

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

## 4. Comment with Mention

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

## 5. Get Posts with Filters

```javascript
const response = await fetch('/api/posts/comprehensive?page=1&limit=10&type=post&category=general&following_posts=true', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## 6. Share a Post

```javascript
const response = await fetch('/api/posts/interactions?postId=postId', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    action: 'share'
  })
});
```

## 7. Save a Post

```javascript
const response = await fetch('/api/posts/interactions?postId=postId', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    action: 'save'
  })
});
```

## 8. Get Notifications

```javascript
const response = await fetch('/api/notifications/list?page=1&limit=20', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## 9. Update Post

```javascript
const response = await fetch('/api/posts/comprehensive?postId=postId', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    content: 'Updated post content',
    title: 'Updated title',
    hashtags: ['updated', 'content']
  })
});
```

## 10. Delete Post

```javascript
const response = await fetch('/api/posts/comprehensive?postId=postId', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```
