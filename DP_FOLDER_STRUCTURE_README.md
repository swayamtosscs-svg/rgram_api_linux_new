# DP (Display Picture) Folder Structure - Cloudinary Organization

## Overview
This document describes the new folder structure for organizing user profile pictures (DPs) in Cloudinary. The new structure provides better organization and easier management of user content.

## New Folder Structure

### Before (Old Structure)
```
cloudinary/
└── users/
    └── dp/
        ├── dp_userId1_timestamp1.jpg
        ├── dp_userId2_timestamp2.jpg
        └── dp_userId3_timestamp3.jpg
```

### After (New Structure)
```
cloudinary/
└── user/
    ├── userId1/
    │   └── dp/
    │       ├── dp_timestamp1.jpg
    │       └── dp_timestamp2.jpg
    ├── userId2/
    │   └── dp/
    │       └── dp_timestamp3.jpg
    └── userId3/
        └── dp/
            └── dp_timestamp4.jpg
```

## Benefits of New Structure

1. **Better Organization**: Each user has their own dedicated folder
2. **Easier Management**: Can easily list, manage, and clean up files per user
3. **Scalability**: Better performance when searching for user-specific files
4. **Cleaner URLs**: More organized and readable public IDs
5. **Easier Cleanup**: Can remove entire user folders when needed

## API Endpoints

### 1. Upload DP
- **Endpoint**: `POST /api/dp/upload`
- **Folder**: `user/{userId}/dp/`
- **Public ID**: `dp_{timestamp}`

### 2. Replace DP
- **Endpoint**: `PUT /api/dp/replace`
- **Folder**: `user/{userId}/dp/`
- **Public ID**: `dp_{timestamp}`

### 3. Delete DP
- **Endpoint**: `DELETE /api/dp/delete`
- **Action**: Removes avatar from user profile and deletes from Cloudinary

### 4. Retrieve DP
- **Endpoint**: `GET /api/dp/retrieve?userId={userId}`
- **Action**: Returns current user avatar

### 5. List DP Files (New)
- **Endpoint**: `GET /api/dp/list?userId={userId}`
- **Action**: Lists all DP files in user's folder
- **Response**: Includes file details and current avatar status

### 6. Cleanup & Migration (New)
- **Endpoint**: `POST /api/dp/cleanup`
- **Actions**:
  - `migrate`: Analyze old structure files for migration
  - `cleanup`: Remove unused DP files
  - `list-old`: List files in old folder structure

## Utility Functions

### `cloudinaryFolders.ts`
- `getUserFolderPath(userId, type, baseFolder)`: Generate folder path
- `extractPublicIdFromUrl(url)`: Extract public ID from Cloudinary URL
- `deleteFromCloudinary(publicId)`: Delete file from Cloudinary
- `getFolderInfoFromUrl(url)`: Extract folder information from URL
- `validateFolderStructure(url, expectedStructure)`: Validate folder structure

## Migration from Old Structure

### Automatic Handling
- New uploads automatically use the new folder structure
- Old DPs are automatically detected and deleted when replaced
- Both old and new folder structures are supported for deletion

### Manual Migration
Use the cleanup endpoint to analyze and plan migration:

```bash
# List old structure files
POST /api/dp/cleanup
{
  "userId": "user123",
  "action": "list-old"
}

# Analyze migration needs
POST /api/dp/cleanup
{
  "userId": "user123",
  "action": "migrate"
}

# Clean up unused files
POST /api/dp/cleanup
{
  "userId": "user123",
  "action": "cleanup"
}
```

## Example Usage

### Upload New DP
```javascript
const formData = new FormData();
formData.append('dp', file);
formData.append('userId', 'user123');

const response = await fetch('/api/dp/upload', {
  method: 'POST',
  body: formData
});
```

### List User's DP Files
```javascript
const response = await fetch('/api/dp/list?userId=user123');
const data = await response.json();

console.log('User DPs:', data.data.files);
console.log('Current avatar:', data.data.currentAvatar);
```

## File Naming Convention

- **Format**: `dp_{timestamp}`
- **Example**: `dp_1703123456789`
- **Location**: `user/{userId}/dp/dp_{timestamp}`

## Error Handling

- **Missing User ID**: Returns 400 error
- **File Validation**: Checks file type (image only) and size (max 5MB)
- **Cloudinary Errors**: Logged and handled gracefully
- **Database Errors**: Proper error responses with status codes

## Security Considerations

- User authentication required for all operations
- File type validation prevents malicious uploads
- File size limits prevent abuse
- User can only manage their own DPs

## Performance Optimizations

- Database connections are reused
- Cloudinary transformations are optimized
- File cleanup prevents accumulation of unused files
- Efficient public ID extraction from URLs

## Monitoring and Logging

- Comprehensive logging for all operations
- Cloudinary operation results are logged
- Error tracking and debugging information
- Performance metrics for upload/delete operations

## Future Enhancements

1. **Batch Operations**: Upload multiple DPs at once
2. **Version History**: Keep track of DP changes
3. **CDN Optimization**: Better caching strategies
4. **Image Processing**: Additional transformation options
5. **Backup System**: Automatic backup of user DPs

## Troubleshooting

### Common Issues

1. **File Not Uploading**: Check file size and type
2. **Old DP Not Deleted**: Verify Cloudinary credentials
3. **Folder Not Created**: Ensure Cloudinary permissions
4. **Database Errors**: Check MongoDB connection

### Debug Commands

```bash
# Check user's current folder structure
GET /api/dp/list?userId={userId}

# Verify old structure files
POST /api/dp/cleanup
{
  "userId": "{userId}",
  "action": "list-old"
}

# Test cleanup functionality
POST /api/dp/cleanup
{
  "userId": "{userId}",
  "action": "cleanup"
}
```

## Support

For issues or questions regarding the DP folder structure:
1. Check the logs for detailed error information
2. Verify Cloudinary configuration
3. Test with the provided debug endpoints
4. Review this documentation for usage patterns
