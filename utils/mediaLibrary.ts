import cloudinary from './cloudinary';

/**
 * Media Library Utility Functions
 * Manages organized folder structure for user media using usernames
 */

export interface MediaFolderStructure {
  baseFolder: string;
  userFolder: string;
  mediaType: string;
  subFolder?: string;
}

export interface MediaItem {
  publicId: string;
  url: string;
  format: string;
  width: number;
  height: number;
  size: number;
  createdAt: string;
  folder: string;
  mediaType: string;
  username: string;
}

export interface UserMediaFolders {
  username: string;
  userId: string;
  folders: {
    dp: string;
    posts: string;
    stories: string;
    media: string;
  };
  totalFiles: number;
  filesByType: {
    dp: number;
    posts: number;
    stories: number;
    media: number;
  };
}

/**
 * Get the complete folder path for user media using username
 */
export function getUserMediaFolderPath(
  username: string, 
  mediaType: string, 
  subFolder?: string,
  baseFolder: string = 'users'
): string {
  if (subFolder) {
    return `${baseFolder}/${username}/${mediaType}/${subFolder}`;
  }
  return `${baseFolder}/${username}/${mediaType}`;
}

/**
 * Get all media folder paths for a user using username
 */
export function getUserAllMediaFolders(username: string, baseFolder: string = 'users'): {
  dp: string;
  posts: string;
  stories: string;
  media: string;
} {
  return {
    dp: getUserMediaFolderPath(username, 'dp', undefined, baseFolder),
    posts: getUserMediaFolderPath(username, 'posts', undefined, baseFolder),
    stories: getUserMediaFolderPath(username, 'stories', undefined, baseFolder),
    media: getUserMediaFolderPath(username, 'media', undefined, baseFolder)
  };
}

/**
 * Extract public ID from Cloudinary URL, handling different folder structures
 */
export function extractPublicIdFromUrl(url: string): string | null {
  if (!url || !url.includes('cloudinary')) {
    console.log('extractPublicIdFromUrl: URL does not contain cloudinary:', url);
    return null;
  }

  try {
    console.log('extractPublicIdFromUrl: Processing URL:', url);
    
    // Remove the base Cloudinary URL to get just the path
    let path = url;
    
    // Extract path after the domain
    if (url.includes('res.cloudinary.com')) {
      const domainIndex = url.indexOf('res.cloudinary.com');
      if (domainIndex !== -1) {
        const afterDomain = url.substring(domainIndex + 'res.cloudinary.com'.length);
        const slashIndex = afterDomain.indexOf('/');
        if (slashIndex !== -1) {
          path = afterDomain.substring(slashIndex + 1);
        }
      }
    }
    
    console.log('extractPublicIdFromUrl: Extracted path:', path);
    
    // Remove file extension
    const withoutExtension = path.split('.')[0];
    console.log('extractPublicIdFromUrl: Without extension:', withoutExtension);
    
    // Handle new structure: users/{username}/{mediaType}/{filename}
    if (withoutExtension.includes('/users/')) {
      const parts = withoutExtension.split('/');
      const usersIndex = parts.findIndex(part => part === 'users');
      if (usersIndex !== -1 && usersIndex + 3 < parts.length) {
        const publicId = parts.slice(usersIndex + 3).join('/');
        console.log('extractPublicIdFromUrl: New structure public ID:', publicId);
        return publicId;
      }
    }

    // Handle new structure with cloud name and version: {cloudName}/image/upload/v{version}/users/{username}/{mediaType}/{filename}
    if (withoutExtension.includes('/image/upload/')) {
      const parts = withoutExtension.split('/');
      const uploadIndex = parts.findIndex(part => part === 'upload');
      if (uploadIndex !== -1 && uploadIndex + 2 < parts.length) {
        // Skip the version part (v1756191446) and get everything after it
        const afterVersion = parts.slice(uploadIndex + 2);
        if (afterVersion.length >= 3 && afterVersion[0] === 'users') {
          const publicId = afterVersion.slice(2).join('/'); // Skip 'users' and username, get mediaType/filename
          console.log('extractPublicIdFromUrl: New structure with version public ID:', publicId);
          return publicId;
        }
      }
    }

    // Handle old structure: users/dp/{filename}
    if (withoutExtension.includes('/users/dp/')) {
      const parts = withoutExtension.split('/');
      const dpIndex = parts.findIndex(part => part === 'dp');
      if (dpIndex !== -1 && dpIndex + 1 < parts.length) {
        const publicId = parts.slice(dpIndex + 1).join('/');
        console.log('extractPublicIdFromUrl: Old structure public ID:', publicId);
        return publicId;
      }
    }

    // Fallback: use the entire path without extension
    console.log('extractPublicIdFromUrl: Fallback public ID:', withoutExtension);
    return withoutExtension;
    
  } catch (error) {
    console.error('extractPublicIdFromUrl: Error extracting public ID:', error);
    return null;
  }
}

/**
 * Delete a file from Cloudinary using its public ID
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    if (!publicId) {
      console.warn('No public ID provided for deletion');
      return false;
    }

    console.log('Deleting from Cloudinary with public ID:', publicId);
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      console.log('Successfully deleted from Cloudinary:', publicId);
      return true;
    } else {
      console.warn('Cloudinary deletion result:', result.result);
      return false;
    }
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
  }
}

/**
 * Get folder information from a Cloudinary URL
 */
