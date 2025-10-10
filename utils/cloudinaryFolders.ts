import cloudinary from './cloudinary';

/**
 * Utility functions for managing Cloudinary folder structures
 */

export interface CloudinaryFolderConfig {
  baseFolder: string;
  userFolder: string;
  typeFolder: string;
}

/**
 * Get the complete folder path for user content
 */
export function getUserFolderPath(userId: string, type: string, baseFolder: string = 'user'): string {
  return `${baseFolder}/${userId}/${type}`;
}

/**
 * Extract public ID from Cloudinary URL, handling different folder structures
 */
export function extractPublicIdFromUrl(url: string): string | null {
  if (!url || !url.includes('cloudinary')) {
    return null;
  }

  try {
    // Handle new folder structure: user/{userId}/dp/{filename}
    if (url.includes('/user/') && url.includes('/dp/')) {
      const urlParts = url.split('/');
      const dpIndex = urlParts.findIndex(part => part === 'dp');
      if (dpIndex !== -1 && dpIndex + 1 < urlParts.length) {
        const filename = urlParts.slice(dpIndex + 1).join('/');
        return filename.split('.')[0]; // Remove file extension
      }
    }

    // Handle old folder structure: users/dp/{filename}
    if (url.includes('/users/dp/')) {
      const urlParts = url.split('/');
      const dpIndex = urlParts.findIndex(part => part === 'dp');
      if (dpIndex !== -1 && dpIndex + 1 < urlParts.length) {
        const filename = urlParts[dpIndex + 1];
        return filename.split('.')[0]; // Remove file extension
      }
    }

    // Fallback: extract from end of URL
    const filename = url.split('/').pop();
    return filename ? filename.split('.')[0] : null;
  } catch (error) {
    console.error('Error extracting public ID from URL:', error);
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
export function getFolderInfoFromUrl(url: string): { userId?: string; type?: string; baseFolder?: string } | null {
  if (!url || !url.includes('cloudinary')) {
    return null;
  }

  try {
    const urlParts = url.split('/');
    
    // Check for new structure: user/{userId}/dp/{filename}
    if (url.includes('/user/') && url.includes('/dp/')) {
      const userIndex = urlParts.findIndex(part => part === 'user');
      const dpIndex = urlParts.findIndex(part => part === 'dp');
      
      if (userIndex !== -1 && dpIndex !== -1 && userIndex + 1 < dpIndex) {
        const userId = urlParts[userIndex + 1];
        return {
          userId,
          type: 'dp',
          baseFolder: 'user'
        };
      }
    }

    // Check for old structure: users/dp/{filename}
    if (url.includes('/users/dp/')) {
      return {
        type: 'dp',
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
 * Validate if a URL follows the expected folder structure
 */
export function validateFolderStructure(url: string, expectedStructure: CloudinaryFolderConfig): boolean {
  const folderInfo = getFolderInfoFromUrl(url);
  
  if (!folderInfo) {
    return false;
  }

  return (
    folderInfo.baseFolder === expectedStructure.baseFolder &&
    folderInfo.type === expectedStructure.typeFolder
  );
}
