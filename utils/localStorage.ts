import fs from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';

export interface LocalFileResult {
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

export interface LocalFileDeleteResult {
  success: boolean;
  error?: string;
}

/**
 * Create directory structure for local file storage
 */
export function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Generate unique filename with timestamp
 */
export function generateUniqueFileName(originalName: string, userId: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substr(2, 9);
  const extension = path.extname(originalName);
  const baseName = path.basename(originalName, extension);
  
  // Sanitize filename by removing spaces and special characters
  const sanitizedBaseName = baseName
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/[^a-zA-Z0-9._-]/g, '') // Remove special characters except dots, underscores, and hyphens
    .substring(0, 50); // Limit length to 50 characters
  
  return `${userId}_${timestamp}_${randomString}_${sanitizedBaseName}${extension}`;
}

/**
 * Get file dimensions for images
 */
export async function getImageDimensions(filePath: string): Promise<{ width: number; height: number } | undefined> {
  try {
    // For now, return undefined - you can add image dimension detection later
    // This would require a library like 'sharp' or 'jimp'
    return undefined;
  } catch (error) {
    console.error('Error getting image dimensions:', error);
    return undefined;
  }
}

/**
 * Get video duration
 */
export async function getVideoDuration(filePath: string): Promise<number | undefined> {
  try {
    // For now, return undefined - you can add video duration detection later
    // This would require a library like 'ffprobe' or 'node-ffmpeg'
    return undefined;
  } catch (error) {
    console.error('Error getting video duration:', error);
    return undefined;
  }
}

/**
 * Upload file to local storage
 */
export async function uploadFileToLocal(
  file: File,
  userId: string,
  folderType: 'images' | 'videos' | 'documents' | 'profile_pictures' | 'posts' | 'stories' | 'audio' = 'images'
): Promise<LocalFileResult> {
  try {
    // Create directory structure: public/uploads/users/{userId}/{folderType}/
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'users', userId, folderType);
    ensureDirectoryExists(uploadDir);

    // Generate unique filename
    const fileName = generateUniqueFileName(file.name, userId);
    const filePath = path.join(uploadDir, fileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    fs.writeFileSync(filePath, buffer);

    // Generate public URL
    const publicUrl = `/uploads/users/${userId}/${folderType}/${fileName}`;

    // Get file stats
    const stats = fs.statSync(filePath);

    // Get dimensions for images
    let dimensions: { width: number; height: number } | undefined = undefined;
    if (file.type.startsWith('image/')) {
      dimensions = await getImageDimensions(filePath);
    }

    // Get duration for videos
    let duration: number | undefined = undefined;
    if (file.type.startsWith('video/')) {
      duration = await getVideoDuration(filePath);
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
    console.error('Error uploading file to local storage:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown upload error'
    };
  }
}

/**
 * Delete file from local storage
 */
export async function deleteFileFromLocal(filePath: string): Promise<LocalFileDeleteResult> {
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
        }
      }
    } catch (dirError) {
      // Ignore directory removal errors
      console.log('Could not remove empty directory:', parentDir);
    }

    return { success: true };

  } catch (error) {
    console.error('Error deleting file from local storage:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown deletion error'
    };
  }
}

/**
 * Delete file by public URL
 */
export async function deleteFileByUrl(publicUrl: string): Promise<LocalFileDeleteResult> {
  try {
    // Convert public URL to file path
    const filePath = path.join(process.cwd(), 'public', publicUrl);
    return await deleteFileFromLocal(filePath);
  } catch (error) {
    console.error('Error deleting file by URL:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown deletion error'
    };
  }
}

/**
 * Get file info by public URL
 */
export async function getFileInfo(publicUrl: string): Promise<{
  success: boolean;
  data?: {
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    exists: boolean;
  };
  error?: string;
}> {
  try {
    const filePath = path.join(process.cwd(), 'public', publicUrl);
    const fileName = path.basename(filePath);
    
    if (!fs.existsSync(filePath)) {
      return {
        success: true,
        data: {
          fileName,
          filePath,
          fileSize: 0,
          mimeType: '',
          exists: false
        }
      };
    }

    const stats = fs.statSync(filePath);
    
    return {
      success: true,
      data: {
        fileName,
        filePath,
        fileSize: stats.size,
        mimeType: '', // You can determine this from file extension
        exists: true
      }
    };

  } catch (error) {
    console.error('Error getting file info:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * List files in a directory
 */
export async function listFilesInDirectory(
  userId: string,
  folderType: string,
  page: number = 1,
  limit: number = 10
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
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
  error?: string;
}> {
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'users', userId, folderType);
    
    if (!fs.existsSync(uploadDir)) {
      return {
        success: true,
        data: {
          files: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: limit,
            hasNextPage: false,
            hasPrevPage: false
          }
        }
      };
    }

    const files = fs.readdirSync(uploadDir);
    const fileStats = files.map(fileName => {
      const filePath = path.join(uploadDir, fileName);
      const stats = fs.statSync(filePath);
      return {
        fileName,
        filePath,
        publicUrl: `/uploads/users/${userId}/${folderType}/${fileName}`,
        fileSize: stats.size,
        createdAt: stats.birthtime
      };
    });

    // Sort by creation date (newest first)
    fileStats.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Pagination
    const totalItems = fileStats.length;
    const totalPages = Math.ceil(totalItems / limit);
    const skip = (page - 1) * limit;
    const paginatedFiles = fileStats.slice(skip, skip + limit);

    return {
      success: true,
      data: {
        files: paginatedFiles,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    };

  } catch (error) {
    console.error('Error listing files:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Extract file path from public URL for local storage
 */
export function extractFilePathFromUrl(publicUrl: string): string | null {
  if (!publicUrl || !publicUrl.startsWith('/uploads/')) {
    return null;
  }
  
  return path.join(process.cwd(), 'public', publicUrl);
}

/**
 * Validate file type for local storage
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Validate file size for local storage
 */
export function validateFileSize(file: File, maxSizeInBytes: number): boolean {
  return file.size <= maxSizeInBytes;
}
