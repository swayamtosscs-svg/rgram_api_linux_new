import type { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs/promises';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { filename, type } = req.query;

    if (!filename || typeof filename !== 'string') {
      return res.status(400).json({ error: 'Filename is required' });
    }

    if (!type || (type !== 'video' && type !== 'image')) {
      return res.status(400).json({ error: 'Valid type (video or image) is required' });
    }

    // Construct the file path
    const folder = type === 'video' ? 'videos' : 'images';
    const filePath = path.join(process.cwd(), 'public', folder, filename);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete the file
    await fs.unlink(filePath);

    res.status(200).json({ 
      message: 'File deleted successfully',
      deletedFile: filename
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Error deleting file' });
  }
}
