import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail: string;
  title: string;
  fileType: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const mediaItems: MediaItem[] = [];
    const basePublicPath = path.join(process.cwd(), 'public');

    // 1. Get all images from hinduism folder
    const hinduImagesPath = path.join(basePublicPath, 'images', 'religious', 'hinduism');
    let imageFiles: string[] = [];
    if (fs.existsSync(hinduImagesPath)) {
      imageFiles = fs.readdirSync(hinduImagesPath);
      
      imageFiles.forEach(file => {
        if (file.match(/\.(jpg|jpeg|png|gif)$/i)) {
          const imageUrl = `/images/religious/hinduism/${file}`;
          mediaItems.push({
            id: `image_${file}`,
            type: 'image',
            url: imageUrl,
            thumbnail: imageUrl, // For images, use the same image as thumbnail
            title: file.split('.')[0].replace(/-/g, ' ').replace(/_/g, ' '),
            fileType: path.extname(file).substring(1)
          });
        }
      });
    }

    // 2. Get all videos recursively from videos folder
    const videosPath = path.join(basePublicPath, 'videos');
    if (fs.existsSync(videosPath)) {
      function scanDirectory(dirPath: string) {
        const items = fs.readdirSync(dirPath);
        
        items.forEach(item => {
          const fullPath = path.join(dirPath, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            scanDirectory(fullPath);
          } else if (item.match(/\.(mp4|webm|ogg|mov)$/i)) {
            // Get relative path for URL
            const relativePath = path.relative(basePublicPath, fullPath);
            const videoUrl = '/' + relativePath.split(path.sep).join('/');
            
            // Look for thumbnail in hinduism images
            const thumbnailFile = imageFiles.find(img => 
              img.toLowerCase().includes(item.split('.')[0].toLowerCase())
            );
            
            const thumbnail = thumbnailFile 
              ? `/images/religious/hinduism/${thumbnailFile}`
              : imageFiles.length > 0 
                ? `/images/religious/hinduism/${imageFiles[0]}` // Use first image as default
                : '/default-thumbnail.jpg';

            mediaItems.push({
              id: `video_${item}`,
              type: 'video',
              url: videoUrl,
              thumbnail: thumbnail,
              title: item.split('.')[0].replace(/-/g, ' ').replace(/_/g, ' '),
              fileType: path.extname(item).substring(1)
            });
          }
        });
      }

      scanDirectory(videosPath);
    }

    // 3. Add external religious videos
    const externalVideos = [
      {
        id: 'external_video_1',
        type: 'video' as const,
        url: 'https://dhaneshwaritosscs-netizen.github.io/vedios/',
        thumbnail: imageFiles.length > 0 ? `/images/religious/hinduism/${imageFiles[0]}` : '/default-thumbnail.jpg',
        title: 'Hindu Religious Video 1',
        fileType: 'mp4'
      },
      {
        id: 'external_video_2',
        type: 'video' as const,
        url: 'https://dhaneshwaritosscs-netizen.github.io/vedio2/',
        thumbnail: imageFiles.length > 1 ? `/images/religious/hinduism/${imageFiles[1]}` : '/default-thumbnail.jpg',
        title: 'Hindu Religious Video 2',
        fileType: 'mp4'
      },
      {
        id: 'external_video_3',
        type: 'video' as const,
        url: 'https://dhaneshwaritosscs-netizen.github.io/vedio3/',
        thumbnail: imageFiles.length > 2 ? `/images/religious/hinduism/${imageFiles[2]}` : '/default-thumbnail.jpg',
        title: 'Hindu Religious Video 3',
        fileType: 'mp4'
      }
    ];

    mediaItems.push(...externalVideos);

    // Handle pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Handle filtering
    let filteredItems = [...mediaItems];
    if (req.query.type) {
      filteredItems = filteredItems.filter(item => item.type === req.query.type);
    }

    // Get total before pagination
    const total = filteredItems.length;

    // Apply pagination
    const paginatedItems = filteredItems.slice(startIndex, endIndex);

    return res.status(200).json({
      success: true,
      data: {
        items: paginatedItems,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          hasNextPage: endIndex < total,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching media:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching media content',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
