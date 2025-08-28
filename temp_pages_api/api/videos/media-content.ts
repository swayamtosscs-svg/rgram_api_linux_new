import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { fetchReligiousVideos } from '../../../lib/utils/videoFetcher';

interface MediaContent {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  title: string;
  description?: string;
  category: string;
  source: 'local' | 'youtube';
  fileType?: string;
  size?: number;
  duration?: string;
  dateAdded: Date;
  metadata?: {
    width?: number;
    height?: number;
    format?: string;
    [key: string]: any;
  };
}

class MediaHandler {
  private basePublicPath: string;
  private imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  private videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];

  constructor() {
    this.basePublicPath = path.join(process.cwd(), 'public');
  }

  private isImage(file: string): boolean {
    return this.imageExtensions.includes(path.extname(file).toLowerCase());
  }

  private isVideo(file: string): boolean {
    return this.videoExtensions.includes(path.extname(file).toLowerCase());
  }

  private formatTitle(filename: string): string {
    return filename
      .split('.')[0]
      .replace(/-/g, ' ')
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim();
  }

  private getFileSize(filepath: string): number {
    try {
      const stats = fs.statSync(filepath);
      return Number((stats.size / (1024 * 1024)).toFixed(2)); // Size in MB
    } catch (error) {
      console.error(`Error getting file size for ${filepath}:`, error);
      return 0;
    }
  }

  private findThumbnail(videoPath: string, filename: string): string {
    // Try multiple thumbnail locations
    const locations = [
      path.join(path.dirname(videoPath), 'thumbnails', `${filename}_thumb.jpg`),
      path.join(this.basePublicPath, 'images', 'religious', 'hinduism', `${filename}.jpg`),
      path.join(this.basePublicPath, 'images', 'religious', 'hinduism', `${filename}.png`)
    ];

    for (const loc of locations) {
      if (fs.existsSync(loc)) {
        return '/' + path.relative(this.basePublicPath, loc).split(path.sep).join('/');
      }
    }

    // If no thumbnail found, return first religious image as default
    const hinduImagesPath = path.join(this.basePublicPath, 'images', 'religious', 'hinduism');
    if (fs.existsSync(hinduImagesPath)) {
      const images = fs.readdirSync(hinduImagesPath).filter(file => this.isImage(file));
      if (images.length > 0) {
        return `/images/religious/hinduism/${images[0]}`;
      }
    }

    return '/images/default-thumbnail.jpg';
  }

  async getAllMedia(filters: {
    type?: 'image' | 'video';
    category?: string;
    source?: 'local' | 'youtube';
  } = {}): Promise<MediaContent[]> {
    const content: MediaContent[] = [];

    // Get local images
    const hinduImagesPath = path.join(this.basePublicPath, 'images', 'religious', 'hinduism');
    if (fs.existsSync(hinduImagesPath)) {
      const imageFiles = fs.readdirSync(hinduImagesPath);
      for (const file of imageFiles) {
        if (this.isImage(file)) {
          content.push({
            id: Buffer.from(file).toString('base64'),
            type: 'image',
            url: `/images/religious/hinduism/${file}`,
            title: this.formatTitle(file),
            category: 'hinduism',
            source: 'local',
            fileType: path.extname(file).substring(1),
            size: this.getFileSize(path.join(hinduImagesPath, file)),
            dateAdded: fs.statSync(path.join(hinduImagesPath, file)).mtime
          });
        }
      }
    }

    // Get local videos
    const videosPath = path.join(this.basePublicPath, 'videos');
    if (fs.existsSync(videosPath)) {
      const processDirectory = (dir: string) => {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const fullPath = path.join(dir, file);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            processDirectory(fullPath);
          } else if (this.isVideo(file)) {
            const relativePath = path.relative(this.basePublicPath, fullPath);
            const urlPath = '/' + relativePath.split(path.sep).join('/');
            
            content.push({
              id: Buffer.from(fullPath).toString('base64'),
              type: 'video',
              url: urlPath,
              thumbnail: this.findThumbnail(fullPath, path.parse(file).name),
              title: this.formatTitle(file),
              category: path.basename(path.dirname(fullPath)),
              source: 'local',
              fileType: path.extname(file).substring(1),
              size: this.getFileSize(fullPath),
              dateAdded: stat.mtime
            });
          }
        }
      };

      processDirectory(videosPath);
    }

    // Get YouTube videos if no source filter or if source is youtube
    if (!filters.source || filters.source === 'youtube') {
      try {
        const youtubeVideos = await fetchReligiousVideos('hinduism');
        content.push(...youtubeVideos.map(video => ({
          id: Buffer.from(video.videoUrl).toString('base64'),
          type: 'video' as const,
          url: video.videoUrl,
          thumbnail: video.thumbnail,
          title: video.title,
          description: video.description,
          category: 'hinduism',
          source: 'youtube' as const,
          dateAdded: new Date()
        })));
      } catch (error) {
        console.error('Error fetching YouTube videos:', error);
      }
    }

    // Apply filters
    let filteredContent = content;
    if (filters.type) {
      filteredContent = filteredContent.filter(item => item.type === filters.type);
    }
    if (filters.category) {
      filteredContent = filteredContent.filter(item => 
        item.category.toLowerCase() === filters.category!.toLowerCase()
      );
    }
    if (filters.source) {
      filteredContent = filteredContent.filter(item => item.source === filters.source);
    }

    // Sort by date added
    return filteredContent.sort((a, b) => b.dateAdded.getTime() - a.dateAdded.getTime());
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const mediaHandler = new MediaHandler();
    
    // Get filters from query parameters
    const filters = {
      type: req.query.type as 'image' | 'video' | undefined,
      category: req.query.category as string | undefined,
      source: req.query.source as 'local' | 'youtube' | undefined
    };

    // Get pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Get all media with filters
    const allContent = await mediaHandler.getAllMedia(filters);

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedContent = allContent.slice(startIndex, endIndex);

    return res.status(200).json({
      success: true,
      message: 'Media content fetched successfully',
      data: {
        content: paginatedContent,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(allContent.length / limit),
          totalItems: allContent.length,
          hasNextPage: endIndex < allContent.length,
          hasPrevPage: startIndex > 0,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Error in media handler:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
