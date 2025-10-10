import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface VideoWithThumbnail {
  videoUrl: string;
  thumbnailUrl: string;
  title: string;
  fileType: string;
  size: number;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const basePublicPath = path.join(process.cwd(), 'public');
  const videosPath = path.join(basePublicPath, 'videos');
  const thumbnailsPath = path.join(basePublicPath, 'images', 'religious', 'hinduism');

  const videoFiles = fs.existsSync(videosPath) ? fs.readdirSync(videosPath) : [];
  const imageFiles = fs.existsSync(thumbnailsPath) ? fs.readdirSync(thumbnailsPath) : [];

  const videoList: VideoWithThumbnail[] = [];

  videoFiles.forEach(file => {
    if (file.match(/\.(mp4|webm|ogg|mov|avi)$/i)) {
      const videoUrl = `/videos/${file}`;
      // Use the first image in the hinduism folder as thumbnail
      const thumbnailUrl = imageFiles.length > 0 ? `/images/religious/hinduism/${imageFiles[0]}` : '/images/default-video-thumbnail.jpg';
      const title = file.split('.')[0].replace(/[-_]/g, ' ');
      const fileType = path.extname(file).substring(1);
      const stat = fs.statSync(path.join(videosPath, file));
      const size = Number((stat.size / (1024 * 1024)).toFixed(2));
      videoList.push({ videoUrl, thumbnailUrl, title, fileType, size });
    }
  });

  return res.status(200).json({
    success: true,
    message: 'Videos with thumbnails fetched successfully',
    data: videoList
  });
}
