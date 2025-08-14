import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { type, filename } = req.query;

    // Validate required parameters
    if (!filename || typeof filename !== 'string') {
      return res.status(400).json({ error: 'Filename is required' });
    }

    if (!type || (type !== 'video' && type !== 'image')) {
      return res.status(400).json({ error: 'Valid type (video or image) is required' });
    }

    // Get the target file path
    const targetDir = path.join(process.cwd(), 'public', type === 'video' ? 'videos' : 'images');
    const targetPath = path.join(targetDir, filename);

    // Check if target file exists
    if (!fs.existsSync(targetPath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public/uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Configure formidable
    const form = formidable({
      uploadDir: uploadsDir,
      keepExtensions: true,
      maxFileSize: 100 * 1024 * 1024, // 100MB max file size
      multiples: false,
    });

    // Parse the form
    const [fields, files] = await form.parse(req);
    
    const file = files.file?.[0];
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate file type
    const isVideo = file.mimetype?.startsWith('video/');
    const isImage = file.mimetype?.startsWith('image/');
    const expectedType = type === 'video' ? 'video' : 'image';
    const actualType = isVideo ? 'video' : (isImage ? 'image' : 'unknown');

    if (actualType !== expectedType) {
      // Clean up invalid file
      fs.unlinkSync(file.filepath);
      return res.status(400).json({ 
        error: `File must be a ${expectedType}. Uploaded file is a ${actualType}`
      });
    }

    // Create a backup of the original file
    const backupDir = path.join(process.cwd(), 'public/backups', type === 'video' ? 'videos' : 'images');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    const backupPath = path.join(backupDir, `${filename}.${Date.now()}.bak`);
    fs.copyFileSync(targetPath, backupPath);

    try {
      // Replace the original file
      fs.copyFileSync(file.filepath, targetPath);
      fs.unlinkSync(file.filepath); // Clean up the temp file

      const stats = fs.statSync(targetPath);

      return res.status(200).json({
        message: 'File replaced successfully',
        filename: filename,
        path: `/${type === 'video' ? 'videos' : 'images'}/${filename}`,
        type: type,
        size: stats.size,
        modifiedAt: stats.mtime,
        backup: backupPath
      });

    } catch (error) {
      // If replacement fails, restore from backup
      fs.copyFileSync(backupPath, targetPath);
      throw error;
    }

  } catch (error) {
    console.error('Replace error:', error);
    return res.status(500).json({ error: 'Error replacing file' });
  }
}
