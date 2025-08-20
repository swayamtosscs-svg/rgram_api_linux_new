import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { fetchReligiousVideos } from '../../../lib/utils/videoFetcher';

interface HinduContent {
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  title: string;
  description?: string;
  category: string;
  source?: 'local' | 'youtube';
  fileType?: string;
  size?: number;
  duration?: string;
}

// Function to recursively get all videos from a directory
function getVideosFromDirectory(dir: string, basePublicPath: string): HinduContent[] {
  const items: HinduContent[] = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Recursively get videos from subdirectories
      items.push(...getVideosFromDirectory(fullPath, basePublicPath));
    } else if (file.match(/\.(mp4|webm|ogg|mov|avi)$/i)) {
      // Get relative path from public directory
      const relativePath = path.relative(basePublicPath, fullPath);
      const urlPath = '/' + relativePath.split(path.sep).join('/');
      
      // Generate title from filename
      const title = file
        .split('.')[0]
        .replace(/-/g, ' ')
        .replace(/_/g, ' ')
        .replace(/([A-Z])/g, ' $1') // Add space before capital letters
        .trim();

      // Get file size in MB
      const fileSizeInMB = (stat.size / (1024 * 1024)).toFixed(2);

      // Check for thumbnail
      const thumbnailName = file.replace(/\.[^/.]+$/, "") + "_thumb.jpg";
      const thumbnailDir = path.join(path.dirname(fullPath), 'thumbnails');
      const thumbnailPath = path.join(thumbnailDir, thumbnailName);
      const thumbnailUrl = fs.existsSync(thumbnailPath) 
        ? '/' + path.relative(basePublicPath, thumbnailPath).split(path.sep).join('/')
        : '/images/hinduism/default-thumbnail.jpg';

      items.push({
        type: 'video',
        url: urlPath,
        thumbnail: thumbnailUrl,
        title: title,
        category: path.basename(path.dirname(fullPath)),
        source: 'local',
        fileType: path.extname(file).substring(1),
        size: Number(fileSizeInMB),
      });
    }
  }

  return items;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const content: HinduContent[] = [];
    const basePublicPath = path.join(process.cwd(), 'public');
    
    // Get local images from hinduism folder
    const hinduImagesPath = path.join(basePublicPath, 'images', 'religious', 'hinduism');
    if (fs.existsSync(hinduImagesPath)) {
      const imageFiles = fs.readdirSync(hinduImagesPath);
      
      imageFiles.forEach(file => {
        if (file.match(/\.(jpg|jpeg|png|gif)$/i)) {
          content.push({
            type: 'image',
            url: `/images/religious/hinduism/${file}`,
            title: file.split('.')[0].replace(/-/g, ' ').replace(/_/g, ' '),
            category: 'hinduism',
            source: 'local',
            fileType: path.extname(file).substring(1)
          });
        }
      });
    }

    // Get all videos from public/videos directory
    const videosPath = path.join(basePublicPath, 'videos');
    if (fs.existsSync(videosPath)) {
      const allVideos = getVideosFromDirectory(videosPath, basePublicPath);
      content.push(...allVideos);
    }

    // Fetch Hindu videos from YouTube
    const hinduVideos = await fetchReligiousVideos('hinduism');
    const processedVideos = hinduVideos.map(video => ({
      type: 'video' as const,
      url: video.videoUrl,
      thumbnail: video.thumbnail || '',
      title: video.title,
      description: video.description,
      category: 'hinduism'
    }));

    content.push(...processedVideos);

    // Apply filters based on query parameters
    let filteredContent = [...content];
    
    // Filter by type (video/image)
    if (req.query.type) {
      filteredContent = filteredContent.filter(item => item.type === req.query.type);
    }

    // Filter by category
    if (req.query.category) {
      filteredContent = filteredContent.filter(item => 
        item.category.toLowerCase() === (req.query.category as string).toLowerCase()
      );
    }

    // Filter by source (local/youtube)
    if (req.query.source) {
      filteredContent = filteredContent.filter(item => item.source === req.query.source);
    }

    // Filter by file type (mp4, webm, etc)
    if (req.query.fileType) {
      filteredContent = filteredContent.filter(item => item.fileType === req.query.fileType);
    }

    // Sort content by type (images first, then videos)
    const sortedContent = filteredContent.sort((a, b) => {
      if (a.type === 'image' && b.type === 'video') return -1;
      if (a.type === 'video' && b.type === 'image') return 1;
      return 0;
    });

    // Add pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const totalContent = sortedContent.length;
    const totalPages = Math.ceil(totalContent / limit);

    const paginatedContent = sortedContent.slice(startIndex, endIndex);

    return res.status(200).json({
      success: true,
      message: 'Hindu content fetched successfully',
      data: {
        content: paginatedContent,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalContent,
          hasNextPage: endIndex < totalContent,
          hasPrevPage: startIndex > 0,
          limit
        }
      }
    });

  } catch (error: unknown) {
    console.error('Error fetching Hindu content:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching Hindu content',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
