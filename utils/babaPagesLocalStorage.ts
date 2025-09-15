import fs from 'fs';
import path from 'path';

export interface BabaPageLocalFileResult {
  success: boolean;
  data?: {
    fileName: string;
    filePath: string;
    publicUrl: string;
    fileSize: number;
    mimeType: string;
    dimensions?: {
      width: number;
      height: number;
    };
    duration?: number;
  };
  error?: string;
}

export interface BabaPageLocalFileDeleteResult {
  success: boolean;
  error?: string;
}

/**
 * Create directory structure for baba page local file storage
 */
export function ensureBabaPageDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Generate unique filename for baba page content
 */
export function generateBabaPageFileName(
  originalName: string, 
  pageId: string, 
  mediaType: 'posts' | 'videos' | 'stories' | 'dp'
): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substr(2, 9);
  const extension = path.extname(originalName);
  const baseName = path.basename(originalName, extension);
  
  // Sanitize filename by removing spaces and special characters
  const sanitizedBaseName = baseName
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/[^a-zA-Z0-9._-]/g, '') // Remove special characters except dots, underscores, and hyphens
    .substring(0, 50); // Limit length to 50 characters
  
  return `${mediaType}_${pageId}_${timestamp}_${randomString}_${sanitizedBaseName}${extension}`;
}

/**
 * Get baba page folder path for local storage
 */
export function getBabaPageLocalFolderPath(
  pageId: string, 
  mediaType: 'posts' | 'videos' | 'stories' | 'dp'
): string {
  return path.join(process.cwd(), 'public', 'uploads', 'baba-pages', pageId, mediaType);
}

/**
 * Upload file to local storage for baba page
 */
export async function uploadBabaPageFileToLocal(
  file: File,
  pageId: string,
  mediaType: 'posts' | 'videos' | 'stories' | 'dp',
  subFolder?: string
): Promise<BabaPageLocalFileResult> {
  try {
    if (!file || file.size === 0) {
      return {
        success: false,
        error: 'No file provided or file is empty'
      };
    }

    // Create directory structure: public/uploads/baba-pages/{pageId}/{mediaType}/
    const uploadDir = getBabaPageLocalFolderPath(pageId, mediaType);
    if (subFolder) {
      const finalDir = path.join(uploadDir, subFolder);
      ensureBabaPageDirectoryExists(finalDir);
    } else {
      ensureBabaPageDirectoryExists(uploadDir);
    }

    // Generate unique filename
    const fileName = generateBabaPageFileName(file.name, pageId, mediaType);
    const finalDir = subFolder ? path.join(uploadDir, subFolder) : uploadDir;
    const filePath = path.join(finalDir, fileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    fs.writeFileSync(filePath, buffer);

    // Generate public URL
    const publicUrl = subFolder 
      ? `/uploads/baba-pages/${pageId}/${mediaType}/${subFolder}/${fileName}`
      : `/uploads/baba-pages/${pageId}/${mediaType}/${fileName}`;

    // Get file stats
    const stats = fs.statSync(filePath);

    // Get dimensions for images (placeholder for now)
    let dimensions: { width: number; height: number } | undefined = undefined;
    if (file.type.startsWith('image/')) {
      // You can add image dimension detection here using libraries like 'sharp'
      dimensions = undefined;
    }

    // Get duration for videos (placeholder for now)
    let duration: number | undefined = undefined;
    if (file.type.startsWith('video/')) {
      // You can add video duration detection here using libraries like 'ffprobe'
      duration = undefined;
    }

    return {
      success: true,
      data: {
        fileName,
        filePath,
        publicUrl,
        fileSize: stats.size,
        mimeType: file.type,
        dimensions,
        duration
      }
    };

  } catch (error) {
    console.error('Error uploading baba page file to local storage:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown upload error'
    };
  }
}

/**
 * Delete file from local storage for baba page
 */
export async function deleteBabaPageFileFromLocal(filePath: string): Promise<BabaPageLocalFileDeleteResult> {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return {
        success: true, // Consider not found as success since file is gone
        error: 'File not found (may already be deleted)'
      };
    }

    // Delete the file
    fs.unlinkSync(filePath);

    // Try to remove empty parent directories
    const parentDir = path.dirname(filePath);
    try {
      if (fs.existsSync(parentDir)) {
        const files = fs.readdirSync(parentDir);
        if (files.length === 0) {
          fs.rmdirSync(parentDir);
          
          // Try to remove grandparent directory if it's also empty
          const grandParentDir = path.dirname(parentDir);
          if (fs.existsSync(grandParentDir)) {
            const parentFiles = fs.readdirSync(grandParentDir);
            if (parentFiles.length === 0) {
              fs.rmdirSync(grandParentDir);
            }
          }
        }
      }
    } catch (dirError) {
      // Ignore directory removal errors
      console.log('Could not remove empty directory:', parentDir);
    }

    return { success: true };

  } catch (error) {
    console.error('Error deleting baba page file from local storage:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown deletion error'
    };
  }
}

/**
 * Delete file by public URL for baba page
 */
