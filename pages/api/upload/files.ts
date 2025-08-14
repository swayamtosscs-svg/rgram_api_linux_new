import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { promises as fs } from 'fs';
import { existsSync, mkdirSync } from 'fs';

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
    const religiousDir = path.join(videosDir, 'religious');

    [publicDir, imagesDir, videosDir, religiousDir].forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    });

    // Determine which directories to check based on type
    const dirsToCheck = [];
    if (!requestedType || requestedType === 'image') {
      dirsToCheck.push(imagesDir);
    }
    if (!requestedType || requestedType === 'video') {
      dirsToCheck.push(videosDir, religiousDir);
    }

    const results = [];

    // Process each directory
    for (const dir of dirsToCheck) {
      try {
        const files = await fs.readdir(dir);
        
        for (const file of files) {
          try {
            const filePath = path.join(dir, file);
            const stats = await fs.stat(filePath);
            
            if (stats.isFile()) {
              const relativePath = path.relative(publicDir, filePath);
              const isVideo = dir.includes('videos');
              
              results.push({
                filename: file,
                path: '/' + relativePath.replace(/\\/g, '/'),
                type: isVideo ? 'video' : 'image',
                isReligious: dir.includes('religious'),
                size: stats.size,
                createdAt: stats.birthtime,
                modifiedAt: stats.mtime
              });
            }
          } catch (fileError) {
            console.error(`Error processing file ${file}:`, fileError);
          }
        }
      } catch (dirError) {
        console.error(`Error reading directory ${dir}:`, dirError);
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
