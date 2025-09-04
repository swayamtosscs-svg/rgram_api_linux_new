# Assets API - Curl Commands

## 1. Upload Assets

### Upload Single File
```bash
curl -X POST "http://localhost:3000/api/assets/upload?userId=68b92530f6b30632560b9a3e" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@/path/to/your/file.jpg" \
  -F "folder=images"
```

### Upload Multiple Files
```bash
curl -X POST "http://localhost:3000/api/assets/upload?userId=68b92530f6b30632560b9a3e" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@/path/to/image1.jpg" \
  -F "file=@/path/to/video1.mp4" \
  -F "file=@/path/to/document1.pdf"
```

### Upload Video
```bash
curl -X POST "http://localhost:3000/api/assets/upload?userId=68b92530f6b30632560b9a3e" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@/path/to/your/video.mp4"
```

## 2. List Assets

### List All Assets
```bash
curl -X GET "http://localhost:3000/api/assets/list?userId=68b92530f6b30632560b9a3e" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### List with Pagination
```bash
curl -X GET "http://localhost:3000/api/assets/list?userId=68b92530f6b30632560b9a3e&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### List Images Only
```bash
curl -X GET "http://localhost:3000/api/assets/list?userId=68b92530f6b30632560b9a3e&folder=images" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### List Videos Only
```bash
curl -X GET "http://localhost:3000/api/assets/list?userId=68b92530f6b30632560b9a3e&folder=videos" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Search Files
```bash
curl -X GET "http://localhost:3000/api/assets/list?userId=68b92530f6b30632560b9a3e&search=geet" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 3. Delete Assets

### Delete by File Name (Auto-detect folder)
```bash
curl -X DELETE "http://localhost:3000/api/assets/delete?userId=68b92530f6b30632560b9a3e&fileName=geet_1756983590201_r4s20oss4.mp4" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Delete by File Name and Folder
```bash
curl -X DELETE "http://localhost:3000/api/assets/delete?userId=68b92530f6b30632560b9a3e&fileName=geet_1756983590201_r4s20oss4.mp4&folder=videos" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Delete using Request Body
```bash
curl -X DELETE "http://localhost:3000/api/assets/delete?userId=68b92530f6b30632560b9a3e" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"fileName": "geet_1756983590201_r4s20oss4.mp4", "folder": "videos"}'
```

## 4. Replace Assets

### Replace File
```bash
curl -X POST "http://localhost:3000/api/assets/replace?userId=68b92530f6b30632560b9a3e&existingFileName=old_file.jpg&existingFolder=images" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@/path/to/new_file.jpg"
```

### Replace File (Auto-detect existing file)
```bash
curl -X POST "http://localhost:3000/api/assets/replace?userId=68b92530f6b30632560b9a3e&existingFileName=old_file.jpg" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@/path/to/new_file.jpg"
```

## 5. Remote Server Commands

### Upload to Remote Server
```bash
curl -X POST "http://103.14.120.163:8081/api/assets/upload?userId=68b92530f6b30632560b9a3e" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@/path/to/your/file.jpg" \
  -F "folder=images"
```

### List from Remote Server
```bash
curl -X GET "http://103.14.120.163:8081/api/assets/list?userId=68b92530f6b30632560b9a3e" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Delete from Remote Server
```bash
curl -X DELETE "http://103.14.120.163:8081/api/assets/delete?userId=68b92530f6b30632560b9a3e&fileName=geet_1756983590201_r4s20oss4.mp4" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 6. Test Commands

### Test Upload with Sample Image
```bash
curl -X POST "http://localhost:3000/api/assets/upload?userId=68b92530f6b30632560b9a3e" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGEyYmE1MDNhOWY2NDE3YTE2OGFiYzkiLCJpYXQiOjE3NTY5NzQxMTIsImV4cCI6MTc1OTU2NjExMn0.s4gvCkQZFs0azP8WKlGccA7uB2rLuhCgeqIr2bAZ0cQ" \
  -F "file=@/path/to/test-image.jpg"
```

### Test List
```bash
curl -X GET "http://localhost:3000/api/assets/list?userId=68b92530f6b30632560b9a3e" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGEyYmE1MDNhOWY2NDE3YTE2OGFiYzkiLCJpYXQiOjE3NTY5NzQxMTIsImV4cCI6MTc1OTU2NjExMn0.s4gvCkQZFs0azP8WKlGccA7uB2rLuhCgeqIr2bAZ0cQ"
```

## Features

### File Organization
- Files are saved using **username** instead of user ID
- Structure: `/assets/geet/images/geet_timestamp_random.jpg`
- Automatic folder detection: images, videos, audio, documents, general

### Supported File Types
- **Images**: jpg, jpeg, png, gif, webp, etc.
- **Videos**: mp4, avi, mov, wmv, etc.
- **Audio**: mp3, wav, aac, ogg, etc.
- **Documents**: pdf, doc, docx, txt, etc.

### Query Parameters
- `userId`: Required - User ID
- `page`: Optional - Page number for pagination
- `limit`: Optional - Number of items per page
- `folder`: Optional - Filter by folder (images, videos, audio, documents, general)
- `type`: Optional - Filter by file type
- `search`: Optional - Search in file names

### Response Format
```json
{
  "success": true,
  "message": "Success message",
  "data": {
    "uploadedFiles": [...],
    "files": [...],
    "pagination": {...},
    "storageInfo": {
      "type": "assets",
      "basePath": "/assets",
      "userPath": "/assets/geet",
      "username": "geet",
      "userId": "68b92530f6b30632560b9a3e"
    }
  }
}
```
