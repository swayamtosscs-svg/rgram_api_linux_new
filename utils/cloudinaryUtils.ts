/**
 * Extract public ID from Cloudinary URL
 * Handles various Cloudinary URL formats
 */
export function extractPublicIdFromUrl(url: string): string | null {
  if (!url || !url.includes('cloudinary')) {
    return null;
  }

  try {
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1 || uploadIndex >= urlParts.length - 1) {
      console.error('Invalid Cloudinary URL format:', url);
      return null;
    }
    
    // Get everything after 'upload' and before the file extension
    const pathAfterUpload = urlParts.slice(uploadIndex + 2); // Skip 'upload' and version
    const publicIdWithExtension = pathAfterUpload.join('/');
    const publicId = publicIdWithExtension.split('.')[0];
    
    return publicId;
  } catch (error) {
    console.error('Error extracting public ID from URL:', error);
    return null;
  }
}

/**
 * Extract public ID from baba-pages specific URL
 * Expected format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/baba-pages/page_id/profile_pictures/timestamp.jpg
 */
export function extractBabaPagePublicId(url: string): string | null {
  if (!url || !url.includes('cloudinary') || !url.includes('baba-pages')) {
    return null;
  }

  try {
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1 || uploadIndex >= urlParts.length - 1) {
      console.error('Invalid Cloudinary URL format:', url);
      return null;
    }
    
    // Get everything after 'upload' and before the file extension
    const pathAfterUpload = urlParts.slice(uploadIndex + 2); // Skip 'upload' and version
    const publicIdWithExtension = pathAfterUpload.join('/');
    const publicId = publicIdWithExtension.split('.')[0];
    
    console.log('Extracted baba-page public ID:', publicId);
    return publicId;
  } catch (error) {
    console.error('Error extracting baba-page public ID from URL:', error);
    return null;
  }
}

/**
 * Validate Cloudinary URL format
 */
export function isValidCloudinaryUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  const cloudinaryPattern = /^https:\/\/res\.cloudinary\.com\/[^\/]+\/image\/upload\//;
  return cloudinaryPattern.test(url);
}

/**
 * Get Cloudinary folder from URL
 */
export function getCloudinaryFolder(url: string): string | null {
  const publicId = extractPublicIdFromUrl(url);
  if (!publicId) {
    return null;
  }
  
  const lastSlashIndex = publicId.lastIndexOf('/');
  if (lastSlashIndex === -1) {
    return null;
  }
  
  return publicId.substring(0, lastSlashIndex);
}