export async function deleteBabaPageFileByUrl(publicUrl: string): Promise<BabaPageLocalFileDeleteResult> {
  try {
    // Convert public URL to file path
    const filePath = path.join(process.cwd(), 'public', publicUrl);
    return await deleteBabaPageFileFromLocal(filePath);
  } catch (error) {
    console.error('Error deleting baba page file by URL:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown deletion error'
    };
  }
}

/**
 * List files in a baba page directory
 */
export async function listBabaPageFiles(
  pageId: string,
  mediaType: 'posts' | 'videos' | 'stories' | 'dp',
  subFolder?: string
): Promise<{
  success: boolean;
  data?: {
    files: Array<{
      fileName: string;
      filePath: string;
      publicUrl: string;
      fileSize: number;
      createdAt: Date;
    }>;
  };
  error?: string;
}> {
  try {
    const uploadDir = getBabaPageLocalFolderPath(pageId, mediaType);
    const finalDir = subFolder ? path.join(uploadDir, subFolder) : uploadDir;
    
    if (!fs.existsSync(finalDir)) {
      return {
        success: true,
        data: {
          files: []
        }
      };
    }

    const files = fs.readdirSync(finalDir);
    const fileStats = files.map(fileName => {
      const filePath = path.join(finalDir, fileName);
      const stats = fs.statSync(filePath);
      const publicUrl = subFolder 
        ? `/uploads/baba-pages/${pageId}/${mediaType}/${subFolder}/${fileName}`
        : `/uploads/baba-pages/${pageId}/${mediaType}/${fileName}`;
      
      return {
        fileName,
        filePath,
        publicUrl,
        fileSize: stats.size,
        createdAt: stats.birthtime
      };
    });

    // Sort by creation date (newest first)
    fileStats.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return {
      success: true,
      data: {
        files: fileStats
      }
    };

  } catch (error) {
    console.error('Error listing baba page files:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get baba page media statistics
 */
export async function getBabaPageMediaStats(pageId: string): Promise<{
  success: boolean;
  data?: {
    totalFiles: number;
    totalSize: number;
    mediaTypeBreakdown: {
      posts: number;
      videos: number;
      stories: number;
      dp: number;
    };
  };
  error?: string;
}> {
  try {
    const [postsResult, videosResult, storiesResult, dpResult] = await Promise.all([
      listBabaPageFiles(pageId, 'posts'),
      listBabaPageFiles(pageId, 'videos'),
      listBabaPageFiles(pageId, 'stories'),
      listBabaPageFiles(pageId, 'dp')
    ]);

    const postsFiles = postsResult.data?.files || [];
    const videosFiles = videosResult.data?.files || [];
    const storiesFiles = storiesResult.data?.files || [];
    const dpFiles = dpResult.data?.files || [];

    const totalFiles = postsFiles.length + videosFiles.length + storiesFiles.length + dpFiles.length;
    const totalSize = [...postsFiles, ...videosFiles, ...storiesFiles, ...dpFiles]
      .reduce((sum, file) => sum + file.fileSize, 0);

    return {
      success: true,
      data: {
        totalFiles,
        totalSize,
        mediaTypeBreakdown: {
          posts: postsFiles.length,
          videos: videosFiles.length,
          stories: storiesFiles.length,
          dp: dpFiles.length
        }
      }
    };

  } catch (error) {
    console.error('Error getting baba page media stats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Clean up unused files for a baba page
 */
export async function cleanupUnusedBabaPageFiles(
  pageId: string,
  mediaType: 'posts' | 'videos' | 'stories' | 'dp',
  currentFileUrls: string[]
): Promise<{ deleted: number; errors: number }> {
  try {
    const filesResult = await listBabaPageFiles(pageId, mediaType);
    if (!filesResult.success || !filesResult.data) {
      return { deleted: 0, errors: 1 };
    }

    const files = filesResult.data.files;
    let deleted = 0;
    let errors = 0;

    for (const file of files) {
      // Check if this file is currently in use
      const isInUse = currentFileUrls.includes(file.publicUrl);
      
      if (!isInUse) {
        try {
          const result = await deleteBabaPageFileFromLocal(file.filePath);
          if (result.success) {
            deleted++;
            console.log(`Deleted unused file: ${file.fileName}`);
          } else {
            errors++;
          }
        } catch (error) {
          console.error(`Error deleting file ${file.fileName}:`, error);
          errors++;
        }
      }
    }

    return { deleted, errors };
  } catch (error) {
    console.error('Error cleaning up unused baba page files:', error);
    return { deleted: 0, errors: 1 };
  }
}

/**
 * Extract file path from public URL for baba page local storage
 */
export function extractBabaPageFilePathFromUrl(publicUrl: string): string | null {
  if (!publicUrl || !publicUrl.startsWith('/uploads/baba-pages/')) {
    return null;
  }
  
  return path.join(process.cwd(), 'public', publicUrl);
}

/**
 * Validate file type for baba page local storage
 */
export function validateBabaPageFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Validate file size for baba page local storage
 */
export function validateBabaPageFileSize(file: File, maxSizeInBytes: number): boolean {
  return file.size <= maxSizeInBytes;
}
