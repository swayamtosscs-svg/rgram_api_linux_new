# Local Storage Delete API Documentation

## Overview
This API allows you to delete uploaded files from local storage. The API supports deleting files by providing either the full file path or just the file name with folder information.

## Endpoint
```
DELETE /api/local-storage/delete
```

## Authentication
- **Required**: Bearer Token in Authorization header
- **Alternative**: User ID can be provided via `x-user-id` header or `userId` query parameter

## Request Methods

### Method 1: Delete by File Name and Folder
```json
{
  "fileName": "68e8ecfe819e345addde2deb_1761390050043_8byaqur88.jpg",
  "folder": "images"
}
```

### Method 2: Delete by Full File Path
```json
{
  "filePath": "/var/www/html/rgram_api_linux_new/public/uploads/68e8ecfe819e345addde2deb/images/68e8ecfe819e345addde2deb_1761390050043_8byaqur88.jpg"
}
```

## cURL Examples

### Example 1: Delete by File Name (Recommended)
```bash
curl -X DELETE "http://103.14.120.163:8081/api/local-storage/delete?userId=68e8ecfe819e345addde2deb" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGU4ZWNmZTgxOWUzNDVhZGRkZTJkZWIiLCJpYXQiOjE3NjEzODg1MTgsImV4cCI6MTc2Mzk4MDUxOH0.JBmqGX7y_YBFdNAdCUhiyZ2kuh3_JXx5HqHQz44-J5g" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "68e8ecfe819e345addde2deb_1761390050043_8byaqur88.jpg",
    "folder": "images"
  }'
```

### Example 2: Delete by File Path
```bash
curl -X DELETE "http://103.14.120.163:8081/api/local-storage/delete?userId=68e8ecfe819e345addde2deb" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGU4ZWNmZTgxOWUzNDVhZGRkZTJkZWIiLCJpYXQiOjE3NjEzODg1MTgsImV4cCI6MTc2Mzk4MDUxOH0.JBmqGX7y_YBFdNAdCUhiyZ2kuh3_JXx5HqHQz44-J5g" \
  -H "Content-Type: application/json" \
  -d '{
    "filePath": "/var/www/html/rgram_api_linux_new/public/uploads/68e8ecfe819e345addde2deb/images/68e8ecfe819e345addde2deb_1761390050043_8byaqur88.jpg"
  }'
```

### Example 3: Using Header for User ID
```bash
curl -X DELETE "http://103.14.120.163:8081/api/local-storage/delete" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGU4ZWNmZTgxOWUzNDVhZGRkZTJkZWIiLCJpYXQiOjE3NjEzODg1MTgsImV4cCI6MTc2Mzk4MDUxOH0.JBmqGX7y_YBFdNAdCUhiyZ2kuh3_JXx5HqHQz44-J5g" \
  -H "x-user-id: 68e8ecfe819e345addde2deb" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "68e8ecfe819e345addde2deb_1761390050043_8byaqur88.jpg",
    "folder": "images"
  }'
```

## Request Parameters

### Query Parameters
- `userId` (optional): User ID - can be provided in query params or header