export function getFolderInfoFromUrl(url: string): { 
  username?: string; 
  mediaType?: string; 
  baseFolder?: string;
  subFolder?: string;
} | null {
  if (!url || !url.includes('cloudinary')) {
    return null;
  }

  try {
    const urlParts = url.split('/');
    
    // Check for new structure: users/{username}/{mediaType}/{filename}
    if (url.includes('/users/')) {
      const usersIndex = urlParts.findIndex(part => part === 'users');
      if (usersIndex !== -1 && usersIndex + 2 < urlParts.length) {
        const username = urlParts[usersIndex + 1];
        const mediaType = urlParts[usersIndex + 2];
        
        return {
          username,
          mediaType,
          baseFolder: 'users'
        };
      }
    }

    // Check for old structure: users/dp/{filename}
    if (url.includes('/users/dp/')) {
      return {
        mediaType: 'dp',
        baseFolder: 'users'
      };
    }

    return null;
  } catch (error) {
    console.error('Error extracting folder info from URL:', error);
    return null;
  }
}

/**
 * List all media files in a specific user folder using username
 */
export async function listUserMediaFiles(
  username: string, 
  mediaType: string, 
  subFolder?: string
): Promise<MediaItem[]> {
  try {
    const folderPath = getUserMediaFolderPath(username, mediaType, subFolder);
    
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: folderPath,
      max_results: 100
    });

    return result.resources.map((resource: any) => ({
      publicId: resource.public_id,
      url: resource.secure_url,
      format: resource.format,
      width: resource.width,
      height: resource.height,
      size: resource.bytes,
      createdAt: resource.created_at,
      folder: folderPath,
      mediaType,
      username
    }));
  } catch (error) {
    console.error(`Error listing media files for ${mediaType}:`, error);
    return [];
  }
}

/**
 * Get comprehensive user media information using username
 */
export async function getUserMediaInfo(username: string): Promise<UserMediaFolders | null> {
  try {
    const folders = getUserAllMediaFolders(username);
    
    // Get file counts for each media type
    const dpFiles = await listUserMediaFiles(username, 'dp');
    const postsFiles = await listUserMediaFiles(username, 'posts');
    const storiesFiles = await listUserMediaFiles(username, 'stories');
    const mediaFiles = await listUserMediaFiles(username, 'media');

    const totalFiles = dpFiles.length + postsFiles.length + storiesFiles.length + mediaFiles.length;

    return {
      username,
      userId: '', // Will be filled by caller
      folders,
      totalFiles,
      filesByType: {
        dp: dpFiles.length,
        posts: postsFiles.length,
        stories: storiesFiles.length,
        media: mediaFiles.length
      }
    };
  } catch (error) {
    console.error('Error getting user media info:', error);
    return null;
  }
}

/**
 * Create user media folders structure using username (Cloudinary creates folders automatically on upload)
 */
export async function ensureUserMediaFolders(username: string): Promise<boolean> {
  try {
    // Cloudinary creates folders automatically when files are uploaded
    // This function can be used to verify folder structure exists
    const folders = getUserAllMediaFolders(username);
    
    console.log('User media folders structure for username:', username, folders);
    return true;
  } catch (error) {
    console.error('Error ensuring user media folders:', error);
    return false;
  }
}

/**
 * Clean up unused media files for a user using username
 */
export async function cleanupUnusedUserMedia(
  username: string, 
  mediaType: string, 
  currentFileUrls: string[]
): Promise<{ deleted: number; errors: number }> {
  try {
    const files = await listUserMediaFiles(username, mediaType);
    let deleted = 0;
    let errors = 0;

    for (const file of files) {
      // Check if this file is currently in use
      const isInUse = currentFileUrls.includes(file.url);
      
      if (!isInUse) {
        try {
          const success = await deleteFromCloudinary(file.publicId);
          if (success) {
            deleted++;
            console.log(`Deleted unused file: ${file.publicId}`);
          } else {
            errors++;
          }
        } catch (error) {
          console.error(`Error deleting file ${file.publicId}:`, error);
          errors++;
        }
      }
    }

    return { deleted, errors };
  } catch (error) {
    console.error('Error cleaning up unused media:', error);
    return { deleted: 0, errors: 1 };
  }
}

/**
 * Get media statistics for all users
 */
export async function getAllUsersMediaStats(): Promise<{
  totalUsers: number;
  totalFiles: number;
  totalSize: number;
  mediaTypeBreakdown: Record<string, number>;
}> {
  try {
    // This would require admin access to list all users
    // For now, return a placeholder structure
    return {
      totalUsers: 0,
      totalFiles: 0,
      totalSize: 0,
      mediaTypeBreakdown: {
        dp: 0,
        posts: 0,
        stories: 0,
        media: 0
      }
    };
  } catch (error) {
    console.error('Error getting all users media stats:', error);
    return {
      totalUsers: 0,
      totalFiles: 0,
      totalSize: 0,
      mediaTypeBreakdown: {
        dp: 0,
        posts: 0,
        stories: 0,
        media: 0
      }
    };
  }
}
