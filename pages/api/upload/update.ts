import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs/promises';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { filename, type } = req.query;
    const { newFilename } = req.body;

    if (!filename || typeof filename !== 'string') {
      return res.status(400).json({ error: 'Current filename is required' });
    }

    if (!type || (type !== 'video' && type !== 'image')) {
      return res.status(400).json({ error: 'Valid type (video or image) is required' });
    }

    if (!newFilename || typeof newFilename !== 'string') {
      return res.status(400).json({ error: 'New filename is required' });
    }

    // Construct file paths
    const folder = type === 'video' ? 'videos' : 'images';
    const currentPath = path.join(process.cwd(), 'public', folder, filename);
    const newPath = path.join(process.cwd(), 'public', folder, newFilename);

    // Check if source file exists
    try {
      await fs.access(currentPath);
    } catch {
      return res.status(404).json({ error: 'File not found' });
    }

    // Check if destination filename already exists
    try {
      await fs.access(newPath);
      return res.status(409).json({ error: 'A file with the new name already exists' });
    } catch {
      // This is good - we want the new filename to not exist
    }

    // Rename the file
    await fs.rename(currentPath, newPath);

    // Get updated file stats
    const stats = await fs.stat(newPath);

    res.status(200).json({
      message: 'File updated successfully',
      file: {
        filename: newFilename,
        path: `/${folder}/${newFilename}`,
        type: folder === 'videos' ? 'video' : 'image',
        size: stats.size,
        modifiedAt: stats.mtime
      }
    });

  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Error updating file' });
  }
}
