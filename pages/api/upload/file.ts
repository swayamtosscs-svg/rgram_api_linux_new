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

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Ensure all required directories exist first
  const dirs = [
    path.join(process.cwd(), 'public'),
    path.join(process.cwd(), 'public/uploads'),
    path.join(process.cwd(), 'public/videos'),
    path.join(process.cwd(), 'public/images'),
    path.join(process.cwd(), 'public/videos/religious'), // Add religious videos directory
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

  try {
    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const file = files.file?.[0];
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Determine if it's a video or image based on mimetype and extension
    const isVideo = file.mimetype?.startsWith('video/') || 
                   /\.(mp4|avi|mov|wmv|flv|mkv|webm)$/i.test(file.originalFilename || '');
    const isImage = file.mimetype?.startsWith('image/') || 
                   /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file.originalFilename || '');

    if (!isVideo && !isImage) {
      fs.unlinkSync(file.filepath);
      return res.status(400).json({ error: 'File must be a video or image' });
    }

    // If filename contains 'religious' and it's a video, put it in the religious folder
    const isReligiousVideo = isVideo && (
      file.originalFilename?.toLowerCase().includes('religious') || 
      fields.type?.[0] === 'religious'
    );
    
    // Determine target directory
    const targetDir = isReligiousVideo 
      ? path.join(process.cwd(), 'public/videos/religious')
      : path.join(process.cwd(), 'public', isVideo ? 'videos' : 'images');

    const newFilename = `${Date.now()}_${file.originalFilename}`;
    const destinationPath = path.join(targetDir, newFilename);

    try {
      // Use copyFile instead of rename for better cross-device support
      fs.copyFileSync(file.filepath, destinationPath);
      fs.unlinkSync(file.filepath); // Clean up temp file

      const stats = fs.statSync(destinationPath);
      const relativePath = path.relative(path.join(process.cwd(), 'public'), destinationPath);

      return res.status(200).json({
        message: 'File uploaded successfully',
        filename: newFilename,
        path: '/' + relativePath.replace(/\\/g, '/'),
        type: isVideo ? 'video' : 'image',
        isReligious: isReligiousVideo,
        size: stats.size,
        modifiedAt: stats.mtime
      });
    } catch (copyError) {
      console.error('File copy error:', copyError);
      // Try to clean up if possible
      if (fs.existsSync(file.filepath)) {
        try { fs.unlinkSync(file.filepath); } catch {}
      }
      return res.status(500).json({ error: 'Error saving file' });
    }
  } catch (error) {
    console.error('Processing error:', error);
    return res.status(500).json({ error: 'Error processing file' });
  }
};

export default handler;
