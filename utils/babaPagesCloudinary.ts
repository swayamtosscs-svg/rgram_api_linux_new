import cloudinary from './cloudinary';

/**
 * Cloudinary utility functions for Baba Pages (posts, videos, stories)
 * Manages organized folder structure for baba pages content
 */

export interface BabaPageMediaFolder {
  baseFolder: string;
  pageId: string;
  mediaType: string;
}

export interface BabaPageMediaItem {
  publicId: string;
  url: string;
  format: string;
  width: number;
  height: number;
  size: number;
  createdAt: string;
  folder: string;
  mediaType: string;
  pageId: string;
}

/**
 * Get the complete folder path for baba page content
 */
export function getBabaPageFolderPath(
  pageId: string, 
  mediaType: 'posts' | 'videos' | 'stories',
  baseFolder: string = 'baba-pages'
): string {
  return `${baseFolder}/${pageId}/${mediaType}`;
}

/**
 * Upload media file to Cloudinary for baba page
 */
export async function uploadBabaPageMedia(
  file: File,
  pageId: string,
  mediaType: 'posts' | 'videos' | 'stories',
  subFolder?: string
): Promise<{
  success: boolean;
  data?: {
    url: string;
    publicId: string;
    format: string;
    width: number;
    height: number;
    size: number;
  };
  error?: string;
}> {
  try {
    if (!file || file.size === 0) {
      return {
        success: false,
        error: 'No file provided or file is empty'
      };
    }

    const folderPath = getBabaPageFolderPath(pageId, mediaType);
    const finalFolder = subFolder ? `${folderPath}/${subFolder}` : folderPath;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const filename = `${mediaType}_${timestamp}_${randomString}`;

    // Upload to Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          public_id: `${finalFolder}/${filename}`,
          resource_type: 'auto',
          folder: finalFolder,
          use_filename: false,
          unique_filename: true,
          overwrite: false
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    if (!result || typeof result !== 'object' || !('secure_url' in result)) {
      return {
        success: false,
        error: 'Upload failed - no result from Cloudinary'
      };
    }

    return {
      success: true,
      data: {
        url: result.secure_url as string,
        publicId: result.public_id as string,
        format: result.format as string,
        width: result.width as number,
        height: result.height as number,
        size: result.bytes as number
      }
    };

  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown upload error'
    };
  }
}

/**
 * Delete media file from Cloudinary
 */
export async function deleteBabaPageMedia(publicId: string, resourceType: string = 'image'): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    if (!publicId) {
      return {
        success: false,
        error: 'No public ID provided for deletion'
      };
    }

    console.log('Deleting from Cloudinary with public ID:', publicId, 'resource type:', resourceType);
    
    // Try to determine resource type from public ID or URL
    let actualResourceType = resourceType;
    if (publicId.includes('video') || publicId.includes('.mp4') || publicId.includes('.mov')) {
      actualResourceType = 'video';
    }
    
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: actualResourceType
    });
    
    console.log('Cloudinary deletion result:', result);
    
    if (result.result === 'ok') {
      console.log('Successfully deleted from Cloudinary:', publicId);
      return { success: true };
    } else if (result.result === 'not found') {
      console.log('File not found in Cloudinary (may already be deleted):', publicId);
      return { success: true }; // Consider not found as success since file is gone
    } else {
      console.warn('Cloudinary deletion result:', result.result);
      return {
        success: false,
        error: `Deletion failed: ${result.result}`
      };
    }
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown deletion error'
    };
  }
}

/**
 * Extract public ID from Cloudinary URL for baba pages
 */
