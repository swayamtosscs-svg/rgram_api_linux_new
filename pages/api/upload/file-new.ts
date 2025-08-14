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

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Ensure all required directories exist first
  const dirs = [
    path.join(process.cwd(), 'public'),
    path.join(process.cwd(), 'public/uploads'),
    path.join(process.cwd(), 'public/videos'),
    path.join(process.cwd(), 'public/images'),
  ];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const form = formidable({
    uploadDir: path.join(process.cwd(), 'public/uploads'),
    keepExtensions: true,
    maxFileSize: 500 * 1024 * 1024, // 500MB max file size for videos
    multiples: false,
  });

  return new Promise((resolve) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Form parsing error:', err);
        resolve(res.status(500).json({ error: 'Error uploading file' }));
        return;
      }

      try {
        const file = files.file?.[0];
        if (!file) {
          resolve(res.status(400).json({ error: 'No file uploaded' }));
          return;
        }

        // Determine if it's a video or image based on mimetype and extension
        const isVideo = file.mimetype?.startsWith('video/') || 
                       /\.(mp4|avi|mov|wmv|flv|mkv|webm)$/i.test(file.originalFilename || '');
        const isImage = file.mimetype?.startsWith('image/') || 
                       /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file.originalFilename || '');

        if (!isVideo && !isImage) {
          fs.unlinkSync(file.filepath);
          resolve(res.status(400).json({ error: 'File must be a video or image' }));
          return;
        }

        const targetDir = path.join(process.cwd(), 'public', isVideo ? 'videos' : 'images');
        const newFilename = `${Date.now()}_${file.originalFilename}`;
        const destinationPath = path.join(targetDir, newFilename);

        try {
          // Use copyFile instead of rename for better cross-device support
          fs.copyFileSync(file.filepath, destinationPath);
          fs.unlinkSync(file.filepath); // Clean up temp file

          const stats = fs.statSync(destinationPath);

          resolve(res.status(200).json({
            message: 'File uploaded successfully',
            filename: newFilename,
            path: `/${isVideo ? 'videos' : 'images'}/${newFilename}`,
            type: isVideo ? 'video' : 'image',
            size: stats.size,
            modifiedAt: stats.mtime
          }));
        } catch (copyError) {
          console.error('File copy error:', copyError);
          // Try to clean up if possible
          if (fs.existsSync(file.filepath)) {
            try { fs.unlinkSync(file.filepath); } catch {}
          }
          resolve(res.status(500).json({ error: 'Error saving file' }));
        }
      } catch (error) {
        console.error('Processing error:', error);
        resolve(res.status(500).json({ error: 'Error processing file' }));
      }
    });
  });
}