### Headers
- `Authorization`: Bearer token (required)
- `x-user-id`: User ID (alternative to query param)
- `Content-Type`: application/json

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fileName` | string | Yes* | Name of the file to delete |
| `folder` | string | No | Folder name (default: "general") |
| `filePath` | string | Yes* | Full path to the file |

*Either `fileName` or `filePath` must be provided.

## Response Format

### Success Response (200)
```json
{
  "success": true,
  "message": "File deleted successfully",
  "data": {
    "deletedFile": {
      "fileName": "68e8ecfe819e345addde2deb_1761390050043_8byaqur88.jpg",
      "filePath": "/var/www/html/rgram_api_linux_new/public/uploads/68e8ecfe819e345addde2deb/images/68e8ecfe819e345addde2deb_1761390050043_8byaqur88.jpg",
      "publicUrl": "/uploads/68e8ecfe819e345addde2deb/images/68e8ecfe819e345addde2deb_1761390050043_8byaqur88.jpg",
      "size": 2693752,
      "deletedAt": "2025-10-25T11:05:30.123Z",
      "deletedBy": {
        "userId": "68e8ecfe819e345addde2deb",
        "username": "68e8ecfe819e345addde2deb",
        "fullName": "68e8ecfe819e345addde2deb"
      }
    }
  }
}
```

### Error Responses

#### 400 Bad Request - Missing User ID
```json
{
  "success": false,
  "message": "User ID is required. Provide userId in query params or x-user-id header"
}
```

#### 400 Bad Request - Missing File Information
```json
{
  "success": false,
  "message": "File path or file name is required"
}
```

#### 403 Forbidden - Access Denied
```json
{
  "success": false,
  "message": "Access denied: File does not belong to user"
}
```

#### 404 Not Found - File Not Found
```json
{
  "success": false,
  "message": "File not found"
}
```

#### 405 Method Not Allowed
```json
{
  "success": false,
  "message": "Method not allowed"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to delete file",
  "error": "Error details (only in development)"
}
```

## Folder Types
The API supports the following folder types:
- `images` - For image files (jpg, png, gif, etc.)
- `videos` - For video files (mp4, avi, mov, etc.)
- `audio` - For audio files (mp3, wav, aac, etc.)
- `documents` - For document files (pdf, doc, txt, etc.)
- `general` - Default folder for other file types

## Security Features
1. **User Isolation**: Users can only delete their own files
2. **Path Validation**: Full file paths are validated to ensure they belong to the user
3. **Authentication Required**: Bearer token authentication is mandatory
4. **Directory Cleanup**: Empty folders are automatically removed after file deletion

## Usage Examples

### Delete Display Picture
```bash
curl -X DELETE "http://103.14.120.163:8081/api/local-storage/delete?userId=68e8ecfe819e345addde2deb" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "68e8ecfe819e345addde2deb_1761390050043_8byaqur88.jpg",
    "folder": "images"
  }'
```

### Delete Video File
```bash
curl -X DELETE "http://103.14.120.163:8081/api/local-storage/delete?userId=68e8ecfe819e345addde2deb" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "video_1234567890.mp4",
    "folder": "videos"
  }'
```

### Delete Document
```bash
curl -X DELETE "http://103.14.120.163:8081/api/local-storage/delete?userId=68e8ecfe819e345addde2deb" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "document_1234567890.pdf",
    "folder": "documents"
  }'
```

## Notes
- The API automatically cleans up empty folders after file deletion
- File deletion is permanent and cannot be undone
- The API returns file information before deletion for confirmation
- All file operations are logged for audit purposes
- The API supports both relative and absolute file paths

## PowerShell Examples

### PowerShell - Delete by File Name
```powershell
$response = Invoke-RestMethod -Uri "http://103.14.120.163:8081/api/local-storage/delete?userId=68e8ecfe819e345addde2deb" -Method DELETE -Headers @{"Authorization"="Bearer YOUR_TOKEN_HERE"; "Content-Type"="application/json"} -Body '{"fileName": "68e8ecfe819e345addde2deb_1761390050043_8byaqur88.jpg", "folder": "images"}'
$response | ConvertTo-Json -Depth 10
```

### PowerShell - Delete by File Path
```powershell
$response = Invoke-RestMethod -Uri "http://103.14.120.163:8081/api/local-storage/delete?userId=68e8ecfe819e345addde2deb" -Method DELETE -Headers @{"Authorization"="Bearer YOUR_TOKEN_HERE"; "Content-Type"="application/json"} -Body '{"filePath": "/var/www/html/rgram_api_linux_new/public/uploads/68e8ecfe819e345addde2deb/images/68e8ecfe819e345addde2deb_1761390050043_8byaqur88.jpg"}'
$response | ConvertTo-Json -Depth 10
```

### PowerShell - Using Header for User ID
```powershell
$response = Invoke-RestMethod -Uri "http://103.14.120.163:8081/api/local-storage/delete" -Method DELETE -Headers @{"Authorization"="Bearer YOUR_TOKEN_HERE"; "x-user-id"="68e8ecfe819e345addde2deb"; "Content-Type"="application/json"} -Body '{"fileName": "68e8ecfe819e345addde2deb_1761390050043_8byaqur88.jpg", "folder": "images"}'
$response | ConvertTo-Json -Depth 10
```

## Testing
You can test the API using the provided cURL examples, PowerShell commands, or any HTTP client like Postman. Make sure to replace the bearer token and user ID with your actual values.

### Test Results
✅ **API Tested Successfully** - The delete API is working correctly and returns proper JSON responses with file deletion details.
