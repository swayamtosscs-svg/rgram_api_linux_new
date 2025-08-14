import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { promises as fs } from 'fs';
import { existsSync, mkdirSync } from 'fs';

// Function to recursively get all files from a directory
async function getAllFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? getAllFiles(fullPath) : fullPath;
  }));
  return files.flat();
}

// Function to check if a file is an image
function isImageFile(filename: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
  return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
}

// Function to check if a file is a video
function isVideoFile(filename: string): boolean {
  const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm'];
  return videoExtensions.some(ext => filename.toLowerCase().endsWith(ext));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { type } = req.query;
    const requestedType = typeof type === 'string' ? type : undefined;

    // Validate type parameter
    if (requestedType && requestedType !== 'video' && requestedType !== 'image') {
      return res.status(400).json({ error: 'Type must be either video or image' });
    }

    // Create directories if they don't exist
    const publicDir = path.join(process.cwd(), 'public');
    const imagesDir = path.join(publicDir, 'images');
    const videosDir = path.join(publicDir, 'videos');

    [publicDir, imagesDir, videosDir].forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    });

    // Get all files from public directory recursively
    const results = [];
    const allFiles = await getAllFiles(publicDir);

    for (const filePath of allFiles) {
      try {
        const relativePath = path.relative(publicDir, filePath);
        const isImage = isImageFile(filePath);
        const isVideo = isVideoFile(filePath);
        
        // Skip if we're filtering by type and this file doesn't match
        if (requestedType === 'image' && !isImage) continue;
        if (requestedType === 'video' && !isVideo) continue;
        if (!isImage && !isVideo) continue;

        const stats = await fs.stat(filePath);
        if (stats.isFile()) {
          results.push({
            filename: path.basename(filePath),
            path: '/' + relativePath.replace(/\\/g, '/'),
            type: isVideo ? 'video' : 'image',
            size: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime,
            fullPath: filePath
          });
        }
      } catch (error) {
        console.error(`Error processing file ${filePath}:`, error);
      }
    }

    // Sort files by creation date, newest first
    results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return res.status(200).json({
      total: results.length,
      files: results
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Error retrieving files' });
  }
}