export function extractPublicIdFromBabaPageUrl(url: string): string | null {
  if (!url || !url.includes('cloudinary')) {
    return null;
  }

  try {
    console.log('Extracting public ID from URL:', url);
    
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
    
    console.log('Extracted path:', path);
    
    // Remove file extension
    const withoutExtension = path.split('.')[0];
    console.log('Without extension:', withoutExtension);
    
    // Handle structure with cloud name and version: {cloudName}/image/upload/v{version}/baba-pages/{pageId}/{mediaType}/{filename}
    if (withoutExtension.includes('/image/upload/')) {
      const parts = withoutExtension.split('/');
      const uploadIndex = parts.findIndex(part => part === 'upload');
      if (uploadIndex !== -1 && uploadIndex + 2 < parts.length) {
        // Skip the version part and get everything after it
        const afterVersion = parts.slice(uploadIndex + 2);
        console.log('After version:', afterVersion);
        if (afterVersion.length >= 3 && afterVersion[0] === 'baba-pages') {
          // Remove the duplicate 'baba-pages' part
          const publicId = afterVersion.slice(1).join('/'); // Skip 'baba-pages' and get the rest
          console.log('Extracted public ID (with version):', publicId);
          return publicId;
        }
      }
    }

    // Handle structure: baba-pages/{pageId}/{mediaType}/{filename}
    if (withoutExtension.includes('/baba-pages/')) {
      const parts = withoutExtension.split('/');
      const babaPagesIndex = parts.findIndex(part => part === 'baba-pages');
      if (babaPagesIndex !== -1) {
        const publicId = parts.slice(babaPagesIndex).join('/');
        console.log('Extracted public ID (direct):', publicId);
        return publicId;
      }
    }

    // Fallback: use the entire path without extension
    console.log('Fallback public ID:', withoutExtension);
    return withoutExtension;
    
  } catch (error) {
    console.error('Error extracting public ID from URL:', error);
    return null;
  }
}

/**
 * List all media files for a baba page
 */
export async function listBabaPageMedia(
  pageId: string,
  mediaType: 'posts' | 'videos' | 'stories'
): Promise<BabaPageMediaItem[]> {
  try {
    const folderPath = getBabaPageFolderPath(pageId, mediaType);
    
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
      pageId
    }));
  } catch (error) {
    console.error(`Error listing media files for ${mediaType}:`, error);
    return [];
  }
}

/**
 * Clean up unused media files for a baba page
 */
export async function cleanupUnusedBabaPageMedia(
  pageId: string,
  mediaType: 'posts' | 'videos' | 'stories',
  currentFileUrls: string[]
): Promise<{ deleted: number; errors: number }> {
  try {
    const files = await listBabaPageMedia(pageId, mediaType);
    let deleted = 0;
    let errors = 0;

    for (const file of files) {
      // Check if this file is currently in use
      const isInUse = currentFileUrls.includes(file.url);
      
      if (!isInUse) {
        try {
          const result = await deleteBabaPageMedia(file.publicId);
          if (result.success) {
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
 * Get media statistics for a baba page
 */
export async function getBabaPageMediaStats(pageId: string): Promise<{
  totalFiles: number;
  totalSize: number;
  mediaTypeBreakdown: {
    posts: number;
    videos: number;
    stories: number;
  };
}> {
  try {
    const [postsFiles, videosFiles, storiesFiles] = await Promise.all([
      listBabaPageMedia(pageId, 'posts'),
      listBabaPageMedia(pageId, 'videos'),
      listBabaPageMedia(pageId, 'stories')
    ]);

    const totalFiles = postsFiles.length + videosFiles.length + storiesFiles.length;
    const totalSize = [...postsFiles, ...videosFiles, ...storiesFiles]
      .reduce((sum, file) => sum + file.size, 0);

    return {
      totalFiles,
      totalSize,
      mediaTypeBreakdown: {
        posts: postsFiles.length,
        videos: videosFiles.length,
        stories: storiesFiles.length
      }
    };
  } catch (error) {
    console.error('Error getting baba page media stats:', error);
    return {
      totalFiles: 0,
      totalSize: 0,
      mediaTypeBreakdown: {
        posts: 0,
        videos: 0,
        stories: 0
      }
    };
  }
}

