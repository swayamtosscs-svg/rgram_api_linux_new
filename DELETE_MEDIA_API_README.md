# Delete Media API Documentation

## Endpoint
```
DELETE /api/media/delete?id={mediaId}
```

## Description
Deletes media from both Cloudinary cloud storage and the local MongoDB database using the provided media ID.

## Parameters

### Query Parameters
- `id` (required): The unique identifier of the media to delete

## Request Example
```bash
curl -X DELETE "http://localhost:3000/api/media/delete?id=68abed19a28e1fa778af9848"
```

## Response Format

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Media deleted successfully",
  "data": {
    "deletedMedia": {
      "mediaId": "68abed19a28e1fa778af9848",
      "publicId": "users/johndoe11/images/johndoe11_1756097814172",
      "secureUrl": "https://res.cloudinary.com/dtuxhmf4t/image/upload/v1756097818/users/johndoe11/images/johndoe11_1756097814172.jpg",
      "resourceType": "image",
      "title": "My Image",
      "uploadedBy": "68abecf0a28e1fa778af9845"
    },
    "deletedAt": "2025-08-25T05:00:00.000Z",
    "deletionStatus": {
      "cloudinary": "success",
      "database": "success"
    }
  }
}
```

### Error Responses

#### 400 Bad Request - Missing Media ID
```json
{
  "success": false,
  "error": "Media ID is required",
  "message": "Please provide a valid media ID"
}
```

#### 404 Not Found - Media Not Found
```json
{
  "success": false,
  "error": "Media not found",
  "message": "The specified media does not exist"
}
```

#### 500 Internal Server Error - Cloudinary Deletion Failed
```json
{
  "success": false,
  "error": "Failed to delete from Cloudinary",
  "message": "Media could not be deleted from cloud storage",
  details: "Error details from Cloudinary",
  "mediaInfo": {
    "mediaId": "68abed19a28e1fa778af9848",
    "publicId": "users/johndoe11/images/johndoe11_1756097814172",
    "secureUrl": "https://res.cloudinary.com/dtuxhmf4t/image/upload/v1756097818/users/johndoe11/images/johndoe11_1756097814172.jpg",
    "resourceType": "image",
    "title": "My Image",
    "uploadedBy": "68abecf0a28e1fa778af9845"
  }
}
```

#### 500 Internal Server Error - General Error
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "An unexpected error occurred while deleting media",
  "details": "Error details"
}
```

## Features

1. **Dual Deletion**: Deletes media from both Cloudinary and MongoDB
2. **Error Handling**: Comprehensive error handling for different failure scenarios
3. **Detailed Response**: Returns information about the deleted media and deletion status
4. **Resource Type Detection**: Automatically detects resource type for Cloudinary deletion
5. **Logging**: Detailed logging for debugging purposes
6. **Inline Schema**: Media schema defined inline to avoid import issues

## Environment Variables Required

Create a `.env.local` file in your project root with these variables:

```bash
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/your_database_name

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Testing

### 1. Simple Test
Use the provided test script:
```bash
node test-delete-simple.js
```

### 2. Manual Testing
Test with Postman or curl:
```bash
curl -X DELETE "http://localhost:3000/api/media/delete?id=test123"
```

### 3. Test with Real Media ID
```bash
curl -X DELETE "http://localhost:3000/api/media/delete?id=68abed19a28e1fa778af9848"
```

## Troubleshooting

### If you get a 500 Internal Server Error:

1. **Check Environment Variables**: Ensure all required environment variables are set
2. **Check MongoDB**: Make sure MongoDB is running and accessible
3. **Check Cloudinary**: Verify Cloudinary credentials are correct
4. **Check Console Logs**: Look for detailed error messages in the server console

### Common Issues:

1. **Missing MONGODB_URI**: Set the MongoDB connection string
2. **Invalid Cloudinary Credentials**: Check your Cloudinary API keys
3. **Database Connection Failed**: Ensure MongoDB is running
4. **Media Not Found**: Verify the media ID exists in your database

## Notes

- The API first deletes from Cloudinary, then from the database
- If Cloudinary deletion fails, the database record is preserved
- All responses include a `success` boolean flag for easy client-side handling
- The API automatically detects the resource type (image/video) for proper Cloudinary deletion
- Comprehensive logging is added for debugging purposes
- The Media schema is defined inline to avoid import path issues
